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
const BuiltinThemes_1 = require("./BuiltinThemes");
class ThemeManager {
    constructor(context) {
        this.context = context;
    }
    /**
     * Show theme selector with all 5 built-in themes
     */
    async showThemeSelector() {
        const themeOptions = BuiltinThemes_1.BUILTIN_THEMES.map((theme, index) => ({
            label: `${index + 1}. ${theme.name}`,
            description: theme.description,
            detail: `Editor, Window, Sidebars, Panel & Welcome backgrounds`,
            theme: theme
        }));
        // Add option to disable themes
        themeOptions.push({
            label: '🚫 Disable All Themes',
            description: 'Remove all theme backgrounds',
            detail: 'Reset to default VS Code appearance',
            theme: null
        });
        const selection = await vscode.window.showQuickPick(themeOptions, {
            placeHolder: 'Select a Happy Zencode theme',
            ignoreFocusOut: true
        });
        if (selection) {
            if (selection.theme) {
                await this.applyTheme(selection.theme);
            }
            else {
                await this.clearTheme();
            }
        }
    }
    /**
     * Apply a complete theme configuration
     */
    async applyTheme(theme) {
        try {
            const config = vscode.workspace.getConfiguration('background');
            // Apply theme configuration
            await config.update('enabled', true, vscode.ConfigurationTarget.Global);
            // Configure editor with theme
            await config.update('editor', {
                images: [theme.images.editor],
                opacity: theme.settings.opacity,
                useFront: theme.settings.useFront,
                style: theme.settings.style,
                styles: [{}],
                interval: 0,
                random: false
            }, vscode.ConfigurationTarget.Global);
            // Apply additional sections if they support multi-section backgrounds
            // Note: Our current implementation focuses on editor, but we're preserving
            // the theme data for future multi-section support
            vscode.window.showInformationMessage(`Theme "${theme.name}" applied! 🎨`, 'Install Now', 'Show Preview').then(async (selection) => {
                if (selection === 'Install Now') {
                    await vscode.commands.executeCommand('happy-zencode.install');
                }
                else if (selection === 'Show Preview') {
                    this.showThemePreview(theme);
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to apply theme: ${error}`);
        }
    }
    /**
     * Clear all theme backgrounds
     */
    async clearTheme() {
        try {
            const config = vscode.workspace.getConfiguration('background');
            await config.update('editor', {
                images: [],
                opacity: 0.1,
                useFront: true,
                style: {},
                styles: [],
                interval: 0,
                random: false
            }, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('All themes cleared! 🧹', 'Apply Changes').then(async (selection) => {
                if (selection === 'Apply Changes') {
                    await vscode.commands.executeCommand('happy-zencode.reload');
                }
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to clear theme: ${error}`);
        }
    }
    /**
     * Show theme preview information
     */
    showThemePreview(theme) {
        const panel = vscode.window.createWebviewPanel('themePreview', `Theme Preview: ${theme.name}`, vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true
        });
        panel.webview.html = this.getPreviewHtml(theme);
    }
    /**
     * Generate preview HTML for theme
     */
    getPreviewHtml(theme) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Theme Preview: ${theme.name}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #1e1e1e;
            color: #cccccc;
        }
        .theme-info {
            background: #2d2d30;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .theme-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #ffffff;
        }
        .theme-description {
            font-size: 16px;
            margin-bottom: 20px;
            opacity: 0.8;
        }
        .images-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
        }
        .image-section {
            background: #252526;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        .image-section h3 {
            margin: 0 0 15px 0;
            color: #ffffff;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .image-section img {
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 4px;
            border: 1px solid #404040;
        }
        .settings-info {
            background: #2d2d30;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .settings-info h3 {
            margin: 0 0 15px 0;
            color: #ffffff;
        }
        .setting-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 5px 0;
            border-bottom: 1px solid #404040;
        }
    </style>
</head>
<body>
    <div class="theme-info">
        <div class="theme-title">${theme.name}</div>
        <div class="theme-description">${theme.description}</div>
    </div>

    <div class="images-grid">
        <div class="image-section">
            <h3>Editor</h3>
            <img src="${theme.images.editor}" alt="Editor Background" />
        </div>
        <div class="image-section">
            <h3>Window</h3>
            <img src="${theme.images.window}" alt="Window Background" />
        </div>
        <div class="image-section">
            <h3>Primary Sidebar</h3>
            <img src="${theme.images.primarySidebar}" alt="Primary Sidebar Background" />
        </div>
        <div class="image-section">
            <h3>Secondary Sidebar</h3>
            <img src="${theme.images.secondarySidebar}" alt="Secondary Sidebar Background" />
        </div>
        <div class="image-section">
            <h3>Panel</h3>
            <img src="${theme.images.panel}" alt="Panel Background" />
        </div>
        <div class="image-section">
            <h3>Welcome</h3>
            <img src="${theme.images.welcome}" alt="Welcome Background" />
        </div>
    </div>

    <div class="settings-info">
        <h3>Theme Settings</h3>
        <div class="setting-item">
            <span>Opacity:</span>
            <span>${theme.settings.opacity}</span>
        </div>
        <div class="setting-item">
            <span>Use Front:</span>
            <span>${theme.settings.useFront ? 'Yes' : 'No'}</span>
        </div>
        <div class="setting-item">
            <span>Background Size:</span>
            <span>${theme.settings.style['background-size'] || 'cover'}</span>
        </div>
    </div>
</body>
</html>`;
    }
    /**
     * Apply theme by index (1-5)
     */
    async applyThemeByIndex(index) {
        const theme = (0, BuiltinThemes_1.getThemeByIndex)(index);
        if (theme) {
            await this.applyTheme(theme);
        }
        else {
            vscode.window.showErrorMessage(`Invalid theme index: ${index}. Use 1-5.`);
        }
    }
    /**
     * Apply theme by name
     */
    async applyThemeByName(name) {
        const theme = (0, BuiltinThemes_1.getThemeByName)(name);
        if (theme) {
            await this.applyTheme(theme);
        }
        else {
            vscode.window.showErrorMessage(`Theme not found: ${name}`);
        }
    }
}
exports.ThemeManager = ThemeManager;
//# sourceMappingURL=ThemeManagerNew.js.map