import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { ThemeManager } from '../theme/themeManager';
import { BackgroundManager } from '../background/backgroundManager';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export class InstallationManager {
    private context: vscode.ExtensionContext;
    private themeManager: ThemeManager;
    private backgroundManager: BackgroundManager;
    private isInstalled: boolean = false;

    constructor(context: vscode.ExtensionContext, themeManager: ThemeManager, backgroundManager: BackgroundManager) {
        this.context = context;
        this.themeManager = themeManager;
        this.backgroundManager = backgroundManager;
    }

    /**
     * Install theme modifications to VS Code
     */
    async install(): Promise<void> {
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
            vscode.window.showInformationMessage(
                'Happy Zencode theme installed successfully! Please restart VS Code to see changes.',
                'Restart Now'
            ).then(selection => {
                if (selection === 'Restart Now') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to install theme: ${error}`);
            console.error('Installation error:', error);
        }
    }

    /**
     * Uninstall theme modifications
     */
    async uninstall(): Promise<void> {
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
            vscode.window.showInformationMessage(
                'Happy Zencode theme uninstalled successfully! Please restart VS Code.',
                'Restart Now'
            ).then(selection => {
                if (selection === 'Restart Now') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to uninstall theme: ${error}`);
            console.error('Uninstallation error:', error);
        }
    }

    /**
     * Reload theme (reinstall with current settings)
     */
    async reload(): Promise<void> {
        if (this.isInstalled) {
            await this.install();
        }
    }

    /**
     * Get VS Code installation paths
     */
    private getVSCodePaths(): { workbench: string; product: string } | null {
        try {
            const appRoot = path.dirname(require.main?.filename || '');
            const workbench = path.join(appRoot, 'vs', 'workbench', 'workbench.desktop.main.js');
            const product = path.join(appRoot, 'product.json');

            if (fs.existsSync(workbench) && fs.existsSync(product)) {
                return { workbench, product };
            }

            return null;
        } catch (error) {
            console.error('Error finding VS Code paths:', error);
            return null;
        }
    }

    /**
     * Generate CSS content for injection
     */
    private generateCSS(): string {
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
    private async modifyWorkbenchFile(workbenchPath: string, css: string): Promise<void> {
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
    private async updateProductFile(productPath: string, workbenchPath: string): Promise<void> {
        try {
            const productContent = await readFile(productPath, 'utf-8');
            const product = JSON.parse(productContent);
            
            // Calculate new checksum for the modified workbench file
            const workbenchContent = await readFile(workbenchPath, 'utf-8');
            const newChecksum = this.calculateChecksum(workbenchContent);
            
            // Update the checksum in product.json
            if (product.checksums) {
                const workbenchKey = Object.keys(product.checksums).find(key => 
                    key.includes('workbench.desktop.main.js')
                );
                if (workbenchKey) {
                    product.checksums[workbenchKey] = newChecksum;
                }
            }
            
            await writeFile(productPath, JSON.stringify(product, null, 2), 'utf-8');
        } catch (error) {
            console.warn('Could not update product.json checksums:', error);
        }
    }

    /**
     * Remove existing injection from content
     */
    private removeExistingInjection(content: string): string {
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
    private calculateChecksum(content: string): string {
        const crypto = require('crypto');
        return crypto.createHash('md5').update(content, 'utf8').digest('hex');
    }

    /**
     * Backup original files
     */
    private async backupFiles(paths: { workbench: string; product: string }): Promise<void> {
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
    private async restoreFiles(paths: { workbench: string; product: string }): Promise<void> {
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
    isThemeInstalled(): boolean {
        return this.isInstalled;
    }
}