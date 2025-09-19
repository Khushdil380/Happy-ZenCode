"use strict";
/**
 * Main Background orchestrator class
 * Manages the complete background system with proper JavaScript file patching
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
exports.Background = void 0;
const vscode = __importStar(require("vscode"));
const JSPatchFile_1 = require("../patching/JSPatchFile");
const VSCodePath_1 = require("../patching/VSCodePath");
const EditorPatchGenerator_1 = require("../generators/EditorPatchGenerator");
const WindowPatchGenerator_1 = require("../generators/WindowPatchGenerator");
const SidebarPatchGenerator_1 = require("../generators/SidebarPatchGenerator");
const PanelPatchGenerator_1 = require("../generators/PanelPatchGenerator");
const Utils_1 = require("../core/Utils");
/**
 * Main Background class that orchestrates the entire background system
 */
class Background {
    constructor() {
        this.disposables = [];
        // Initialize with detected VS Code paths
        const paths = VSCodePath_1.VSCodePathDetector.getAllPaths();
        this.jsFile = new JSPatchFile_1.JSPatchFile(paths.jsPath);
        Utils_1.Utils.debugLog('Background system initialized', {
            jsPath: paths.jsPath,
            extensionRoot: paths.extensionRoot
        });
    }
    /**
     * Get current configuration from VS Code settings
     */
    get config() {
        const config = vscode.workspace.getConfiguration('background');
        const editorConfig = config.get('editor', {});
        const windowConfig = config.get('window', {});
        const sidebarConfig = config.get('sidebar', {});
        const panelConfig = config.get('panel', {});
        return {
            enabled: config.get('enabled', true), // ✅ Fixed: Default to true like package.json
            autoInstall: config.get('autoInstall', true), // ✅ Also enable auto-install by default
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
    async setup() {
        try {
            Utils_1.Utils.debugLog('Setting up background system...');
            // Log path information for debugging
            await VSCodePath_1.VSCodePathDetector.logPathInfo();
            // Perform initial safety checks
            await this.performSafetyChecks();
            // Check if auto-install is needed
            await this.checkInitialState();
            // Set up configuration change listener
            this.disposables.push(vscode.workspace.onDidChangeConfiguration(async (event) => {
                if (event.affectsConfiguration('background')) {
                    Utils_1.Utils.debugLog('Background configuration changed');
                    await this.onConfigurationChange();
                }
            }));
            Utils_1.Utils.debugLog('Background system setup complete');
        }
        catch (error) {
            console.error('[Happy-Zencode] Failed to setup background system:', error);
            await vscode.window.showErrorMessage(`Happy-Zencode: Failed to initialize background system: ${error}`);
        }
    }
    /**
     * Check initial state and apply patches if needed
     */
    async checkInitialState() {
        const config = this.config;
        if (!config.enabled) {
            Utils_1.Utils.debugLog('Background system is disabled');
            return;
        }
        const status = await this.jsFile.getStatus();
        Utils_1.Utils.debugLog('Initial JS file status', status);
        // Apply patches if needed and auto-install is enabled
        if (config.autoInstall && (status.status === 'not-patched' || status.status === 'patched-legacy')) {
            Utils_1.Utils.debugLog('Auto-installing background patches...');
            const success = await this.applyPatches();
            if (success && status.needsRestart) {
                await this.showRestartPrompt('Background has been installed');
            }
        }
    }
    /**
     * Handle configuration changes
     */
    async onConfigurationChange() {
        const config = this.config;
        if (config.enabled) {
            // Apply or update patches
            const success = await this.applyPatches();
            if (success) {
                Utils_1.Utils.debugLog('Configuration updated successfully');
            }
            else {
                await vscode.window.showWarningMessage('Failed to update background configuration. You may need to run as Administrator.');
            }
        }
        else {
            // Remove patches if disabled
            const success = await this.removePatches();
            if (success) {
                Utils_1.Utils.debugLog('Background disabled and patches removed');
                await this.showRestartPrompt('Background has been disabled');
            }
        }
    }
    /**
     * Apply background patches to VS Code
     */
    async applyPatches() {
        try {
            const config = this.config;
            if (!config.enabled) {
                Utils_1.Utils.debugLog('Cannot apply patches - background is disabled');
                return false;
            }
            // Check if any section has images configured
            const hasAnyImages = config.editor.images.length > 0 ||
                (config.window?.images.length || 0) > 0 ||
                (config.sidebar?.images.length || 0) > 0 ||
                (config.panel?.images.length || 0) > 0;
            if (!hasAnyImages) {
                Utils_1.Utils.debugLog('No images configured for any section, removing patches');
                return await this.removePatches();
            }
            // Perform safety checks
            const safetyCheck = await this.jsFile.performSafetyChecks();
            if (!safetyCheck.safe) {
                console.warn('[Happy-Zencode] Safety check failed:', safetyCheck.issues);
                await vscode.window.showWarningMessage(`Background safety check failed: ${safetyCheck.issues.join(', ')}`);
                return false;
            }
            // Generate patch content for all sections
            let combinedPatchContent = '';
            // Editor patches
            if (config.editor.images.length > 0) {
                const editorGenerator = new EditorPatchGenerator_1.EditorPatchGenerator(config.editor);
                const editorPatch = editorGenerator.create();
                if (editorPatch) {
                    combinedPatchContent += editorPatch + '\n';
                }
            }
            // Window patches
            if (config.window && config.window.images.length > 0) {
                const windowGenerator = new WindowPatchGenerator_1.WindowPatchGenerator(config.window);
                const windowPatch = windowGenerator.create();
                if (windowPatch) {
                    combinedPatchContent += windowPatch + '\n';
                }
            }
            // Sidebar patches
            if (config.sidebar && config.sidebar.images.length > 0) {
                const sidebarGenerator = new SidebarPatchGenerator_1.SidebarPatchGenerator(config.sidebar);
                const sidebarPatch = sidebarGenerator.create();
                if (sidebarPatch) {
                    combinedPatchContent += sidebarPatch + '\n';
                }
            }
            // Panel patches
            if (config.panel && config.panel.images.length > 0) {
                const panelGenerator = new PanelPatchGenerator_1.PanelPatchGenerator(config.panel);
                const panelPatch = panelGenerator.create();
                if (panelPatch) {
                    combinedPatchContent += panelPatch + '\n';
                }
            }
            if (!combinedPatchContent) {
                Utils_1.Utils.debugLog('No patch content generated for any section');
                return await this.removePatches();
            }
            Utils_1.Utils.debugLog('Generated combined patch content', {
                contentLength: combinedPatchContent.length,
                editorImages: config.editor.images.length,
                windowImages: config.window?.images.length || 0,
                sidebarImages: config.sidebar?.images.length || 0,
                panelImages: config.panel?.images.length || 0
            });
            // Apply patches
            const success = await this.jsFile.applyPatches(combinedPatchContent);
            if (success) {
                Utils_1.Utils.debugLog('Multi-section patches applied successfully');
                return true;
            }
            else {
                console.error('[Happy-Zencode] Failed to apply multi-section patches');
                return false;
            }
        }
        catch (error) {
            console.error('[Happy-Zencode] Error applying patches:', error);
            return false;
        }
    }
    /**
     * Remove background patches from VS Code
     */
    async removePatches() {
        try {
            Utils_1.Utils.debugLog('Removing background patches...');
            const success = await this.jsFile.removePatches();
            if (success) {
                Utils_1.Utils.debugLog('Patches removed successfully');
                return true;
            }
            else {
                console.error('[Happy-Zencode] Failed to remove patches');
                return false;
            }
        }
        catch (error) {
            console.error('[Happy-Zencode] Error removing patches:', error);
            return false;
        }
    }
    /**
     * Get current status of the background system
     */
    async getStatus() {
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
    async performSafetyChecks() {
        try {
            // Validate VS Code paths
            const paths = VSCodePath_1.VSCodePathDetector.getAllPaths();
            const pathValidation = await VSCodePath_1.VSCodePathDetector.validatePaths(paths);
            if (!pathValidation.valid) {
                const message = `VS Code path validation failed: ${pathValidation.issues.join(', ')}`;
                console.error('[Happy-Zencode]', message);
                await vscode.window.showErrorMessage(`Happy-Zencode: ${message}`);
            }
            // Check JS file safety
            const jsSafetyCheck = await this.jsFile.performSafetyChecks();
            if (jsSafetyCheck.warnings.length > 0) {
                Utils_1.Utils.debugLog('Safety warnings', jsSafetyCheck.warnings);
            }
        }
        catch (error) {
            console.error('[Happy-Zencode] Safety check failed:', error);
        }
    }
    /**
     * Show restart prompt to user
     */
    async showRestartPrompt(message) {
        const action = await vscode.window.showInformationMessage(`${message}. Please restart VS Code to see the changes.`, 'Restart Now', 'Later');
        if (action === 'Restart Now') {
            await vscode.commands.executeCommand('workbench.action.reloadWindow');
        }
    }
    /**
     * Install command - manually apply patches
     */
    async install() {
        try {
            Utils_1.Utils.debugLog('Manual install requested');
            const success = await this.applyPatches();
            if (success) {
                const status = await this.jsFile.getStatus();
                await vscode.window.showInformationMessage('Happy-Zencode background installed successfully!');
                if (status.needsRestart) {
                    await this.showRestartPrompt('Installation complete');
                }
            }
            else {
                await vscode.window.showErrorMessage('Failed to install Happy-Zencode background. Check the console for details.');
            }
        }
        catch (error) {
            console.error('[Happy-Zencode] Install failed:', error);
            await vscode.window.showErrorMessage(`Installation failed: ${error}`);
        }
    }
    /**
     * Uninstall command - remove all patches
     */
    async uninstall() {
        try {
            Utils_1.Utils.debugLog('Manual uninstall requested');
            const success = await this.removePatches();
            if (success) {
                await vscode.window.showInformationMessage('Happy-Zencode background uninstalled successfully!');
                await this.showRestartPrompt('Uninstallation complete');
            }
            else {
                await vscode.window.showErrorMessage('Failed to uninstall Happy-Zencode background. Check the console for details.');
            }
        }
        catch (error) {
            console.error('[Happy-Zencode] Uninstall failed:', error);
            await vscode.window.showErrorMessage(`Uninstallation failed: ${error}`);
        }
    }
    /**
     * Reload command - reapply current configuration
     */
    async reload() {
        try {
            Utils_1.Utils.debugLog('Manual reload requested');
            const config = this.config;
            if (config.enabled) {
                const success = await this.applyPatches();
                if (success) {
                    await vscode.window.showInformationMessage('Happy-Zencode background reloaded successfully!');
                }
                else {
                    await vscode.window.showErrorMessage('Failed to reload Happy-Zencode background.');
                }
            }
            else {
                await vscode.window.showInformationMessage('Background is currently disabled. Enable it in settings to reload.');
            }
        }
        catch (error) {
            console.error('[Happy-Zencode] Reload failed:', error);
            await vscode.window.showErrorMessage(`Reload failed: ${error}`);
        }
    }
    /**
     * Dispose of resources
     */
    dispose() {
        Utils_1.Utils.debugLog('Disposing background system');
        this.disposables.forEach(disposable => {
            try {
                disposable.dispose();
            }
            catch (error) {
                Utils_1.Utils.debugLog('Error disposing resource', error);
            }
        });
        this.disposables = [];
    }
}
exports.Background = Background;
//# sourceMappingURL=Background.js.map