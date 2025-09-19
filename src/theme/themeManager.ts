import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { ThemeDefinition, BUILTIN_THEMES } from './themeDefinitions';

export class ThemeManager {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Get the currently selected theme
     */
    getCurrentTheme(): ThemeDefinition | null {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const selectedThemeId = config.get<string>('selectedTheme', 'custom');

        if (selectedThemeId === 'custom') {
            return this.createCustomTheme();
        }

        return BUILTIN_THEMES.find(theme => theme.id === selectedThemeId) || null;
    }

    /**
     * Create a custom theme from user settings
     */
    private createCustomTheme(): ThemeDefinition {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const customBackgrounds = config.get('customBackgrounds', {}) as any;
        const opacity = config.get('opacity', {}) as any;

        return {
            id: 'custom',
            name: 'Custom Theme',
            description: 'User-defined custom theme',
            backgrounds: {
                window: customBackgrounds.window || '',
                primarySidebar: customBackgrounds.primarySidebar || '',
                editor: customBackgrounds.editor || '',
                secondarySidebar: customBackgrounds.secondarySidebar || '',
                panel: customBackgrounds.panel || '',
                welcomePage: customBackgrounds.welcomePage || ''
            },
            colorCustomizations: {},
            tokenColorCustomizations: {},
            defaultOpacity: {
                window: opacity.window || 0.3,
                primarySidebar: opacity.primarySidebar || 0.3,
                editor: opacity.editor || 0.1,
                secondarySidebar: opacity.secondarySidebar || 0.3,
                panel: opacity.panel || 0.3,
                welcomePage: opacity.welcomePage || 0.3
            }
        };
    }

    /**
     * Show theme selector quick pick
     */
    async showThemeSelector(): Promise<void> {
        const items: vscode.QuickPickItem[] = [
            {
                label: 'Custom Theme',
                description: 'Use your own custom backgrounds and settings',
                detail: 'Configure your own background images'
            },
            ...BUILTIN_THEMES.map(theme => ({
                label: theme.name,
                description: theme.description,
                detail: `Built-in theme: ${theme.id}`
            }))
        ];

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select a theme for Happy Zencode',
            canPickMany: false
        });

        if (selected) {
            let themeId: string;
            if (selected.label === 'Custom Theme') {
                themeId = 'custom';
            } else {
                const theme = BUILTIN_THEMES.find(t => t.name === selected.label);
                themeId = theme?.id || 'custom';
            }

            await this.setTheme(themeId);
        }
    }

    /**
     * Set the active theme
     */
    async setTheme(themeId: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        await config.update('selectedTheme', themeId, vscode.ConfigurationTarget.Global);

        // If it's a built-in theme, also update opacity settings
        const theme = BUILTIN_THEMES.find(t => t.id === themeId);
        if (theme) {
            await config.update('opacity', theme.defaultOpacity, vscode.ConfigurationTarget.Global);
            
            // Apply color customizations to workspace settings
            const workspaceConfig = vscode.workspace.getConfiguration();
            await workspaceConfig.update('workbench.colorCustomizations', theme.colorCustomizations, vscode.ConfigurationTarget.Global);
            await workspaceConfig.update('editor.tokenColorCustomizations', theme.tokenColorCustomizations, vscode.ConfigurationTarget.Global);
        }

        vscode.window.showInformationMessage(`Applied theme: ${theme?.name || 'Custom Theme'}`);
    }

    /**
     * Get all available themes
     */
    getAllThemes(): ThemeDefinition[] {
        return [...BUILTIN_THEMES, this.createCustomTheme()];
    }

    /**
     * Generate CSS for the current theme
     */
    generateThemeCSS(): string {
        const theme = this.getCurrentTheme();
        if (!theme) {
            return '';
        }

        const config = vscode.workspace.getConfiguration('happy-zencode');
        const styling = config.get('styling', {});

        let css = '';

        // Generate CSS for each background area
        Object.entries(theme.backgrounds).forEach(([area, imagePath]) => {
            if (imagePath) {
                const opacity = theme.defaultOpacity[area as keyof typeof theme.defaultOpacity];
                css += this.generateAreaCSS(area, imagePath, opacity, styling);
            }
        });

        return css;
    }

    /**
     * Generate CSS for a specific area
     */
    private generateAreaCSS(area: string, imagePath: string, opacity: number, styling: any): string {
        const blur = styling.blur || 0;
        const brightness = styling.brightness || 1;
        const contrast = styling.contrast || 1;
        const saturate = styling.saturate || 1;
        const backgroundSize = styling.backgroundSize || 'cover';
        const backgroundRepeat = styling.backgroundRepeat || 'no-repeat';
        const backgroundPosition = styling.backgroundPosition || 'center';

        const filter = `blur(${blur}px) brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;

        const selectors = this.getAreaSelectors(area);
        
        // Handle different types of image paths (use original Background extension approach)
        let processedImagePath = '';
        
        if (imagePath.startsWith('http')) {
            // Keep HTTP URLs as-is
            processedImagePath = imagePath;
        } else if (imagePath.startsWith('vscode-file://')) {
            // Already properly formatted
            processedImagePath = imagePath;
        } else {
            // Convert local file paths to vscode-file protocol
            const cleanPath = imagePath.replace(/\\/g, '/').replace(/^\/+/g, '');
            processedImagePath = `vscode-file://vscode-app/${cleanPath}`;
        }
        
        return selectors.map(selector => {
            // For window/body, use ::before pseudo-element
            const pseudoElement = area === 'window' ? '::before' : '::after';
            
            return `
            ${selector} {
                position: relative;
            }
            ${selector}${pseudoElement} {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('${processedImagePath}');
                background-size: ${backgroundSize};
                background-repeat: ${backgroundRepeat};
                background-position: ${backgroundPosition};
                background-attachment: fixed;
                opacity: ${opacity};
                filter: ${filter};
                z-index: -1;
                pointer-events: none;
                transition: opacity 1s ease-in-out;
            }`;
        }).join('\n');
    }

    /**
     * Get CSS selectors for each area (based on original Background extension)
     */
    private getAreaSelectors(area: string): string[] {
        const selectorMap: { [key: string]: string[] } = {
            window: ['body'],
            primarySidebar: ['.split-view-view > .part.sidebar'],
            editor: ['.split-view-view > .editor-group-container'],
            secondarySidebar: ['.split-view-view > .part.auxiliarybar'],
            panel: ['.split-view-view > .part.panel'],
            welcomePage: ['.welcome-view', '.editor-group-container .welcome-page']
        };

        return selectorMap[area] || [];
    }

    /**
     * Get MIME type for image extensions
     */
    private getMimeType(extension: string): string {
        const mimeMap: { [key: string]: string } = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'bmp': 'image/bmp',
            'svg': 'image/svg+xml'
        };
        return mimeMap[extension] || 'image/png';
    }
}