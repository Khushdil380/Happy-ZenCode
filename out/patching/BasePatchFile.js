"use strict";
/**
 * Base class for file patching operations
 * Based on vscode-background extension architecture
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePatchFile = exports.PatchType = void 0;
const Utils_1 = require("../core/Utils");
var PatchType;
(function (PatchType) {
    /** File has not been patched */
    PatchType["None"] = "none";
    /** File has been patched with an older version */
    PatchType["Legacy"] = "legacy";
    /** File has been patched with the current version */
    PatchType["Latest"] = "latest";
})(PatchType || (exports.PatchType = PatchType = {}));
/**
 * Abstract base class for file patching operations
 */
class BasePatchFile {
    constructor(filePath, extensionName = 'happy-zencode', version = '1.0.0') {
        this.filePath = filePath;
        this.extensionName = extensionName;
        this.version = version;
        this.PATCH_START_MARKER = `// ${extensionName}-start`;
        this.PATCH_END_MARKER = `// ${extensionName}-end`;
        this.VERSION_MARKER = `${extensionName}.ver`;
        this.CURRENT_VERSION = version;
    }
    /**
     * Get file path being patched
     */
    getFilePath() {
        return this.filePath;
    }
    /**
     * Check if file exists
     */
    async exists() {
        return Utils_1.Utils.fileExists(this.filePath);
    }
    /**
     * Check if file is writable
     */
    async isWritable() {
        return Utils_1.Utils.isWritable(this.filePath);
    }
    /**
     * Read file content
     */
    async getContent() {
        if (!(await this.exists())) {
            throw new Error(`File does not exist: ${this.filePath}`);
        }
        return Utils_1.Utils.readFile(this.filePath);
    }
    /**
     * Write content to file
     */
    async writeContent(content) {
        await Utils_1.Utils.writeFile(this.filePath, content);
    }
    /**
     * Create backup of the file
     */
    async createBackup() {
        if (!(await this.exists())) {
            throw new Error(`Cannot backup non-existent file: ${this.filePath}`);
        }
        return Utils_1.Utils.createBackup(this.filePath);
    }
    /**
     * Restore file from backup
     */
    async restoreFromBackup(backupPath) {
        await Utils_1.Utils.restoreBackup(this.filePath, backupPath);
    }
    /**
     * Get detailed patch information
     */
    async getPatchInfo() {
        const content = await this.getContent();
        const fileSize = new TextEncoder().encode(content).length;
        const fileHash = Utils_1.Utils.calculateHash(content);
        // Check for current version
        const currentVersionMarker = `${this.VERSION_MARKER}.${this.CURRENT_VERSION}`;
        if (content.includes(currentVersionMarker)) {
            return {
                hasPatches: true,
                patchType: PatchType.Latest,
                version: this.CURRENT_VERSION,
                fileSize,
                fileHash
            };
        }
        // Check for any version marker (legacy)
        if (content.includes(this.VERSION_MARKER)) {
            // Try to extract version
            const versionRegex = new RegExp(`${this.VERSION_MARKER}\\.(\\d+\\.\\d+\\.\\d+)`, 'g');
            const match = versionRegex.exec(content);
            const version = match ? match[1] : 'unknown';
            return {
                hasPatches: true,
                patchType: PatchType.Legacy,
                version,
                fileSize,
                fileHash
            };
        }
        return {
            hasPatches: false,
            patchType: PatchType.None,
            fileSize,
            fileHash
        };
    }
    /**
     * Check if file has been patched
     */
    async hasPatches() {
        const info = await this.getPatchInfo();
        return info.hasPatches;
    }
    /**
     * Get patch type
     */
    async getPatchType() {
        const info = await this.getPatchInfo();
        return info.patchType;
    }
    /**
     * Remove all patches from file content
     */
    cleanPatches(content) {
        // Remove patches between start and end markers
        const patchRegex = new RegExp(`\\n${this.PATCH_START_MARKER}[\\s\\S]*?${this.PATCH_END_MARKER}`, 'g');
        return content.replace(patchRegex, '');
    }
    /**
     * Restore file to original state
     */
    async restore() {
        try {
            const content = await this.getContent();
            const cleanContent = this.cleanPatches(content);
            // Only write if content actually changed
            if (content !== cleanContent) {
                await this.writeContent(cleanContent);
                Utils_1.Utils.debugLog(`Restored file: ${this.filePath}`);
            }
            return true;
        }
        catch (error) {
            Utils_1.Utils.debugLog(`Failed to restore file: ${this.filePath}`, error);
            return false;
        }
    }
    /**
     * Validate file integrity
     */
    async validateIntegrity() {
        const issues = [];
        try {
            // Check if file exists
            if (!(await this.exists())) {
                issues.push('File does not exist');
                return { valid: false, issues };
            }
            // Check if file is readable
            try {
                await this.getContent();
            }
            catch (error) {
                issues.push(`File is not readable: ${error}`);
            }
            // Check if file is writable
            if (!(await this.isWritable())) {
                issues.push('File is not writable (may need admin/sudo permissions)');
            }
            // Check for conflicting patches
            const content = await this.getContent();
            const patchStartCount = (content.match(new RegExp(this.PATCH_START_MARKER, 'g')) || []).length;
            const patchEndCount = (content.match(new RegExp(this.PATCH_END_MARKER, 'g')) || []).length;
            if (patchStartCount !== patchEndCount) {
                issues.push(`Mismatched patch markers: ${patchStartCount} start, ${patchEndCount} end`);
            }
            if (patchStartCount > 1) {
                issues.push(`Multiple patch sections found: ${patchStartCount}`);
            }
        }
        catch (error) {
            issues.push(`Validation error: ${error}`);
        }
        return {
            valid: issues.length === 0,
            issues
        };
    }
    /**
     * Get file statistics
     */
    async getFileStats() {
        const exists = await this.exists();
        if (!exists) {
            return {
                exists: false,
                size: 0,
                writable: false,
                patchInfo: {
                    hasPatches: false,
                    patchType: PatchType.None,
                    fileSize: 0,
                    fileHash: ''
                },
                integrity: { valid: false, issues: ['File does not exist'] }
            };
        }
        const [patchInfo, integrity, writable] = await Promise.all([
            this.getPatchInfo(),
            this.validateIntegrity(),
            this.isWritable()
        ]);
        return {
            exists,
            size: patchInfo.fileSize,
            writable,
            patchInfo,
            integrity
        };
    }
}
exports.BasePatchFile = BasePatchFile;
//# sourceMappingURL=BasePatchFile.js.map