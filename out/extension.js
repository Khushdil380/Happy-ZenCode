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
const themeManager_1 = require("./theme/themeManager");
const backgroundManager_1 = require("./background/backgroundManager");
const configurationUI_1 = require("./ui/configurationUI");
const installationManager_1 = require("./core/installationManager");
let themeManager;
let backgroundManager;
let configUI;
let installManager;
let statusBarItem;
function activate(context) {
    console.log('Happy Zencode extension is now active!');
    // Initialize managers
    themeManager = new themeManager_1.ThemeManager(context);
    backgroundManager = new backgroundManager_1.BackgroundManager(context);
    configUI = new configurationUI_1.ConfigurationUI(context, themeManager, backgroundManager);
    installManager = new installationManager_1.InstallationManager(context, themeManager, backgroundManager);
    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(paintcan) Happy Zencode';
    statusBarItem.command = 'happy-zencode.openConfig';
    statusBarItem.tooltip = 'Open Happy Zencode Configuration';
    statusBarItem.show();
    // Register commands
    context.subscriptions.push(vscode.commands.registerCommand('happy-zencode.openConfig', () => {
        configUI.showConfigurationPanel();
    }), vscode.commands.registerCommand('happy-zencode.selectTheme', async () => {
        await themeManager.showThemeSelector();
    }), vscode.commands.registerCommand('happy-zencode.uploadBackground', async () => {
        await backgroundManager.showBackgroundUploader();
    }), vscode.commands.registerCommand('happy-zencode.install', async () => {
        await installManager.install();
    }), vscode.commands.registerCommand('happy-zencode.uninstall', async () => {
        await installManager.uninstall();
    }), vscode.commands.registerCommand('happy-zencode.reload', async () => {
        await installManager.reload();
    }), statusBarItem);
    // Auto-install if enabled
    const config = vscode.workspace.getConfiguration('happy-zencode');
    if (config.get('autoInstall', true)) {
        setTimeout(() => {
            installManager.install();
        }, 2000); // Delay to ensure VS Code is fully loaded
    }
    // Listen for configuration changes
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration('happy-zencode')) {
            installManager.reload();
        }
    }));
}
function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    // Clean up any installed modifications
    if (installManager) {
        installManager.uninstall();
    }
}
//# sourceMappingURL=extension.js.map