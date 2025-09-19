/**
 * Main Background orchestrator class
 * Manages the complete background system with proper JavaScript file patching
 */

import * as vscode from 'vscode';
import { JSPatchFile } from '../patching/JSPatchFile';
import { VSCodePathDetector } from '../patching/VSCodePath';
import { EditorPatchGenerator, EditorPatchGeneratorConfig } from '../generators/EditorPatchGenerator';
import { WindowPatchGenerator, WindowPatchGeneratorConfig } from '../generators/WindowPatchGenerator';
import { SidebarPatchGenerator, SidebarPatchGeneratorConfig } from '../generators/SidebarPatchGenerator';
import { PanelPatchGenerator, PanelPatchGeneratorConfig } from '../generators/PanelPatchGenerator';
import { Utils } from '../core/Utils';

export interface BackgroundConfig {
    /** Enable/disable background system */
    enabled: boolean;
    /** Editor configuration */
    editor: EditorPatchGeneratorConfig;
    /** Window configuration */
    window?: WindowPatchGeneratorConfig;
    /** Sidebar configuration */
    sidebar?: SidebarPatchGeneratorConfig;
    /** Panel configuration */
    panel?: PanelPatchGeneratorConfig;
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
        const windowConfig = config.get('window', {}) as any;
        const sidebarConfig = config.get('sidebar', {}) as any;
        const panelConfig = config.get('panel', {}) as any;
        
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
            },
            window: windowConfig.images && windowConfig.images.length ? {
                images: windowConfig.images || [],
                useFront: windowConfig.useFront !== undefined ? windowConfig.useFront : false,
                style: windowConfig.style || {},
                styles: windowConfig.styles || [],
                opacity: windowConfig.opacity !== undefined ? windowConfig.opacity : 0.4,
                size: windowConfig.size || 'cover',
                position: windowConfig.position || 'center center'
            } : undefined,
            sidebar: sidebarConfig.images && sidebarConfig.images.length ? {
                images: sidebarConfig.images || [],
                useFront: sidebarConfig.useFront !== undefined ? sidebarConfig.useFront : false,
                style: sidebarConfig.style || {},
                styles: sidebarConfig.styles || [],
                opacity: sidebarConfig.opacity !== undefined ? sidebarConfig.opacity : 0.3,
                size: sidebarConfig.size || 'cover',
                position: sidebarConfig.position || 'center center'
            } : undefined,
            panel: panelConfig.images && panelConfig.images.length ? {
                images: panelConfig.images || [],
                useFront: panelConfig.useFront !== undefined ? panelConfig.useFront : false,
                style: panelConfig.style || {},
                styles: panelConfig.styles || [],
                opacity: panelConfig.opacity !== undefined ? panelConfig.opacity : 0.3,
                size: panelConfig.size || 'cover',
                position: panelConfig.position || 'center center'
            } : undefined
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

            // Check if any section has images configured
            const hasAnyImages = config.editor.images.length > 0 || 
                                (config.window?.images.length || 0) > 0 || 
                                (config.sidebar?.images.length || 0) > 0 || 
                                (config.panel?.images.length || 0) > 0;

            if (!hasAnyImages) {
                Utils.debugLog('No images configured for any section, removing patches');
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

            // Generate patch content for all sections
            let combinedPatchContent = '';

            // Editor patches
            if (config.editor.images.length > 0) {
                const editorGenerator = new EditorPatchGenerator(config.editor);
                const editorPatch = editorGenerator.create();
                if (editorPatch) {
                    combinedPatchContent += editorPatch + '\n';
                }
            }

            // Window patches
            if (config.window && config.window.images.length > 0) {
                const windowGenerator = new WindowPatchGenerator(config.window);
                const windowPatch = windowGenerator.create();
                if (windowPatch) {
                    combinedPatchContent += windowPatch + '\n';
                }
            }

            // Sidebar patches
            if (config.sidebar && config.sidebar.images.length > 0) {
                const sidebarGenerator = new SidebarPatchGenerator(config.sidebar);
                const sidebarPatch = sidebarGenerator.create();
                if (sidebarPatch) {
                    combinedPatchContent += sidebarPatch + '\n';
                }
            }

            // Panel patches
            if (config.panel && config.panel.images.length > 0) {
                const panelGenerator = new PanelPatchGenerator(config.panel);
                const panelPatch = panelGenerator.create();
                if (panelPatch) {
                    combinedPatchContent += panelPatch + '\n';
                }
            }

            if (!combinedPatchContent) {
                Utils.debugLog('No patch content generated for any section');
                return await this.removePatches();
            }

            Utils.debugLog('Generated combined patch content', { 
                contentLength: combinedPatchContent.length,
                editorImages: config.editor.images.length,
                windowImages: config.window?.images.length || 0,
                sidebarImages: config.sidebar?.images.length || 0,
                panelImages: config.panel?.images.length || 0
            });

            // Apply patches
            const success = await this.jsFile.applyPatches(combinedPatchContent);
            
            if (success) {
                Utils.debugLog('Multi-section patches applied successfully');
                return true;
            } else {
                console.error('[Happy-Zencode] Failed to apply multi-section patches');
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

        // Count images from all sections
        const totalImages = config.editor.images.length + 
                           (config.window?.images.length || 0) + 
                           (config.sidebar?.images.length || 0) + 
                           (config.panel?.images.length || 0);

        return {
            enabled: config.enabled,
            jsFileStatus,
            imageCount: totalImages,
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