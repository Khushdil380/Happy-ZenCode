/**
 * Main Background orchestrator class
 * Manages the complete background system with proper JavaScript file patching
 */

import * as vscode from 'vscode';
import { JSPatchFile } from '../patching/JSPatchFile';
import { VSCodePathDetector } from '../patching/VSCodePath';
import { EditorPatchGenerator, EditorPatchGeneratorConfig } from '../generators/EditorPatchGenerator';
import { Utils } from '../core/Utils';

export interface BackgroundConfig {
    /** Enable/disable background system */
    enabled: boolean;
    /** Editor configuration */
    editor: EditorPatchGeneratorConfig;
    /** Auto-install on startup and config changes */
    autoInstall: boolean;
}

/**
 * Main Background class that orchestrates the entire background system
 */
export class Background {
    private jsFile: JSPatchFile;
    private disposables: vscode.Disposable[] = [];
    
    constructor() {
        // Initialize with detected VS Code paths
        const paths = VSCodePathDetector.getAllPaths();
        this.jsFile = new JSPatchFile(paths.jsPath);
        
        Utils.debugLog('Background system initialized', {
            jsPath: paths.jsPath,
            extensionRoot: paths.extensionRoot
        });
    }

    /**
     * Get current configuration from VS Code settings
     */
    private get config(): BackgroundConfig {
        const config = vscode.workspace.getConfiguration('background');
        const editorConfig = config.get('editor', {}) as any;
        
        return {
            enabled: config.get('enabled', true),  // ✅ Fixed: Default to true like package.json
            autoInstall: config.get('autoInstall', true),  // ✅ Also enable auto-install by default
            editor: {
                images: editorConfig.images || [],
                useFront: editorConfig.useFront !== undefined ? editorConfig.useFront : true,
                style: editorConfig.style || {},
                styles: editorConfig.styles || [],
                opacity: editorConfig.opacity !== undefined ? editorConfig.opacity : 0.1,
                size: editorConfig.size || 'cover',
                position: editorConfig.position || 'center center',
                interval: editorConfig.interval || 0,
                random: editorConfig.random || false
            }
        };
    }

    /**
     * Initialize the background system
     */
    public async setup(): Promise<void> {
        try {
            Utils.debugLog('Setting up background system...');

            // Log path information for debugging
            await VSCodePathDetector.logPathInfo();

            // Perform initial safety checks
            await this.performSafetyChecks();

            // Check if auto-install is needed
            await this.checkInitialState();

            // Set up configuration change listener
            this.disposables.push(
                vscode.workspace.onDidChangeConfiguration(async (event) => {
                    if (event.affectsConfiguration('background')) {
                        Utils.debugLog('Background configuration changed');
                        await this.onConfigurationChange();
                    }
                })
            );

            Utils.debugLog('Background system setup complete');

        } catch (error) {
            console.error('[Happy-Zencode] Failed to setup background system:', error);
            await vscode.window.showErrorMessage(
                `Happy-Zencode: Failed to initialize background system: ${error}`
            );
        }
    }

    /**
     * Check initial state and apply patches if needed
     */
    private async checkInitialState(): Promise<void> {
        const config = this.config;
        
        if (!config.enabled) {
            Utils.debugLog('Background system is disabled');
            return;
        }

        const status = await this.jsFile.getStatus();
        Utils.debugLog('Initial JS file status', status);

        // Apply patches if needed and auto-install is enabled
        if (config.autoInstall && (status.status === 'not-patched' || status.status === 'patched-legacy')) {
            Utils.debugLog('Auto-installing background patches...');
            const success = await this.applyPatches();
            
            if (success && status.needsRestart) {
                await this.showRestartPrompt('Background has been installed');
            }
        }
    }

    /**
     * Handle configuration changes
     */
    private async onConfigurationChange(): Promise<void> {
        const config = this.config;

        if (config.enabled) {
            // Apply or update patches
            const success = await this.applyPatches();
            
            if (success) {
                Utils.debugLog('Configuration updated successfully');
            } else {
                await vscode.window.showWarningMessage(
                    'Failed to update background configuration. You may need to run as Administrator.'
                );
            }
        } else {
            // Remove patches if disabled
            const success = await this.removePatches();
            
            if (success) {
                Utils.debugLog('Background disabled and patches removed');
                await this.showRestartPrompt('Background has been disabled');
            }
        }
    }

    /**
     * Apply background patches to VS Code
     */
    public async applyPatches(): Promise<boolean> {
        try {
            const config = this.config;
            
            if (!config.enabled) {
                Utils.debugLog('Cannot apply patches - background is disabled');
                return false;
            }

            if (!config.editor.images.length) {
                Utils.debugLog('No images configured, removing patches');
                return await this.removePatches();
            }

            // Perform safety checks
            const safetyCheck = await this.jsFile.performSafetyChecks();
            if (!safetyCheck.safe) {
                console.warn('[Happy-Zencode] Safety check failed:', safetyCheck.issues);
                await vscode.window.showWarningMessage(
                    `Background safety check failed: ${safetyCheck.issues.join(', ')}`
                );
                return false;
            }

            // Generate patch content
            const generator = new EditorPatchGenerator(config.editor);
            const patchContent = generator.create();

            if (!patchContent) {
                Utils.debugLog('No patch content generated');
                return await this.removePatches();
            }

            Utils.debugLog('Generated patch content', { 
                contentLength: patchContent.length,
                imageCount: config.editor.images.length 
            });

            // Apply patches
            const success = await this.jsFile.applyPatches(patchContent);
            
            if (success) {
                Utils.debugLog('Patches applied successfully');
                return true;
            } else {
                console.error('[Happy-Zencode] Failed to apply patches');
                return false;
            }

        } catch (error) {
            console.error('[Happy-Zencode] Error applying patches:', error);
            return false;
        }
    }

    /**
     * Remove background patches from VS Code
     */
    public async removePatches(): Promise<boolean> {
        try {
            Utils.debugLog('Removing background patches...');
            
            const success = await this.jsFile.removePatches();
            
            if (success) {
                Utils.debugLog('Patches removed successfully');
                return true;
            } else {
                console.error('[Happy-Zencode] Failed to remove patches');
                return false;
            }

        } catch (error) {
            console.error('[Happy-Zencode] Error removing patches:', error);
            return false;
        }
    }

    /**
     * Get current status of the background system
     */
    public async getStatus(): Promise<{
        enabled: boolean;
        jsFileStatus: any;
        imageCount: number;
        needsRestart: boolean;
    }> {
        const config = this.config;
        const jsFileStatus = await this.jsFile.getStatus();

        return {
            enabled: config.enabled,
            jsFileStatus,
            imageCount: config.editor.images.length,
            needsRestart: jsFileStatus.needsRestart
        };
    }

    /**
     * Perform comprehensive safety checks
     */
    private async performSafetyChecks(): Promise<void> {
        try {
            // Validate VS Code paths
            const paths = VSCodePathDetector.getAllPaths();
            const pathValidation = await VSCodePathDetector.validatePaths(paths);
            
            if (!pathValidation.valid) {
                const message = `VS Code path validation failed: ${pathValidation.issues.join(', ')}`;
                console.error('[Happy-Zencode]', message);
                await vscode.window.showErrorMessage(`Happy-Zencode: ${message}`);
            }

            // Check JS file safety
            const jsSafetyCheck = await this.jsFile.performSafetyChecks();
            
            if (jsSafetyCheck.warnings.length > 0) {
                Utils.debugLog('Safety warnings', jsSafetyCheck.warnings);
            }

        } catch (error) {
            console.error('[Happy-Zencode] Safety check failed:', error);
        }
    }

    /**
     * Show restart prompt to user
     */
    private async showRestartPrompt(message: string): Promise<void> {
        const action = await vscode.window.showInformationMessage(
            `${message}. Please restart VS Code to see the changes.`,
            'Restart Now',
            'Later'
        );

        if (action === 'Restart Now') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }

    /**
     * Install command - manually apply patches
     */
    public async install(): Promise<void> {
        try {
            Utils.debugLog('Manual install requested');
            
            const success = await this.applyPatches();
            
            if (success) {
                const status = await this.jsFile.getStatus();
                await vscode.window.showInformationMessage(
                    'Happy-Zencode background installed successfully!'
                );
                
                if (status.needsRestart) {
                    await this.showRestartPrompt('Installation complete');
                }
            } else {
                await vscode.window.showErrorMessage(
                    'Failed to install Happy-Zencode background. Check the console for details.'
                );
            }

        } catch (error) {
            console.error('[Happy-Zencode] Install failed:', error);
            await vscode.window.showErrorMessage(
                `Installation failed: ${error}`
            );
        }
    }

    /**
     * Uninstall command - remove all patches
     */
    public async uninstall(): Promise<void> {
        try {
            Utils.debugLog('Manual uninstall requested');
            
            const success = await this.removePatches();
            
            if (success) {
                await vscode.window.showInformationMessage(
                    'Happy-Zencode background uninstalled successfully!'
                );
                await this.showRestartPrompt('Uninstallation complete');
            } else {
                await vscode.window.showErrorMessage(
                    'Failed to uninstall Happy-Zencode background. Check the console for details.'
                );
            }

        } catch (error) {
            console.error('[Happy-Zencode] Uninstall failed:', error);
            await vscode.window.showErrorMessage(
                `Uninstallation failed: ${error}`
            );
        }
    }

    /**
     * Reload command - reapply current configuration
     */
    public async reload(): Promise<void> {
        try {
            Utils.debugLog('Manual reload requested');
            
            const config = this.config;
            
            if (config.enabled) {
                const success = await this.applyPatches();
                
                if (success) {
                    await vscode.window.showInformationMessage(
                        'Happy-Zencode background reloaded successfully!'
                    );
                } else {
                    await vscode.window.showErrorMessage(
                        'Failed to reload Happy-Zencode background.'
                    );
                }
            } else {
                await vscode.window.showInformationMessage(
                    'Background is currently disabled. Enable it in settings to reload.'
                );
            }

        } catch (error) {
            console.error('[Happy-Zencode] Reload failed:', error);
            await vscode.window.showErrorMessage(
                `Reload failed: ${error}`
            );
        }
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        Utils.debugLog('Disposing background system');
        
        this.disposables.forEach(disposable => {
            try {
                disposable.dispose();
            } catch (error) {
                Utils.debugLog('Error disposing resource', error);
            }
        });
        
        this.disposables = [];
    }
}