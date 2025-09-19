/**
 * Base class for file patching operations
 * Based on vscode-background extension architecture
 */

import { Utils } from '../core/Utils';

export enum PatchType {
    /** File has not been patched */
    None = 'none',
    /** File has been patched with an older version */
    Legacy = 'legacy', 
    /** File has been patched with the current version */
    Latest = 'latest'
}

export interface PatchInfo {
    /** Whether the file has been patched */
    hasPatches: boolean;
    /** Type of patches found */
    patchType: PatchType;
    /** Version string if found */
    version?: string;
    /** File size in bytes */
    fileSize: number;
    /** File hash for integrity checking */
    fileHash: string;
}

/**
 * Abstract base class for file patching operations
 */
export abstract class BasePatchFile {
    protected readonly PATCH_START_MARKER: string;
    protected readonly PATCH_END_MARKER: string;
    protected readonly VERSION_MARKER: string;
    protected readonly CURRENT_VERSION: string;

    constructor(
        protected readonly filePath: string,
        protected readonly extensionName: string = 'happy-zencode',
        protected readonly version: string = '1.0.0'
    ) {
        this.PATCH_START_MARKER = `// ${extensionName}-start`;
        this.PATCH_END_MARKER = `// ${extensionName}-end`;
        this.VERSION_MARKER = `${extensionName}.ver`;
        this.CURRENT_VERSION = version;
    }

    /**
     * Get file path being patched
     */
    public getFilePath(): string {
        return this.filePath;
    }

    /**
     * Check if file exists
     */
    public async exists(): Promise<boolean> {
        return Utils.fileExists(this.filePath);
    }

    /**
     * Check if file is writable
     */
    public async isWritable(): Promise<boolean> {
        return Utils.isWritable(this.filePath);
    }

    /**
     * Read file content
     */
    protected async getContent(): Promise<string> {
        if (!(await this.exists())) {
            throw new Error(`File does not exist: ${this.filePath}`);
        }
        return Utils.readFile(this.filePath);
    }

    /**
     * Write content to file
     */
    protected async writeContent(content: string): Promise<void> {
        await Utils.writeFile(this.filePath, content);
    }

    /**
     * Create backup of the file
     */
    public async createBackup(): Promise<string> {
        if (!(await this.exists())) {
            throw new Error(`Cannot backup non-existent file: ${this.filePath}`);
        }
        return Utils.createBackup(this.filePath);
    }

    /**
     * Restore file from backup
     */
    public async restoreFromBackup(backupPath: string): Promise<void> {
        await Utils.restoreBackup(this.filePath, backupPath);
    }

    /**
     * Get detailed patch information
     */
    public async getPatchInfo(): Promise<PatchInfo> {
        const content = await this.getContent();
        const fileSize = new TextEncoder().encode(content).length;
        const fileHash = Utils.calculateHash(content);

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
    public async hasPatches(): Promise<boolean> {
        const info = await this.getPatchInfo();
        return info.hasPatches;
    }

    /**
     * Get patch type
     */
    public async getPatchType(): Promise<PatchType> {
        const info = await this.getPatchInfo();
        return info.patchType;
    }

    /**
     * Remove all patches from file content
     */
    protected cleanPatches(content: string): string {
        // Remove patches between start and end markers
        const patchRegex = new RegExp(
            `\\n${this.PATCH_START_MARKER}[\\s\\S]*?${this.PATCH_END_MARKER}`,
            'g'
        );
        return content.replace(patchRegex, '');
    }

    /**
     * Apply patches to file
     */
    public abstract applyPatches(patchContent: string): Promise<boolean>;

    /**
     * Remove all patches from file
     */
    public abstract removePatches(): Promise<boolean>;

    /**
     * Restore file to original state
     */
    public async restore(): Promise<boolean> {
        try {
            const content = await this.getContent();
            const cleanContent = this.cleanPatches(content);
            
            // Only write if content actually changed
            if (content !== cleanContent) {
                await this.writeContent(cleanContent);
                Utils.debugLog(`Restored file: ${this.filePath}`);
            }
            
            return true;
        } catch (error) {
            Utils.debugLog(`Failed to restore file: ${this.filePath}`, error);
            return false;
        }
    }

    /**
     * Validate file integrity
     */
    public async validateIntegrity(): Promise<{ valid: boolean; issues: string[] }> {
        const issues: string[] = [];

        try {
            // Check if file exists
            if (!(await this.exists())) {
                issues.push('File does not exist');
                return { valid: false, issues };
            }

            // Check if file is readable
            try {
                await this.getContent();
            } catch (error) {
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

        } catch (error) {
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
    public async getFileStats(): Promise<{
        exists: boolean;
        size: number;
        writable: boolean;
        patchInfo: PatchInfo;
        integrity: { valid: boolean; issues: string[] };
    }> {
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