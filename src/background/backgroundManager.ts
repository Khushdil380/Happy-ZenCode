import * as vscode from 'vscode';
import * as path from 'path';
import { promises as fs } from 'fs';

export class BackgroundManager {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Show background image uploader interface
     */
    async showBackgroundUploader(): Promise<void> {
        // First, let user select which area to set background for
        const areas = [
            { label: 'Window', value: 'window', description: 'Background for the entire window' },
            { label: 'Primary Sidebar', value: 'primarySidebar', description: 'Background for the file explorer sidebar' },
            { label: 'Editor', value: 'editor', description: 'Background for the code editor area' },
            { label: 'Secondary Sidebar', value: 'secondarySidebar', description: 'Background for the secondary sidebar' },
            { label: 'Panel', value: 'panel', description: 'Background for the terminal/output panel' },
            { label: 'Welcome Page', value: 'welcomePage', description: 'Background for the welcome page' }
        ];

        const selectedArea = await vscode.window.showQuickPick(areas, {
            placeHolder: 'Select which area to set background for',
            canPickMany: false
        });

        if (!selectedArea) {
            return;
        }

        // Let user choose between file upload or URL
        const sourceOptions = [
            { label: 'Upload Local Image', value: 'file', description: 'Select an image file from your computer' },
            { label: 'Use Image URL', value: 'url', description: 'Provide a URL to an online image (HTTPS only)' },
            { label: 'Remove Background', value: 'remove', description: 'Remove the current background image' }
        ];

        const sourceType = await vscode.window.showQuickPick(sourceOptions, {
            placeHolder: 'How would you like to set the background?',
            canPickMany: false
        });

        if (!sourceType) {
            return;
        }

        let imagePath = '';

        switch (sourceType.value) {
            case 'file':
                imagePath = await this.handleFileUpload();
                break;
            case 'url':
                imagePath = await this.handleUrlInput();
                break;
            case 'remove':
                imagePath = '';
                break;
        }

        if (sourceType.value !== 'remove' && !imagePath) {
            return; // User cancelled or error occurred
        }

        // Update the configuration
        await this.updateBackgroundConfig(selectedArea.value, imagePath);

        // Switch to custom theme if not already
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const currentTheme = config.get<string>('selectedTheme');
        if (currentTheme !== 'custom') {
            await config.update('selectedTheme', 'custom', vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Switched to custom theme to use your uploaded background.');
        }

        const actionMessage = imagePath ? 'Background image updated!' : 'Background image removed!';
        vscode.window.showInformationMessage(`${actionMessage} Area: ${selectedArea.label}`);
    }

    /**
     * Handle file upload
     */
    private async handleFileUpload(): Promise<string> {
        const fileUri = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                'Images': ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']
            },
            openLabel: 'Select Background Image'
        });

        if (!fileUri || fileUri.length === 0) {
            return '';
        }

        const sourceFile = fileUri[0].fsPath;
        
        // Copy file to extension storage
        const fileName = path.basename(sourceFile);
        const timestamp = Date.now();
        const newFileName = `${timestamp}-${fileName}`;
        const storageDir = path.join(this.context.globalStorageUri.fsPath, 'backgrounds');
        
        try {
            // Ensure storage directory exists
            await fs.mkdir(storageDir, { recursive: true });
            
            const targetPath = path.join(storageDir, newFileName);
            await fs.copyFile(sourceFile, targetPath);
            
            // Return file:// URL for local files
            return vscode.Uri.file(targetPath).toString();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to copy background image: ${error}`);
            return '';
        }
    }

    /**
     * Handle URL input
     */
    private async handleUrlInput(): Promise<string> {
        const url = await vscode.window.showInputBox({
            prompt: 'Enter the image URL (must be HTTPS)',
            placeHolder: 'https://example.com/image.jpg',
            validateInput: (value) => {
                if (!value) {
                    return 'URL cannot be empty';
                }
                if (!value.startsWith('https://')) {
                    return 'URL must start with https://';
                }
                if (!this.isImageUrl(value)) {
                    return 'URL should point to an image file (jpg, png, gif, etc.)';
                }
                return null;
            }
        });

        return url || '';
    }

    /**
     * Check if URL looks like an image URL
     */
    private isImageUrl(url: string): boolean {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
        const lowercaseUrl = url.toLowerCase();
        return imageExtensions.some(ext => lowercaseUrl.includes(ext));
    }

    /**
     * Update background configuration
     */
    private async updateBackgroundConfig(area: string, imagePath: string): Promise<void> {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const customBackgrounds = config.get('customBackgrounds', {});
        
        const newBackgrounds = {
            ...customBackgrounds,
            [area]: imagePath
        };

        await config.update('customBackgrounds', newBackgrounds, vscode.ConfigurationTarget.Global);
    }

    /**
     * Get current background for an area
     */
    getCurrentBackground(area: string): string {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const customBackgrounds = config.get('customBackgrounds', {});
        return customBackgrounds[area] || '';
    }

    /**
     * Clear all backgrounds
     */
    async clearAllBackgrounds(): Promise<void> {
        const config = vscode.workspace.getConfiguration('happy-zencode');
        const emptyBackgrounds = {
            window: '',
            primarySidebar: '',
            editor: '',
            secondarySidebar: '',
            panel: '',
            welcomePage: ''
        };

        await config.update('customBackgrounds', emptyBackgrounds, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage('All background images cleared!');
    }

    /**
     * Clean up old background files
     */
    async cleanupOldBackgrounds(): Promise<void> {
        try {
            const storageDir = path.join(this.context.globalStorageUri.fsPath, 'backgrounds');
            const files = await fs.readdir(storageDir);
            
            const currentTime = Date.now();
            const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days

            for (const file of files) {
                const filePath = path.join(storageDir, file);
                const stats = await fs.stat(filePath);
                
                if (currentTime - stats.mtime.getTime() > maxAge) {
                    await fs.unlink(filePath);
                }
            }
        } catch (error) {
            console.log('Error cleaning up old backgrounds:', error);
        }
    }
}