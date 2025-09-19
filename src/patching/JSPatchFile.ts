/**
 * JavaScript file patching for VS Code workbench
 * This is the core component that actually makes background images work
 * Based on vscode-background extension architecture
 */

import * as vscode from 'vscode';
import { BasePatchFile, PatchType } from './BasePatchFile';
import { Utils } from '../core/Utils';

// Node.js globals for file operations with elevated permissions
declare const require: any;
declare const process: any;

/**
 * JavaScript file patcher for VS Code workbench
 * Directly modifies workbench.desktop.main.js to inject background styles
 */
export class JSPatchFile extends BasePatchFile {
    constructor(filePath: string) {
        super(filePath, 'happy-zencode', '1.0.0');
    }

    /**
     * Apply patches to the JavaScript file
     * This injects the background style generation code into VS Code's workbench
     */
    public async applyPatches(patchContent: string): Promise<boolean> {
        try {
            // Use file locking to prevent concurrent modifications
            await this.lockFile();
            
            Utils.debugLog('Applying JS patches', { filePath: this.filePath });

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
                Utils.debugLog('No changes needed, content is identical');
                return true;
            }

            // Try to write directly first
            const writeSuccess = await this.writeWithPermissions(newContent);
            
            if (writeSuccess) {
                Utils.debugLog('Successfully applied JS patches');
                return true;
            } else {
                Utils.debugLog('Failed to apply JS patches');
                return false;
            }

        } catch (error) {
            Utils.debugLog('Error applying JS patches', error);
            return false;
        } finally {
            await this.unlockFile();
        }
    }

    /**
     * Remove all patches from the JavaScript file
     */
    public async removePatches(): Promise<boolean> {
        try {
            await this.lockFile();
            
            Utils.debugLog('Removing JS patches', { filePath: this.filePath });

            const currentContent = await this.getContent();
            const cleanContent = this.cleanPatches(currentContent);

            // Only write if content actually changed
            if (currentContent === cleanContent) {
                Utils.debugLog('No patches to remove');
                return true;
            }

            const writeSuccess = await this.writeWithPermissions(cleanContent);
            
            if (writeSuccess) {
                Utils.debugLog('Successfully removed JS patches');
                return true;
            } else {
                Utils.debugLog('Failed to remove JS patches');
                return false;
            }

        } catch (error) {
            Utils.debugLog('Error removing JS patches', error);
            return false;
        } finally {
            await this.unlockFile();
        }
    }

    /**
     * Write content with elevated permissions if needed
     */
    private async writeWithPermissions(content: string): Promise<boolean> {
        try {
            // Try normal write first
            await this.writeContent(content);
            return true;
        } catch (error) {
            Utils.debugLog('Normal write failed, trying with elevated permissions', error);
            
            // Try with elevated permissions using sudo-prompt
            return await this.writeWithSudo(content);
        }
    }

    /**
     * Write file with sudo/admin permissions
     */
    private async writeWithSudo(content: string): Promise<boolean> {
        try {
            // Import sudo-prompt dynamically to handle missing dependency gracefully
            const sudo = require('@vscode/sudo-prompt');
            
            // Create temporary file first
            const tempPath = `${Utils.getTempDir()}/happy-zencode-${Utils.generateUUID()}.js`;
            await Utils.writeFile(tempPath, content);

            // Use platform-specific move command
            const moveCommand = process.platform === 'win32' 
                ? `move /Y "${tempPath}" "${this.filePath}"`
                : `mv "${tempPath}" "${this.filePath}"`;

            return new Promise<boolean>((resolve) => {
                sudo.exec(moveCommand, {
                    name: 'Happy Zencode Extension'
                }, (error: any) => {
                    if (error) {
                        Utils.debugLog('Sudo write failed', error);
                        // Clean up temp file
                        Utils.fileExists(tempPath).then(exists => {
                            if (exists) {
                                require('fs').promises.unlink(tempPath).catch(() => {});
                            }
                        });
                        resolve(false);
                    } else {
                        Utils.debugLog('Sudo write successful');
                        resolve(true);
                    }
                });
            });

        } catch (error) {
            Utils.debugLog('Sudo write setup failed', error);
            
            // Show error message to user
            await vscode.window.showErrorMessage(
                'Failed to modify VS Code files. Please run VS Code as Administrator (Windows) or use sudo (Mac/Linux).',
                'Retry with Admin/Sudo'
            );
            
            return false;
        }
    }

    /**
     * Simple file locking mechanism
     */
    private lockFilePath?: string;
    
    private async lockFile(): Promise<void> {
        this.lockFilePath = `${this.filePath}.lock`;
        await Utils.writeFile(this.lockFilePath, 'locked');
    }

    private async unlockFile(): Promise<void> {
        if (this.lockFilePath && await Utils.fileExists(this.lockFilePath)) {
            try {
                require('fs').promises.unlink(this.lockFilePath);
            } catch (error) {
                Utils.debugLog('Failed to remove lock file', error);
            }
        }
    }

    /**
     * Check if VS Code needs restart after patching
     */
    public async needsRestart(): Promise<boolean> {
        const patchType = await this.getPatchType();
        return patchType === PatchType.None || patchType === PatchType.Legacy;
    }

    /**
     * Get human-readable status
     */
    public async getStatus(): Promise<{
        status: 'not-patched' | 'patched-legacy' | 'patched-current' | 'error';
        message: string;
        needsRestart: boolean;
    }> {
        try {
            const patchType = await this.getPatchType();
            const needsRestart = await this.needsRestart();

            switch (patchType) {
                case PatchType.None:
                    return {
                        status: 'not-patched',
                        message: 'VS Code workbench has not been patched',
                        needsRestart: false
                    };
                
                case PatchType.Legacy:
                    return {
                        status: 'patched-legacy',
                        message: 'VS Code workbench has legacy patches (needs update)',
                        needsRestart
                    };
                
                case PatchType.Latest:
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
        } catch (error) {
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
    public async performSafetyChecks(): Promise<{
        safe: boolean;
        issues: string[];
        warnings: string[];
    }> {
        const issues: string[] = [];
        const warnings: string[] = [];

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
            const backgroundExtensions = extensions.filter(ext => 
                ext.id.includes('background') && 
                ext.id !== 'your-publisher.happy-zencode'
            );
            
            if (backgroundExtensions.length > 0) {
                warnings.push(`Other background extensions detected: ${backgroundExtensions.map(e => e.id).join(', ')}`);
            }

        } catch (error) {
            issues.push(`Safety check failed: ${error}`);
        }

        return {
            safe: issues.length === 0,
            issues,
            warnings
        };
    }
}