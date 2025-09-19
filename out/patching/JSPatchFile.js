"use strict";
/**
 * JavaScript file patching for VS Code workbench
 * This is the core component that actually makes background images work
 * Based on vscode-background extension architecture
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JSPatchFile = void 0;
const vscode = __importStar(require("vscode"));
const BasePatchFile_1 = require("./BasePatchFile");
const Utils_1 = require("../core/Utils");
/**
 * JavaScript file patcher for VS Code workbench
 * Directly modifies workbench.desktop.main.js to inject background styles
 */
class JSPatchFile extends BasePatchFile_1.BasePatchFile {
    constructor(filePath) {
        super(filePath, 'happy-zencode', '1.0.0');
    }
    /**
     * Apply patches to the JavaScript file
     * This injects the background style generation code into VS Code's workbench
     */
    async applyPatches(patchContent) {
        try {
            // Use file locking to prevent concurrent modifications
            await this.lockFile();
            Utils_1.Utils.debugLog('Applying JS patches', { filePath: this.filePath });
            const currentContent = await this.getContent();
            let newContent = this.cleanPatches(currentContent);
            // Add the patch content with version markers
            const patchSection = [
                `\n${this.PATCH_START_MARKER} ${this.VERSION_MARKER}.${this.CURRENT_VERSION}`,
                patchContent,
                this.PATCH_END_MARKER
            ].join('\n');
            newContent += patchSection;
            // Only write if content actually changed
            if (currentContent === newContent) {
                Utils_1.Utils.debugLog('No changes needed, content is identical');
                return true;
            }
            // Try to write directly first
            const writeSuccess = await this.writeWithPermissions(newContent);
            if (writeSuccess) {
                Utils_1.Utils.debugLog('Successfully applied JS patches');
                return true;
            }
            else {
                Utils_1.Utils.debugLog('Failed to apply JS patches');
                return false;
            }
        }
        catch (error) {
            Utils_1.Utils.debugLog('Error applying JS patches', error);
            return false;
        }
        finally {
            await this.unlockFile();
        }
    }
    /**
     * Remove all patches from the JavaScript file
     */
    async removePatches() {
        try {
            await this.lockFile();
            Utils_1.Utils.debugLog('Removing JS patches', { filePath: this.filePath });
            const currentContent = await this.getContent();
            const cleanContent = this.cleanPatches(currentContent);
            // Only write if content actually changed
            if (currentContent === cleanContent) {
                Utils_1.Utils.debugLog('No patches to remove');
                return true;
            }
            const writeSuccess = await this.writeWithPermissions(cleanContent);
            if (writeSuccess) {
                Utils_1.Utils.debugLog('Successfully removed JS patches');
                return true;
            }
            else {
                Utils_1.Utils.debugLog('Failed to remove JS patches');
                return false;
            }
        }
        catch (error) {
            Utils_1.Utils.debugLog('Error removing JS patches', error);
            return false;
        }
        finally {
            await this.unlockFile();
        }
    }
    /**
     * Write content with elevated permissions if needed
     */
    async writeWithPermissions(content) {
        try {
            // Try normal write first
            await this.writeContent(content);
            return true;
        }
        catch (error) {
            Utils_1.Utils.debugLog('Normal write failed, trying with elevated permissions', error);
            // Try with elevated permissions using sudo-prompt
            return await this.writeWithSudo(content);
        }
    }
    /**
     * Write file with sudo/admin permissions
     */
    async writeWithSudo(content) {
        try {
            // Import sudo-prompt dynamically to handle missing dependency gracefully
            const sudo = require('@vscode/sudo-prompt');
            // Create temporary file first
            const tempPath = `${Utils_1.Utils.getTempDir()}/happy-zencode-${Utils_1.Utils.generateUUID()}.js`;
            await Utils_1.Utils.writeFile(tempPath, content);
            // Use platform-specific move command
            const moveCommand = process.platform === 'win32'
                ? `move /Y "${tempPath}" "${this.filePath}"`
                : `mv "${tempPath}" "${this.filePath}"`;
            return new Promise((resolve) => {
                sudo.exec(moveCommand, {
                    name: 'Happy Zencode Extension'
                }, (error) => {
                    if (error) {
                        Utils_1.Utils.debugLog('Sudo write failed', error);
                        // Clean up temp file
                        Utils_1.Utils.fileExists(tempPath).then(exists => {
                            if (exists) {
                                require('fs').promises.unlink(tempPath).catch(() => { });
                            }
                        });
                        resolve(false);
                    }
                    else {
                        Utils_1.Utils.debugLog('Sudo write successful');
                        resolve(true);
                    }
                });
            });
        }
        catch (error) {
            Utils_1.Utils.debugLog('Sudo write setup failed', error);
            // Show error message to user
            await vscode.window.showErrorMessage('Failed to modify VS Code files. Please run VS Code as Administrator (Windows) or use sudo (Mac/Linux).', 'Retry with Admin/Sudo');
            return false;
        }
    }
    async lockFile() {
        this.lockFilePath = `${this.filePath}.lock`;
        await Utils_1.Utils.writeFile(this.lockFilePath, 'locked');
    }
    async unlockFile() {
        if (this.lockFilePath && await Utils_1.Utils.fileExists(this.lockFilePath)) {
            try {
                require('fs').promises.unlink(this.lockFilePath);
            }
            catch (error) {
                Utils_1.Utils.debugLog('Failed to remove lock file', error);
            }
        }
    }
    /**
     * Check if VS Code needs restart after patching
     */
    async needsRestart() {
        const patchType = await this.getPatchType();
        return patchType === BasePatchFile_1.PatchType.None || patchType === BasePatchFile_1.PatchType.Legacy;
    }
    /**
     * Get human-readable status
     */
    async getStatus() {
        try {
            const patchType = await this.getPatchType();
            const needsRestart = await this.needsRestart();
            switch (patchType) {
                case BasePatchFile_1.PatchType.None:
                    return {
                        status: 'not-patched',
                        message: 'VS Code workbench has not been patched',
                        needsRestart: false
                    };
                case BasePatchFile_1.PatchType.Legacy:
                    return {
                        status: 'patched-legacy',
                        message: 'VS Code workbench has legacy patches (needs update)',
                        needsRestart
                    };
                case BasePatchFile_1.PatchType.Latest:
                    return {
                        status: 'patched-current',
                        message: 'VS Code workbench is up to date',
                        needsRestart: false
                    };
                default:
                    return {
                        status: 'error',
                        message: 'Unknown patch status',
                        needsRestart: false
                    };
            }
        }
        catch (error) {
            return {
                status: 'error',
                message: `Error checking status: ${error}`,
                needsRestart: false
            };
        }
    }
    /**
     * Perform safety checks before patching
     */
    async performSafetyChecks() {
        const issues = [];
        const warnings = [];
        try {
            // Check file exists
            if (!(await this.exists())) {
                issues.push('VS Code workbench file not found');
                return { safe: false, issues, warnings };
            }
            // Check file integrity
            const integrity = await this.validateIntegrity();
            if (!integrity.valid) {
                issues.push(...integrity.issues);
            }
            // Check if VS Code is running (basic check)
            if (vscode.workspace.workspaceFolders) {
                warnings.push('VS Code is currently running - restart may be required after patching');
            }
            // Check file size (basic sanity check)
            const stats = await this.getFileStats();
            if (stats.size < 1000) {
                issues.push('Workbench file seems too small - may be corrupted');
            }
            if (stats.size > 50 * 1024 * 1024) { // 50MB
                warnings.push('Workbench file is very large - patching may take longer');
            }
            // Check for conflicting extensions (basic check)
            const extensions = vscode.extensions.all;
            const backgroundExtensions = extensions.filter(ext => ext.id.includes('background') &&
                ext.id !== 'your-publisher.happy-zencode');
            if (backgroundExtensions.length > 0) {
                warnings.push(`Other background extensions detected: ${backgroundExtensions.map(e => e.id).join(', ')}`);
            }
        }
        catch (error) {
            issues.push(`Safety check failed: ${error}`);
        }
        return {
            safe: issues.length === 0,
            issues,
            warnings
        };
    }
}
exports.JSPatchFile = JSPatchFile;
//# sourceMappingURL=JSPatchFile.js.map