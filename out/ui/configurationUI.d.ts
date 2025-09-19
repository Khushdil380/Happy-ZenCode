import * as vscode from 'vscode';
import { ThemeManager } from '../theme/themeManager';
import { BackgroundManager } from '../background/backgroundManager';
export declare class ConfigurationUI {
    private context;
    private themeManager;
    private backgroundManager;
    constructor(context: vscode.ExtensionContext, themeManager: ThemeManager, backgroundManager: BackgroundManager);
    /**
     * Show the main configuration panel
     */
    showConfigurationPanel(): Promise<void>;
    /**
     * Get current configuration data
     */
    private getCurrentConfig;
    /**
     * Update opacity setting
     */
    private updateOpacity;
    /**
     * Update styling setting
     */
    private updateStyling;
    /**
     * Generate the webview HTML content
     */
    private getWebviewContent;
}
//# sourceMappingURL=configurationUI.d.ts.map