import * as vscode from 'vscode';
import { ThemeManager } from '../theme/themeManager';
import { BackgroundManager } from '../background/backgroundManager';

export class ConfigurationUI {
    private context: vscode.ExtensionContext;
    private themeManager: ThemeManager;
    private backgroundManager: BackgroundManager;

    constructor(context: vscode.ExtensionContext, themeManager: ThemeManager, backgroundManager: BackgroundManager) {
        this.context = context;
        this.themeManager = themeManager;
        this.backgroundManager = backgroundManager;
    }

    /**
     * Show the main configuration panel
     */
    async showConfigurationPanel(): Promise<void> {
        const panel = vscode.window.createWebviewPanel(
            'happy-zencode-config',
            'Happy Zencode Configuration',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        panel.webview.html = this.getWebviewContent(panel.webview);

        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(
            async (message) => {
                switch (message.command) {
                    case 'selectTheme':
                        await this.themeManager.showThemeSelector();
                        break;
                    case 'uploadBackground':
                        await this.backgroundManager.showBackgroundUploader();
                        break;
                    case 'updateOpacity':
                        await this.updateOpacity(message.area, message.value);
                        break;
                    case 'updateStyling':
                        await this.updateStyling(message.property, message.value);
                        break;
                    case 'clearAllBackgrounds':
                        await this.backgroundManager.clearAllBackgrounds();
                        break;
                    case 'install':
                        await vscode.commands.executeCommand('happy-zencode.install');
                        break;
                    case 'uninstall':
                        await vscode.commands.executeCommand('happy-zencode.uninstall');
                        break;
                    case 'reload':
                        await vscode.commands.executeCommand('happy-zencode.reload');
                        break;
                    case 'getConfig':
                        panel.webview.postMessage({
                            command: 'configData',
                            data: this.getCurrentConfig()
                        });
                        break;
                }
            },
            undefined,
            this.context.subscriptions
        );
    }

    /**
     * Get current configuration data
     */
    private getCurrentConfig(): any {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const currentTheme = this.themeManager.getCurrentTheme();
        
        return {
            selectedTheme: config.get('selectedTheme', 'custom'),
            customBackgrounds: config.get('customBackgrounds', {}),
            opacity: config.get('opacity', {}),
            styling: config.get('styling', {}),
            autoInstall: config.get('autoInstall', true),
            currentTheme: currentTheme,
            availableThemes: this.themeManager.getAllThemes()
        };
    }

    /**
     * Update opacity setting
     */
    private async updateOpacity(area: string, value: number): Promise<void> {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const opacity = config.get('opacity', {});
        
        const newOpacity = {
            ...opacity,
            [area]: value
        };

        await config.update('opacity', newOpacity, vscode.ConfigurationTarget.Global);
    }

    /**
     * Update styling setting
     */
    private async updateStyling(property: string, value: any): Promise<void> {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const styling = config.get('styling', {});
        
        const newStyling = {
            ...styling,
            [property]: value
        };

        await config.update('styling', newStyling, vscode.ConfigurationTarget.Global);
    }

    /**
     * Generate the webview HTML content
     */
    private getWebviewContent(webview: vscode.Webview): string {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Happy Zencode Configuration</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .section {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid var(--vscode-panel-border);
            border-radius: 8px;
            background-color: var(--vscode-panel-background);
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: var(--vscode-textLink-foreground);
        }
        .control-group {
            margin-bottom: 15px;
        }
        .control-label {
            display: block;
            margin-bottom: 5px;
            font-weight: 500;
        }
        .button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            margin: 4px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        }
        .button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .button.secondary {
            background-color: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        .button.secondary:hover {
            background-color: var(--vscode-button-secondaryHoverBackground);
        }
        .slider {
            width: 100%;
            margin: 10px 0;
        }
        .select {
            width: 100%;
            padding: 8px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
        }
        .current-theme {
            padding: 15px;
            background-color: var(--vscode-editorWidget-background);
            border-radius: 8px;
            margin-bottom: 15px;
        }
        .theme-name {
            font-size: 16px;
            font-weight: bold;
            color: var(--vscode-textLink-foreground);
        }
        .theme-description {
            margin-top: 5px;
            color: var(--vscode-descriptionForeground);
        }
        .opacity-controls {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        .opacity-control {
            padding: 10px;
            background-color: var(--vscode-editorWidget-background);
            border-radius: 4px;
        }
        .slider-value {
            float: right;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Happy Zencode Configuration</h1>
        <p>Customize your VS Code experience with themes and backgrounds</p>
    </div>

    <div class="section">
        <div class="section-title">🎭 Theme Selection</div>
        <div id="current-theme" class="current-theme">
            <div class="theme-name">Loading...</div>
            <div class="theme-description">Please wait...</div>
        </div>
        <button class="button" onclick="selectTheme()">Change Theme</button>
        <button class="button secondary" onclick="uploadBackground()">Upload Custom Background</button>
    </div>

    <div class="section">
        <div class="section-title">🔧 Installation</div>
        <p>Install or uninstall the theme modifications to VS Code</p>
        <button class="button" onclick="install()">Install Theme</button>
        <button class="button secondary" onclick="uninstall()">Uninstall Theme</button>
        <button class="button secondary" onclick="reload()">Reload Theme</button>
    </div>

    <div class="section">
        <div class="section-title">🎚️ Opacity Controls</div>
        <p>Adjust the opacity of background images for different areas</p>
        <div class="opacity-controls" id="opacity-controls">
            <!-- Opacity controls will be populated by JavaScript -->
        </div>
    </div>

    <div class="section">
        <div class="section-title">🎨 Styling Options</div>
        
        <div class="control-group">
            <label class="control-label">Blur Effect (px)</label>
            <input type="range" class="slider" id="blur" min="0" max="50" value="0" 
                   oninput="updateStyling('blur', this.value)">
            <span class="slider-value" id="blur-value">0</span>
        </div>

        <div class="control-group">
            <label class="control-label">Brightness</label>
            <input type="range" class="slider" id="brightness" min="0" max="2" step="0.1" value="1"
                   oninput="updateStyling('brightness', this.value)">
            <span class="slider-value" id="brightness-value">1</span>
        </div>

        <div class="control-group">
            <label class="control-label">Contrast</label>
            <input type="range" class="slider" id="contrast" min="0" max="2" step="0.1" value="1"
                   oninput="updateStyling('contrast', this.value)">
            <span class="slider-value" id="contrast-value">1</span>
        </div>

        <div class="control-group">
            <label class="control-label">Saturation</label>
            <input type="range" class="slider" id="saturate" min="0" max="2" step="0.1" value="1"
                   oninput="updateStyling('saturate', this.value)">
            <span class="slider-value" id="saturate-value">1</span>
        </div>

        <div class="control-group">
            <label class="control-label">Background Size</label>
            <select class="select" id="backgroundSize" onchange="updateStyling('backgroundSize', this.value)">
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
                <option value="100% 100%">Stretch</option>
            </select>
        </div>

        <div class="control-group">
            <label class="control-label">Background Position</label>
            <select class="select" id="backgroundPosition" onchange="updateStyling('backgroundPosition', this.value)">
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
                <option value="top left">Top Left</option>
                <option value="top right">Top Right</option>
                <option value="bottom left">Bottom Left</option>
                <option value="bottom right">Bottom Right</option>
            </select>
        </div>
    </div>

    <div class="section">
        <div class="section-title">🗑️ Reset Options</div>
        <button class="button secondary" onclick="clearAllBackgrounds()">Clear All Custom Backgrounds</button>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let currentConfig = null;

        // Send initial request for config data
        vscode.postMessage({ command: 'getConfig' });

        // Listen for messages from the extension
        window.addEventListener('message', event => {
            const message = event.data;
            if (message.command === 'configData') {
                currentConfig = message.data;
                updateUI();
            }
        });

        function updateUI() {
            if (!currentConfig) return;

            // Update current theme display
            const currentThemeDiv = document.getElementById('current-theme');
            const theme = currentConfig.currentTheme;
            if (theme) {
                currentThemeDiv.innerHTML = \`
                    <div class="theme-name">\${theme.name}</div>
                    <div class="theme-description">\${theme.description}</div>
                \`;
            }

            // Update opacity controls
            const opacityContainer = document.getElementById('opacity-controls');
            const areas = ['window', 'primarySidebar', 'editor', 'secondarySidebar', 'panel', 'welcomePage'];
            const areaLabels = {
                window: 'Window',
                primarySidebar: 'Primary Sidebar',
                editor: 'Editor',
                secondarySidebar: 'Secondary Sidebar',
                panel: 'Panel',
                welcomePage: 'Welcome Page'
            };

            opacityContainer.innerHTML = areas.map(area => {
                const value = currentConfig.opacity[area] || 0.3;
                return \`
                    <div class="opacity-control">
                        <label class="control-label">\${areaLabels[area]}</label>
                        <input type="range" class="slider" min="0" max="1" step="0.1" value="\${value}"
                               oninput="updateOpacity('\${area}', this.value)">
                        <span class="slider-value" id="\${area}-opacity-value">\${value}</span>
                    </div>
                \`;
            }).join('');

            // Update styling controls
            const styling = currentConfig.styling;
            if (styling) {
                document.getElementById('blur').value = styling.blur || 0;
                document.getElementById('blur-value').textContent = styling.blur || 0;
                document.getElementById('brightness').value = styling.brightness || 1;
                document.getElementById('brightness-value').textContent = styling.brightness || 1;
                document.getElementById('contrast').value = styling.contrast || 1;
                document.getElementById('contrast-value').textContent = styling.contrast || 1;
                document.getElementById('saturate').value = styling.saturate || 1;
                document.getElementById('saturate-value').textContent = styling.saturate || 1;
                document.getElementById('backgroundSize').value = styling.backgroundSize || 'cover';
                document.getElementById('backgroundPosition').value = styling.backgroundPosition || 'center';
            }
        }

        function selectTheme() {
            vscode.postMessage({ command: 'selectTheme' });
        }

        function uploadBackground() {
            vscode.postMessage({ command: 'uploadBackground' });
        }

        function updateOpacity(area, value) {
            document.getElementById(area + '-opacity-value').textContent = value;
            vscode.postMessage({ command: 'updateOpacity', area: area, value: parseFloat(value) });
        }

        function updateStyling(property, value) {
            const numericProperties = ['blur', 'brightness', 'contrast', 'saturate'];
            if (numericProperties.includes(property)) {
                value = parseFloat(value);
                document.getElementById(property + '-value').textContent = value;
            }
            vscode.postMessage({ command: 'updateStyling', property: property, value: value });
        }

        function clearAllBackgrounds() {
            if (confirm('Are you sure you want to clear all custom backgrounds?')) {
                vscode.postMessage({ command: 'clearAllBackgrounds' });
            }
        }

        function install() {
            vscode.postMessage({ command: 'install' });
        }

        function uninstall() {
            vscode.postMessage({ command: 'uninstall' });
        }

        function reload() {
            vscode.postMessage({ command: 'reload' });
        }
    </script>
</body>
</html>
        `;
    }
}