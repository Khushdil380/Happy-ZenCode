import * as vscode from 'vscode';
import { ThemeManager } from '../theme/themeManager';
import { BackgroundManager } from '../background/backgroundManager';
export declare class InstallationManager {
    private context;
    private themeManager;
    private backgroundManager;
    private isInstalled;
    constructor(context: vscode.ExtensionContext, themeManager: ThemeManager, backgroundManager: BackgroundManager);
    /**
     * Install theme modifications to VS Code
     */
    install(): Promise<void>;
    /**
     * Uninstall theme modifications
     */
    uninstall(): Promise<void>;
    /**
     * Reload theme (reinstall with current settings)
     */
    reload(): Promise<void>;
    /**
     * Get VS Code installation paths
     */
    private getVSCodePaths;
    /**
     * Generate CSS content for injection
     */
    private generateCSS;
    /**
     * Modify workbench file to inject CSS
     */
    private modifyWorkbenchFile;
    /**
     * Update product.json to prevent corruption warnings
     */
    private updateProductFile;
    /**
     * Remove existing injection from content
     */
    private removeExistingInjection;
    /**
     * Calculate checksum for file content
     */
    private calculateChecksum;
    /**
     * Backup original files
     */
    private backupFiles;
    /**
     * Restore files from backup
     */
    private restoreFiles;
    /**
     * Check if theme is currently installed
     */
    isThemeInstalled(): boolean;
}
//# sourceMappingURL=installationManager.d.ts.map