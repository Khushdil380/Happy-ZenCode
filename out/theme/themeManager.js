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
exports.ThemeManager = void 0;
const vscode = __importStar(require("vscode"));
const themeDefinitions_1 = require("./themeDefinitions");
class ThemeManager {
    constructor(context) {
        this.context = context;
    }
    /**
     * Get the currently selected theme
     */
    getCurrentTheme() {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const selectedThemeId = config.get('selectedTheme', 'custom');
        if (selectedThemeId === 'custom') {
            return this.createCustomTheme();
        }
        return themeDefinitions_1.BUILTIN_THEMES.find(theme => theme.id === selectedThemeId) || null;
    }
    /**
     * Create a custom theme from user settings
     */
    createCustomTheme() {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const customBackgrounds = config.get('customBackgrounds', {});
        const opacity = config.get('opacity', {});
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
    async showThemeSelector() {
        const items = [
            {
                label: 'Custom Theme',
                description: 'Use your own custom backgrounds and settings',
                detail: 'Configure your own background images'
            },
            ...themeDefinitions_1.BUILTIN_THEMES.map(theme => ({
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
            let themeId;
            if (selected.label === 'Custom Theme') {
                themeId = 'custom';
            }
            else {
                const theme = themeDefinitions_1.BUILTIN_THEMES.find(t => t.name === selected.label);
                themeId = theme?.id || 'custom';
            }
            await this.setTheme(themeId);
        }
    }
    /**
     * Set the active theme
     */
    async setTheme(themeId) {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        await config.update('selectedTheme', themeId, vscode.ConfigurationTarget.Global);
        // If it's a built-in theme, also update opacity settings
        const theme = themeDefinitions_1.BUILTIN_THEMES.find(t => t.id === themeId);
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
    getAllThemes() {
        return [...themeDefinitions_1.BUILTIN_THEMES, this.createCustomTheme()];
    }
    /**
     * Generate CSS for the current theme
     */
    generateThemeCSS() {
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
                const opacity = theme.defaultOpacity[area];
                css += this.generateAreaCSS(area, imagePath, opacity, styling);
            }
        });
        return css;
    }
    /**
     * Generate CSS for a specific area
     */
    generateAreaCSS(area, imagePath, opacity, styling) {
        const blur = styling.blur || 0;
        const brightness = styling.brightness || 1;
        const contrast = styling.contrast || 1;
        const saturate = styling.saturate || 1;
        const backgroundSize = styling.backgroundSize || 'cover';
        const backgroundRepeat = styling.backgroundRepeat || 'no-repeat';
        const backgroundPosition = styling.backgroundPosition || 'center';
        const filter = `blur(${blur}px) brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`;
        const selectors = this.getAreaSelectors(area);
        return selectors.map(selector => `
            ${selector}::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: url('${imagePath}');
                background-size: ${backgroundSize};
                background-repeat: ${backgroundRepeat};
                background-position: ${backgroundPosition};
                background-attachment: fixed;
                opacity: ${opacity};
                filter: ${filter};
                z-index: -1;
                pointer-events: none;
            }
        `).join('\n');
    }
    /**
     * Get CSS selectors for each area
     */
    getAreaSelectors(area) {
        const selectorMap = {
            window: ['.monaco-workbench'],
            primarySidebar: ['.split-view-view:first-child .sidebar'],
            editor: ['.editor-container', '.monaco-editor'],
            secondarySidebar: ['.split-view-view:last-child .sidebar'],
            panel: ['.panel'],
            welcomePage: ['.welcomePage']
        };
        return selectorMap[area] || [];
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=themeManager.js.map