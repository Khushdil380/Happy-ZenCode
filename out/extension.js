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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const Background_1 = require("./core/Background");
const ThemeManagerNew_1 = require("./theme/ThemeManagerNew");
const Utils_1 = require("./core/Utils");
let background;
let themeManager;
let statusBarItem;
async function activate(context) {
    try {
        console.log('=== Happy Zencode Extension Activating ===');
        Utils_1.Utils.debugLog('Extension activation started', {
            extensionPath: context.extensionPath,
            globalStoragePath: context.globalStorageUri.fsPath
        });
        // Initialize the new modular background system
        background = new Background_1.Background();
        await background.setup();
        // Keep theme manager for theme selection functionality
        themeManager = new ThemeManagerNew_1.ThemeManager(context);
        // Create status bar item
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.text = '$(paintcan) Happy Zencode';
        statusBarItem.command = 'happy-zencode.showStatus';
        statusBarItem.tooltip = 'Happy Zencode Background Status';
        statusBarItem.show();
        // Register commands for the new system
        context.subscriptions.push(vscode.commands.registerCommand('happy-zencode.install', async () => {
            await background.install();
        }), vscode.commands.registerCommand('happy-zencode.uninstall', async () => {
            await background.uninstall();
        }), vscode.commands.registerCommand('happy-zencode.reload', async () => {
            await background.reload();
        }), vscode.commands.registerCommand('happy-zencode.showStatus', async () => {
            const status = await background.getStatus();
            const message = [
                `Background: ${status.enabled ? 'Enabled' : 'Disabled'}`,
                `Images: ${status.imageCount}`,
                `Status: ${status.jsFileStatus.message}`,
                status.needsRestart ? 'Restart Required' : 'Up to Date'
            ].join('\\n');
            vscode.window.showInformationMessage(`Happy Zencode Status:\\n${message}`, ...(status.needsRestart ? ['Restart Now'] : [])).then(selection => {
                if (selection === 'Restart Now') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }), vscode.commands.registerCommand('happy-zencode.selectTheme', async () => {
            await themeManager.showThemeSelector();
        }), vscode.commands.registerCommand('happy-zencode.addImage', async () => {
            const fileUri = await vscode.window.showOpenDialog({
                canSelectFiles: true,
                canSelectFolders: false,
                canSelectMany: false,
                filters: {
                    'Images': ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']
                },
                openLabel: 'Select Background Image'
            });
            if (fileUri && fileUri[0]) {
                const imagePath = fileUri[0].fsPath;
                const imageUrl = `file:///${imagePath.replace(/\\/g, '/')}`;
                // Get current configuration
                const config = vscode.workspace.getConfiguration('background');
                const editorConfig = config.get('editor', {});
                const currentImages = editorConfig.images || [];
                // Add new image
                const updatedImages = [...currentImages, imageUrl];
                // Update configuration
                await config.update('editor', {
                    ...editorConfig,
                    images: updatedImages
                }, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Image added: ${imagePath}\\nTotal images: ${updatedImages.length}`, 'Install Now').then(selection => {
                    if (selection === 'Install Now') {
                        vscode.commands.executeCommand('happy-zencode.install');
                    }
                });
            }
        }), vscode.commands.registerCommand('happy-zencode.removeImage', async () => {
            const config = vscode.workspace.getConfiguration('background');
            const editorConfig = config.get('editor', {});
            const currentImages = editorConfig.images || [];
            if (currentImages.length === 0) {
                vscode.window.showInformationMessage('No background images configured.');
                return;
            }
            const imageOptions = currentImages.map((img, index) => ({
                label: `Image ${index + 1}`,
                description: img.replace('file:///', ''),
                imageIndex: index
            }));
            const selectedImage = await vscode.window.showQuickPick(imageOptions, {
                placeHolder: 'Select image to remove'
            });
            if (selectedImage) {
                const updatedImages = currentImages.filter((_, index) => index !== selectedImage.imageIndex);
                await config.update('editor', {
                    ...editorConfig,
                    images: updatedImages
                }, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Image removed. Remaining images: ${updatedImages.length}`, 'Apply Changes').then(selection => {
                    if (selection === 'Apply Changes') {
                        vscode.commands.executeCommand('happy-zencode.reload');
                    }
                });
            }
        }), vscode.commands.registerCommand('happy-zencode.openSettings', async () => {
            await vscode.commands.executeCommand('workbench.action.openSettings', 'background');
        }), vscode.commands.registerCommand('happy-zencode.applyThemeToEditor', async () => {
            const themeOptions = [
                { label: '1. Cosmic Space', description: 'Dark space theme', index: 1 },
                { label: '2. Ocean Depths', description: 'Calming blue ocean', index: 2 },
                { label: '3. Forest Zen', description: 'Peaceful green forest', index: 3 },
                { label: '4. Desert Sunset', description: 'Warm desert landscape', index: 4 },
                { label: '5. Abstract Art', description: 'Modern abstract patterns', index: 5 }
            ];
            const selection = await vscode.window.showQuickPick(themeOptions, {
                placeHolder: 'Select theme for editor background only'
            });
            if (selection) {
                await themeManager.applyThemeByIndex(selection.index);
            }
        }), vscode.commands.registerCommand('happy-zencode.applyThemeToAll', async () => {
            await themeManager.showThemeSelector();
        }), vscode.commands.registerCommand('happy-zencode.previewTheme', async () => {
            const panel = vscode.window.createWebviewPanel('themeGallery', 'Happy Zencode Theme Gallery', vscode.ViewColumn.One, { enableScripts: true });
            panel.webview.html = this.getThemeGalleryHtml();
        }), statusBarItem);
        // Add background to disposables
        context.subscriptions.push(background);
        // Show welcome message on first activation
        const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
        if (!hasShownWelcome) {
            vscode.window.showInformationMessage('Welcome to Happy Zencode! Configure your background images in VS Code settings under "Background".', 'Open Settings').then(selection => {
                if (selection === 'Open Settings') {
                    vscode.commands.executeCommand('workbench.action.openSettings', 'background');
                }
            });
            context.globalState.update('hasShownWelcome', true);
        }
        console.log('=== Happy Zencode Extension Activated Successfully ===');
    }
    catch (error) {
        console.error('=== Happy Zencode Extension Activation Failed ===', error);
        vscode.window.showErrorMessage(`Happy Zencode activation failed: ${error}. Check the console for details.`);
    }
}
function deactivate() {
    Utils_1.Utils.debugLog('Extension deactivating');
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    // Clean up background system
    if (background) {
        background.dispose();
    }
}
function getThemeGalleryHtml() {
    const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/Khushdil380/Happy-ZenCode/main/assets';
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Happy Zencode Theme Gallery</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: #1e1e1e;
            color: #cccccc;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 32px;
            margin-bottom: 10px;
        }
        .header p {
            font-size: 16px;
            opacity: 0.8;
        }
        .themes-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 30px;
        }
        .theme-card {
            background: #2d2d30;
            border-radius: 12px;
            padding: 20px;
            border: 1px solid #404040;
            transition: transform 0.2s, border-color 0.2s;
        }
        .theme-card:hover {
            transform: translateY(-5px);
            border-color: #007acc;
        }
        .theme-title {
            color: #ffffff;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
        }
        .theme-description {
            opacity: 0.8;
            margin-bottom: 20px;
        }
        .sections-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
            margin-bottom: 20px;
        }
        .section-preview {
            position: relative;
            height: 80px;
            border-radius: 6px;
            overflow: hidden;
            border: 1px solid #404040;
        }
        .section-preview img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        .section-label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: rgba(0, 0, 0, 0.7);
            color: white;
            font-size: 10px;
            text-align: center;
            padding: 2px;
            text-transform: uppercase;
        }
        .theme-actions {
            display: flex;
            gap: 10px;
        }
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            transition: background-color 0.2s;
        }
        .btn-primary {
            background: #007acc;
            color: white;
        }
        .btn-primary:hover {
            background: #005a9e;
        }
        .btn-secondary {
            background: #404040;
            color: white;
        }
        .btn-secondary:hover {
            background: #505050;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎨 Happy Zencode Themes</h1>
        <p>Choose from 5 beautiful built-in themes with coordinated backgrounds for all VS Code sections</p>
    </div>

    <div class="themes-container">
        <div class="theme-card">
            <div class="theme-title">1. Cosmic Space</div>
            <div class="theme-description">Dark space theme with cosmic elements and starfields</div>
            <div class="sections-grid">
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/editor/1.png" alt="Editor" />
                    <div class="section-label">Editor</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/window/1.png" alt="Window" />
                    <div class="section-label">Window</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/psidebar/1.png" alt="Sidebar" />
                    <div class="section-label">Sidebar</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/panel/1.png" alt="Panel" />
                    <div class="section-label">Panel</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/Welcome/1.png" alt="Welcome" />
                    <div class="section-label">Welcome</div>
                </div>
            </div>
            <div class="theme-actions">
                <button class="btn btn-primary" onclick="applyTheme(1)">Apply Theme</button>
                <button class="btn btn-secondary" onclick="previewTheme(1)">Preview</button>
            </div>
        </div>

        <div class="theme-card">
            <div class="theme-title">2. Ocean Depths</div>
            <div class="theme-description">Calming blue ocean theme with wave patterns</div>
            <div class="sections-grid">
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/editor/2.png" alt="Editor" />
                    <div class="section-label">Editor</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/window/2.png" alt="Window" />
                    <div class="section-label">Window</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/psidebar/2.png" alt="Sidebar" />
                    <div class="section-label">Sidebar</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/panel/2.png" alt="Panel" />
                    <div class="section-label">Panel</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/Welcome/2.png" alt="Welcome" />
                    <div class="section-label">Welcome</div>
                </div>
            </div>
            <div class="theme-actions">
                <button class="btn btn-primary" onclick="applyTheme(2)">Apply Theme</button>
                <button class="btn btn-secondary" onclick="previewTheme(2)">Preview</button>
            </div>
        </div>

        <div class="theme-card">
            <div class="theme-title">3. Forest Zen</div>
            <div class="theme-description">Peaceful green forest theme with natural elements</div>
            <div class="sections-grid">
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/editor/3.png" alt="Editor" />
                    <div class="section-label">Editor</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/window/3.png" alt="Window" />
                    <div class="section-label">Window</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/psidebar/3.png" alt="Sidebar" />
                    <div class="section-label">Sidebar</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/panel/3.png" alt="Panel" />
                    <div class="section-label">Panel</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/Welcome/3.png" alt="Welcome" />
                    <div class="section-label">Welcome</div>
                </div>
            </div>
            <div class="theme-actions">
                <button class="btn btn-primary" onclick="applyTheme(3)">Apply Theme</button>
                <button class="btn btn-secondary" onclick="previewTheme(3)">Preview</button>
            </div>
        </div>

        <div class="theme-card">
            <div class="theme-title">4. Desert Sunset</div>
            <div class="theme-description">Warm desert landscape with sunset colors</div>
            <div class="sections-grid">
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/editor/4.png" alt="Editor" />
                    <div class="section-label">Editor</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/window/4.png" alt="Window" />
                    <div class="section-label">Window</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/psidebar/4.png" alt="Sidebar" />
                    <div class="section-label">Sidebar</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/panel/4.png" alt="Panel" />
                    <div class="section-label">Panel</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/Welcome/4.png" alt="Welcome" />
                    <div class="section-label">Welcome</div>
                </div>
            </div>
            <div class="theme-actions">
                <button class="btn btn-primary" onclick="applyTheme(4)">Apply Theme</button>
                <button class="btn btn-secondary" onclick="previewTheme(4)">Preview</button>
            </div>
        </div>

        <div class="theme-card">
            <div class="theme-title">5. Abstract Art</div>
            <div class="theme-description">Modern abstract patterns and geometric designs</div>
            <div class="sections-grid">
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/editor/5.png" alt="Editor" />
                    <div class="section-label">Editor</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/window/5.png" alt="Window" />
                    <div class="section-label">Window</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/psidebar/5.png" alt="Sidebar" />
                    <div class="section-label">Sidebar</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/panel/5.png" alt="Panel" />
                    <div class="section-label">Panel</div>
                </div>
                <div class="section-preview">
                    <img src="${GITHUB_BASE_URL}/Welcome/5.png" alt="Welcome" />
                    <div class="section-label">Welcome</div>
                </div>
            </div>
            <div class="theme-actions">
                <button class="btn btn-primary" onclick="applyTheme(5)">Apply Theme</button>
                <button class="btn btn-secondary" onclick="previewTheme(5)">Preview</button>
            </div>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        
        function applyTheme(index) {
            vscode.postMessage({
                command: 'applyTheme',
                themeIndex: index
            });
        }
        
        function previewTheme(index) {
            vscode.postMessage({
                command: 'previewTheme',
                themeIndex: index
            });
        }
    </script>
</body>
</html>`;
}
//# sourceMappingURL=extension.js.map