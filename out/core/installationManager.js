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
const util_1 = require("util");
const readFile = (0, util_1.promisify)(fs.readFile);
const writeFile = (0, util_1.promisify)(fs.writeFile);
class InstallationManager {
    constructor(context, themeManager, backgroundManager) {
        this.isInstalled = false;
        this.context = context;
        this.themeManager = themeManager;
        this.backgroundManager = backgroundManager;
    }
    /**
     * Install theme modifications to VS Code
     */
    async install() {
        try {
            vscode.window.showInformationMessage('Installing Happy Zencode theme...');
            // Get VS Code installation paths
            const paths = this.getVSCodePaths();
            if (!paths) {
                vscode.window.showErrorMessage('Could not locate VS Code installation directory.');
                return;
            }
            // Generate CSS content
            const css = this.generateCSS();
            // Backup original files
            await this.backupFiles(paths);
            // Modify workbench files
            await this.modifyWorkbenchFile(paths.workbench, css);
            await this.updateProductFile(paths.product, paths.workbench);
            this.isInstalled = true;
            vscode.window.showInformationMessage('Happy Zencode theme installed successfully! Please restart VS Code to see changes.', 'Restart Now').then(selection => {
                if (selection === 'Restart Now') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to install theme: ${error}`);
            console.error('Installation error:', error);
        }
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
     * Get VS Code installation paths
     */
    getVSCodePaths() {
        try {
            const appRoot = path.dirname(require.main?.filename || '');
            const workbench = path.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.js');
            const product = path.join(appRoot, 'product.json');
            if (fs.existsSync(workbench) && fs.existsSync(product)) {
                return { workbench, product };
            }
            return null;
        }
        catch (error) {
            console.error('Error finding VS Code paths:', error);
            return null;
        }
    }
    /**
     * Generate CSS content for injection
     */
    generateCSS() {
        const themeCSS = this.themeManager.generateThemeCSS();
        return `
/* Happy Zencode Theme Injection - Start */
${themeCSS}

/* Additional UI enhancements */
.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab {
    background: rgba(0, 0, 0, 0.1) !important;
}

.monaco-workbench .part.editor > .content .editor-group-container > .title .tabs-container > .tab.active {
    background: rgba(255, 255, 255, 0.1) !important;
}

/* Make sure text remains readable */
.monaco-editor, .monaco-editor .view-lines {
    background: transparent !important;
}

.monaco-editor .margin {
    background: transparent !important;
}
/* Happy Zencode Theme Injection - End */
`;
    }
    /**
     * Modify workbench file to inject CSS
     */
    async modifyWorkbenchFile(workbenchPath, css) {
        const content = await readFile(workbenchPath, 'utf-8');
        // Remove any existing injection
        const cleanContent = this.removeExistingInjection(content);
        // Add new injection at the end
        const modifiedContent = cleanContent + `\n\n/* Happy Zencode CSS Injection */\nconst happyZencodeStyle = document.createElement('style');\nhappyZencodeStyle.innerHTML = \`${css.replace(/`/g, '\\`')}\`;\ndocument.head.appendChild(happyZencodeStyle);`;
        await writeFile(workbenchPath, modifiedContent, 'utf-8');
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
        const startMarker = '/* Happy Zencode CSS Injection */';
        const startIndex = content.indexOf(startMarker);
        if (startIndex !== -1) {
            return content.substring(0, startIndex).trim();
        }
        return content;
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
     * Check if theme is currently installed
     */
    isThemeInstalled() {
        return this.isInstalled;
    }
}
exports.InstallationManager = InstallationManager;
//# sourceMappingURL=installationManager.js.map