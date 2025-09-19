import * as vscode from 'vscode';
import { ThemeDefinition } from './themeDefinitions';
export declare class ThemeManager {
    private context;
    constructor(context: vscode.ExtensionContext);
    /**
     * Get the currently selected theme
     */
    getCurrentTheme(): ThemeDefinition | null;
    /**
     * Create a custom theme from user settings
     */
    private createCustomTheme;
    /**
     * Show theme selector quick pick
     */
    showThemeSelector(): Promise<void>;
    /**
     * Set the active theme
     */
    setTheme(themeId: string): Promise<void>;
    /**
     * Get all available themes
     */
    getAllThemes(): ThemeDefinition[];
    /**
     * Generate CSS for the current theme
     */
    generateThemeCSS(): string;
    /**
     * Generate CSS for a specific area
     */
    private generateAreaCSS;
    /**
     * Get CSS selectors for each area
     */
    private getAreaSelectors;
}
//# sourceMappingURL=themeManager.d.ts.map