"use strict";
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
exports.InstallationManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const fs_1 = require("fs");
const util_1 = require("util");
const cssInjectionManager_1 = require("./cssInjectionManager");
const readFile = (0, util_1.promisify)(fs.readFile);
const writeFile = (0, util_1.promisify)(fs.writeFile);
class InstallationManager {
    constructor(context, themeManager, backgroundManager) {
        this.isInstalled = false;
        this.context = context;
        this.themeManager = themeManager;
        this.backgroundManager = backgroundManager;
        this.cssInjectionManager = new cssInjectionManager_1.CSSInjectionManager(context);
    }
    /**
     * Install theme modifications to VS Code
     */
    async install() {
        try {
            console.log('=== Starting Happy Zencode Installation ===');
            vscode.window.showInformationMessage('Installing Happy Zencode theme...');
            // Get configuration
            const config = vscode.workspace.getConfiguration('happy-zencode');
            const backgrounds = config.get('customBackgrounds', {});
            const opacity = config.get('opacity', {});
            console.log('Current configuration:');
            console.log('- Backgrounds:', backgrounds);
            console.log('- Opacity:', opacity);
            // Method 1: Try direct file modification first
            console.log('Attempting Method 1: Direct file modification...');
            const paths = this.getVSCodePaths();
            console.log('VS Code paths found:', paths);
            if (paths) {
                try {
                    console.log('Generating CSS...');
                    const css = this.generateCSS();
                    console.log('CSS generated successfully, length:', css.length);
                    console.log('CSS preview (first 300 chars):', css.substring(0, 300));
                    console.log('Creating backups...');
                    await this.backupFiles(paths);
                    console.log('Backups created successfully');
                    console.log('Writing CSS files...');
                    await this.writeFiles(paths, css);
                    console.log('CSS files written successfully');
                    this.isInstalled = true;
                    vscode.window.showInformationMessage('Happy Zencode theme installed successfully via file modification! Please restart VS Code to see changes.', 'Restart Now').then(selection => {
                        if (selection === 'Restart Now') {
                            vscode.commands.executeCommand('workbench.action.reloadWindow');
                        }
                    });
                    console.log('=== Method 1 Installation Completed Successfully ===');
                    return;
                }
                catch (fileError) {
                    console.error('Method 1 failed with error:', fileError);
                    console.warn('File modification failed, trying alternative methods:', fileError);
                }
            }
            else {
                console.warn('No VS Code paths found, skipping Method 1');
            }
            // Method 2: Try CSS injection via workspace settings
            console.log('Attempting Method 2: CSS injection via workspace settings...');
            try {
                await this.cssInjectionManager.applyCSSViaSettings(backgrounds, opacity);
                this.isInstalled = true;
                console.log('=== Method 2 Installation Completed Successfully ===');
                return;
            }
            catch (settingsError) {
                console.error('Method 2 failed with error:', settingsError);
                console.warn('CSS injection via settings failed:', settingsError);
            }
            // Method 3: Try CSS injection via webview
            console.log('Attempting Method 3: CSS injection via webview...');
            try {
                await this.cssInjectionManager.applyCSSViaWebview(backgrounds, opacity);
                this.isInstalled = true;
                console.log('=== Method 3 Installation Completed Successfully ===');
                return;
            }
            catch (webviewError) {
                console.error('Method 3 failed with error:', webviewError);
                console.warn('CSS injection via webview failed:', webviewError);
            }
            // Method 4: Fallback - show instructions for manual installation
            console.log('All automatic methods failed, showing manual installation instructions...');
            this.showManualInstallationInstructions(backgrounds, opacity);
        }
        catch (error) {
            console.error('=== Installation Failed Completely ===');
            console.error('Main installation error:', error);
            console.error('Error stack trace:', error instanceof Error ? error.stack : 'No stack trace');
            vscode.window.showErrorMessage(`Failed to install theme: ${error}`);
            console.error('Installation error:', error);
        }
    }
    /**
     * Show manual installation instructions
     */
    showManualInstallationInstructions(backgrounds, opacity) {
        const css = this.generateManualCSS(backgrounds, opacity);
        // Create CSS file for manual usage
        const cssPath = path.join(this.context.globalStorageUri.fsPath, 'manual-install.css');
        fs.promises.mkdir(path.dirname(cssPath), { recursive: true })
            .then(() => fs.promises.writeFile(cssPath, css, 'utf-8'))
            .then(() => {
            vscode.window.showInformationMessage('Automatic installation failed. Manual installation required.', 'Show Instructions', 'Open CSS File').then(selection => {
                if (selection === 'Show Instructions') {
                    this.showManualInstructions(cssPath);
                }
                else if (selection === 'Open CSS File') {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(cssPath));
                }
            });
        });
    }
    /**
     * Install with administrator permissions (Windows only)
     */
    async installWithSudo() {
        try {
            const paths = this.getVSCodePaths();
            if (!paths) {
                throw new Error('Could not locate VS Code installation directory');
            }
            // For now, show message about manual installation
            // The original Background extension uses @vscode/sudo-prompt, but we'll keep it simple
            vscode.window.showInformationMessage('Administrator installation is not yet implemented. Please try the CSS injection method instead.', 'Try CSS Injection').then(selection => {
                if (selection === 'Try CSS Injection') {
                    this.installViaCSSInjection();
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to install with administrator permissions: ${error}`);
        }
    }
    /**
     * Write files with proper error handling
     */
    async writeFiles(paths, css) {
        // Read original workbench content
        const workbenchContent = await readFile(paths.workbench, 'utf-8');
        // Generate new content with injection
        const cleanContent = this.removeExistingInjection(workbenchContent);
        const modifiedContent = this.injectJavaScript(cleanContent, css);
        // Write workbench file
        await writeFile(paths.workbench, modifiedContent, 'utf-8');
        // Update product.json with new checksum
        await this.updateProductFile(paths.product, paths.workbench);
    }
    /**
     * Inject JavaScript code that creates CSS styles (following original Background extension pattern)
     */
    injectJavaScript(content, css) {
        const identifier = "Happy-Zencode";
        // Create JavaScript injection similar to original Background extension
        const injection = `
/* ${identifier}-start */
(() => {
    // Remove existing styles first
    const existingStyle = document.getElementById('${identifier}-style');
    if (existingStyle) {
        existingStyle.remove();
    }

    // Create global style element
    const bk_global = document.createElement("style");
    bk_global.id = "${identifier}-style";
    bk_global.setAttribute("type", "text/css");
    
    // Add the CSS content
    bk_global.appendChild(document.createTextNode(\`${css.replace(/`/g, '\\`').replace(/\\/g, '\\\\')}\`));
    
    // Append to head
    document.head.appendChild(bk_global);
    
    console.log('Happy Zencode: CSS injected successfully');
})();
/* ${identifier}-end */`;
        return content + '\n' + injection;
    }
    /**
     * Uninstall theme modifications
     */
    async uninstall() {
        try {
            vscode.window.showInformationMessage('Uninstalling Happy Zencode theme...');
            const paths = this.getVSCodePaths();
            if (!paths) {
                vscode.window.showErrorMessage('Could not locate VS Code installation directory.');
                return;
            }
            // Restore from backup
            await this.restoreFiles(paths);
            this.isInstalled = false;
            vscode.window.showInformationMessage('Happy Zencode theme uninstalled successfully! Please restart VS Code.', 'Restart Now').then(selection => {
                if (selection === 'Restart Now') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to uninstall theme: ${error}`);
            console.error('Uninstallation error:', error);
        }
    }
    /**
     * Reload theme (reinstall with current settings)
     */
    async reload() {
        if (this.isInstalled) {
            await this.install();
        }
    }
    /**
     * Get VS Code installation paths using VS Code's built-in env.appRoot
     */
    getVSCodePaths() {
        try {
            // Use VS Code's built-in env.appRoot - the most reliable method
            const dir = vscode.env.appRoot;
            if (!dir) {
                console.warn('VS Code env.appRoot is not available');
                return null;
            }
            // Build paths exactly like the original Background extension
            const workbench = path.join(dir, "out", "vs", "workbench", "workbench.desktop.main.js");
            const product = path.join(dir, "product.json");
            if (fs.existsSync(workbench) && fs.existsSync(product)) {
                console.log('Found VS Code installation at:', dir);
                return { workbench, product };
            }
            else {
                console.warn(`VS Code files not found: workbench=${fs.existsSync(workbench)}, product=${fs.existsSync(product)}`);
                return null;
            }
        }
        catch (error) {
            console.error('Error finding VS Code paths:', error);
            return null;
        }
    }
    /**
     * Generate CSS content for injection (following original Background extension approach)
     */
    generateCSS() {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const selectedThemeId = config.get('selectedTheme', 'custom');
        const customBackgrounds = config.get('customBackgrounds', {});
        const opacity = config.get('opacity', {});
        const enabled = config.get('enabled', true);
        const style = config.get('style', {
            "content": "''",
            "pointer-events": "none",
            "position": "absolute",
            "z-index": "99999",
            "width": "70%",
            "height": "100%",
            "margin-left": "30%",
            "background-position": "right",
            "background-size": "cover",
            "background-repeat": "no-repeat",
            "opacity": 0.1
        });
        // If disabled, return empty CSS
        if (!enabled) {
            console.log('Happy Zencode is disabled, returning empty CSS');
            return '';
        }
        // Get the current theme (either built-in or custom)
        const currentTheme = this.themeManager.getCurrentTheme();
        console.log('=== CSS Generation Debug ===');
        console.log('Selected theme ID:', selectedThemeId);
        console.log('Current theme:', currentTheme);
        console.log('Custom backgrounds:', customBackgrounds);
        console.log('Style configuration:', style);
        // Merge theme backgrounds with custom backgrounds (custom takes priority)
        const backgrounds = {
            window: customBackgrounds.window || (currentTheme?.backgrounds.window) || '',
            primarySidebar: customBackgrounds.primarySidebar || (currentTheme?.backgrounds.primarySidebar) || '',
            editor: customBackgrounds.editor || (currentTheme?.backgrounds.editor) || '',
            secondarySidebar: customBackgrounds.secondarySidebar || (currentTheme?.backgrounds.secondarySidebar) || '',
            panel: customBackgrounds.panel || (currentTheme?.backgrounds.panel) || '',
            welcomePage: customBackgrounds.welcomePage || (currentTheme?.backgrounds.welcomePage) || ''
        };
        console.log('Merged backgrounds:', backgrounds);
        let css = `
/* Happy Zencode Theme - Global Styles */
/* Generated using Background extension compatible format */

/* Base styles for background elements */
body::before,
.monaco-workbench::before {
    content: ${style.content};
    pointer-events: ${style['pointer-events']};
    position: ${style.position};
    z-index: ${style['z-index']};
    width: ${style.width};
    height: ${style.height};
    margin-left: ${style['margin-left']};
    background-position: ${style['background-position']};
    background-size: ${style['background-size']};
    background-repeat: ${style['background-repeat']};
    opacity: ${style.opacity};
}

/* Hide VS Code corruption warnings */
div.notification-toast:has(> div.notifications-list-container > div.monaco-list[aria-label*="Your Code installation appears to be corrupt. Please reinstall., notification"]),
div.notification-toast:has(> div.notifications-list-container > div.monaco-list[aria-label*="Your Code - Insiders installation appears to be corrupt. Please reinstall., notification"]) {
    display: none;
}
`;
        // Convert file paths to proper format and generate CSS
        if (backgrounds.window) {
            const processedPath = this.processImagePath(backgrounds.window);
            if (processedPath) {
                css += `
/* Window Background */
body::before {
    background-image: url("${processedPath}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: ${opacity.window || 0.3};
    z-index: -1;
}`;
            }
        }
        if (backgrounds.editor) {
            const processedPath = this.processImagePath(backgrounds.editor);
            if (processedPath) {
                css += `
/* Editor Background */
.split-view-view > .editor-group-container::after {
    background-image: url("${processedPath}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: ${opacity.editor || 0.1};
}`;
            }
        }
        if (backgrounds.primarySidebar) {
            const processedPath = this.processImagePath(backgrounds.primarySidebar);
            if (processedPath) {
                css += `
/* Primary Sidebar Background */
.split-view-view > .part.sidebar::after {
    background-image: url("${processedPath}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: ${opacity.primarySidebar || 0.3};
}`;
            }
        }
        if (backgrounds.secondarySidebar) {
            const processedPath = this.processImagePath(backgrounds.secondarySidebar);
            if (processedPath) {
                css += `
/* Secondary Sidebar Background */
.split-view-view > .part.auxiliarybar::after {
    background-image: url("${processedPath}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: ${opacity.secondarySidebar || 0.3};
}`;
            }
        }
        if (backgrounds.panel) {
            const processedPath = this.processImagePath(backgrounds.panel);
            if (processedPath) {
                css += `
/* Panel Background */
.split-view-view > .part.panel::after {
    background-image: url("${processedPath}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: ${opacity.panel || 0.3};
}`;
            }
        }
        if (backgrounds.welcomePage) {
            const processedPath = this.processImagePath(backgrounds.welcomePage);
            if (processedPath) {
                css += `
/* Welcome Page Background */
.welcome-view::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("${processedPath}");
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    opacity: ${opacity.welcomePage || 0.3};
    z-index: -1;
    pointer-events: none;
}`;
            }
        }
        console.log('Generated CSS with backgrounds:', backgrounds);
        return css;
    }
    /**
     * Process image path for CSS usage
     */
    processImagePath(imagePath) {
        console.log('Processing image path:', imagePath);
        try {
            if (imagePath.startsWith('http')) {
                console.log('HTTP URL detected, returning as-is');
                return imagePath;
            }
            let cleanPath;
            if (imagePath.startsWith('./')) {
                // Relative path - resolve relative to extension directory
                const extensionPath = this.context.extensionPath;
                cleanPath = path.join(extensionPath, imagePath.substring(2));
                console.log('Relative path detected, resolved to:', cleanPath);
            }
            else if (imagePath.startsWith('file:///')) {
                // Convert file:// URLs to proper file paths
                cleanPath = imagePath.replace(/^file:\/\/\//, '');
                console.log('File URL detected, clean path:', cleanPath);
            }
            else {
                // Assume it's already a clean path
                cleanPath = imagePath;
                console.log('Using path as-is:', cleanPath);
            }
            // Check if file exists
            console.log('Checking if file exists:', cleanPath);
            if (fs.existsSync(cleanPath)) {
                // Use forward slashes for consistency (fix #1 from your research)
                const normalizedPath = cleanPath.replace(/\\/g, '/');
                // Try simple file:/// protocol first (more compatible)
                const result = `file:///${normalizedPath}`;
                console.log('File exists, returning file URL:', result);
                return result;
            }
            else {
                console.warn(`Background image not found: ${cleanPath}`);
                return null;
            }
        }
        catch (error) {
            console.error('Error processing image path:', error);
            return null;
        }
    }
    /**
     * Update product.json to prevent corruption warnings
     */
    async updateProductFile(productPath, workbenchPath) {
        try {
            const productContent = await readFile(productPath, 'utf-8');
            const product = JSON.parse(productContent);
            // Calculate new checksum for the modified workbench file
            const workbenchContent = await readFile(workbenchPath, 'utf-8');
            const newChecksum = this.calculateChecksum(workbenchContent);
            // Update the checksum in product.json
            if (product.checksums) {
                const workbenchKey = Object.keys(product.checksums).find(key => key.includes('workbench.desktop.main.js'));
                if (workbenchKey) {
                    product.checksums[workbenchKey] = newChecksum;
                }
            }
            await writeFile(productPath, JSON.stringify(product, null, 2), 'utf-8');
        }
        catch (error) {
            console.warn('Could not update product.json checksums:', error);
        }
    }
    /**
     * Remove existing injection from content
     */
    removeExistingInjection(content) {
        const identifier = "Happy-Zencode";
        const pattern = new RegExp(`^\\/\\* ${identifier}-start \\*\\/$[\\s\\S]*?^\\/\\* ${identifier}-end \\*\\/$`, 'gmi');
        // Also remove old injection format
        const oldStartMarker = '/* Happy Zencode CSS Injection */';
        const oldStartIndex = content.indexOf(oldStartMarker);
        let cleanContent = content;
        // Remove new format injection
        cleanContent = cleanContent.replace(pattern, '').trim();
        // Remove old format injection
        if (oldStartIndex !== -1) {
            cleanContent = cleanContent.substring(0, oldStartIndex).trim();
        }
        return cleanContent;
    }
    /**
     * Calculate checksum for file content
     */
    calculateChecksum(content) {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(content, 'utf8').digest('hex');
    }
    /**
     * Backup original files
     */
    async backupFiles(paths) {
        const backupDir = path.join(this.context.globalStorageUri.fsPath, 'backups');
        // Ensure backup directory exists
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        const workbenchBackup = path.join(backupDir, 'workbench.desktop.main.js.backup');
        const productBackup = path.join(backupDir, 'product.json.backup');
        // Only backup if backup doesn't exist (preserve original)
        if (!fs.existsSync(workbenchBackup)) {
            fs.copyFileSync(paths.workbench, workbenchBackup);
        }
        if (!fs.existsSync(productBackup)) {
            fs.copyFileSync(paths.product, productBackup);
        }
    }
    /**
     * Restore files from backup
     */
    async restoreFiles(paths) {
        const backupDir = path.join(this.context.globalStorageUri.fsPath, 'backups');
        const workbenchBackup = path.join(backupDir, 'workbench.desktop.main.js.backup');
        const productBackup = path.join(backupDir, 'product.json.backup');
        if (fs.existsSync(workbenchBackup)) {
            fs.copyFileSync(workbenchBackup, paths.workbench);
        }
        if (fs.existsSync(productBackup)) {
            fs.copyFileSync(productBackup, paths.product);
        }
    }
    /**
     * Fallback installation method using workspace CSS injection
     */
    async installViaCSSInjection() {
        const css = this.generateCSS();
        // Use VS Code's workbench.colorCustomizations and CSS injection
        const config = vscode.workspace.getConfiguration();
        // Try to inject CSS through custom CSS extension if available
        const customCSSConfig = vscode.workspace.getConfiguration('vscode_custom_css');
        if (customCSSConfig.has('imports')) {
            // If Custom CSS extension is available, use it
            const existingImports = customCSSConfig.get('imports', []);
            // Create a temporary CSS file
            const tempCSSPath = path.join(this.context.globalStorageUri.fsPath, 'happy-zencode-styles.css');
            try {
                await fs_1.promises.mkdir(path.dirname(tempCSSPath), { recursive: true });
                await writeFile(tempCSSPath, css, 'utf-8');
                const fileUri = `file:///${tempCSSPath.replace(/\\/g, '/')}`;
                if (!existingImports.includes(fileUri)) {
                    existingImports.push(fileUri);
                    await customCSSConfig.update('imports', existingImports, vscode.ConfigurationTarget.Global);
                }
                vscode.window.showInformationMessage('Happy Zencode theme installed via Custom CSS extension! Please run "Reload Custom CSS" command.', 'Reload Custom CSS').then(selection => {
                    if (selection === 'Reload Custom CSS') {
                        vscode.commands.executeCommand('extension.reloadCustomCSS');
                    }
                });
            }
            catch (error) {
                console.error('Error creating CSS file:', error);
                await this.applyColorCustomizations();
            }
        }
        else {
            // Suggest installing Custom CSS extension
            vscode.window.showInformationMessage('Could not modify VS Code files directly. For full theme support, please install the "Custom CSS and JS Loader" extension.', 'Install Extension', 'Apply Colors Only').then(selection => {
                if (selection === 'Install Extension') {
                    vscode.env.openExternal(vscode.Uri.parse('vscode:extension/be5invis.vscode-custom-css'));
                }
                else if (selection === 'Apply Colors Only') {
                    this.applyColorCustomizations();
                }
            });
        }
        this.isInstalled = true;
    }
    /**
     * Apply color customizations to workspace
     */
    async applyColorCustomizations() {
        const theme = this.themeManager.getCurrentTheme();
        if (!theme)
            return;
        const config = vscode.workspace.getConfiguration();
        // Apply color customizations
        if (Object.keys(theme.colorCustomizations).length > 0) {
            await config.update('workbench.colorCustomizations', theme.colorCustomizations, vscode.ConfigurationTarget.Global);
        }
        // Apply token color customizations
        if (Object.keys(theme.tokenColorCustomizations).length > 0) {
            await config.update('editor.tokenColorCustomizations', theme.tokenColorCustomizations, vscode.ConfigurationTarget.Global);
        }
        vscode.window.showInformationMessage('Happy Zencode color theme applied! Background images require VS Code file modification or Custom CSS extension for full functionality.');
    }
    /**
     * Generate CSS for manual installation
     */
    generateManualCSS(backgrounds, opacity) {
        return this.generateCSS(); // Reuse existing method
    }
    /**
     * Show manual installation instructions
     */
    showManualInstructions(cssPath) {
        const instructions = `
# Manual Happy Zencode Installation

Since automatic installation failed, you can manually install the theme using one of these methods:

## Method 1: Custom CSS and JS Loader Extension
1. Install the "Custom CSS and JS Loader" extension from VS Code marketplace
2. Add this path to your settings.json:
   "vscode_custom_css.imports": ["file:///${cssPath.replace(/\\/g, '/')}"]
3. Run "Reload Custom CSS and JS" command
4. Restart VS Code

## Method 2: Copy CSS to User Styles
1. Open the CSS file: ${cssPath}
2. Copy all the CSS content
3. Create a custom CSS file in your VS Code user directory
4. Use a CSS injection extension to apply it

The CSS file has been created at:
${cssPath}
`;
        // Create and show a new document with instructions
        vscode.workspace.openTextDocument({
            content: instructions,
            language: 'markdown'
        }).then(doc => {
            vscode.window.showTextDocument(doc);
        });
    }
    /**
     * Check if theme is currently installed
     */
    isThemeInstalled() {
        return this.isInstalled;
    }
}
exports.InstallationManager = InstallationManager;
//# sourceMappingURL=installationManager.js.map