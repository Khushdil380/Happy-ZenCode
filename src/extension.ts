import * as vscode from 'vscode';
import { ThemeManager } from './theme/themeManager';
import { BackgroundManager } from './background/backgroundManager';
import { ConfigurationUI } from './ui/configurationUI';
import { InstallationManager } from './core/installationManager';

let themeManager: ThemeManager;
let backgroundManager: BackgroundManager;
let configUI: ConfigurationUI;
let installManager: InstallationManager;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    console.log('Happy Zencode extension is now active!');

    // Initialize managers
    themeManager = new ThemeManager(context);
    backgroundManager = new BackgroundManager(context);
    configUI = new ConfigurationUI(context, themeManager, backgroundManager);
    installManager = new InstallationManager(context, themeManager, backgroundManager);

    // Create status bar item
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = '$(paintcan) Happy Zencode';
    statusBarItem.command = 'happy-zencode.openConfig';
    statusBarItem.tooltip = 'Open Happy Zencode Configuration';
    statusBarItem.show();

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('happy-zencode.openConfig', () => {
            configUI.showConfigurationPanel();
        }),

        vscode.commands.registerCommand('happy-zencode.selectTheme', async () => {
            await themeManager.showThemeSelector();
        }),

        vscode.commands.registerCommand('happy-zencode.uploadBackground', async () => {
            await backgroundManager.showBackgroundUploader();
        }),

        vscode.commands.registerCommand('happy-zencode.install', async () => {
            await installManager.install();
        }),

        vscode.commands.registerCommand('happy-zencode.uninstall', async () => {
            await installManager.uninstall();
        }),

        vscode.commands.registerCommand('happy-zencode.reload', async () => {
            await installManager.reload();
        }),

        statusBarItem
    );

    // Auto-install if enabled
    const config = vscode.workspace.getConfiguration('happy-zencode');
    if (config.get('autoInstall', true)) {
        setTimeout(() => {
            installManager.install();
        }, 2000); // Delay to ensure VS Code is fully loaded
    }

    // Listen for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration('happy-zencode')) {
                installManager.reload();
            }
        })
    );
}

export function deactivate() {
    if (statusBarItem) {
        statusBarItem.dispose();
    }
    
    // Clean up any installed modifications
    if (installManager) {
        installManager.uninstall();
    }
}