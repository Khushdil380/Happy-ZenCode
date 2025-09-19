import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Alternative CSS injection approach using workspace settings
 * This approach doesn't require file modification
 */
export class CSSInjectionManager {
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Apply CSS through workspace settings (alternative approach)
     */
    async applyCSSViaSettings(backgrounds: any, opacity: any): Promise<void> {
        try {
            // Generate custom CSS content
            const css = this.generateCustomCSS(backgrounds, opacity);
            
            // Create CSS file in extension directory
            const cssPath = path.join(this.context.globalStorageUri.fsPath, 'happy-zencode.css');
            
            // Ensure directory exists
            await fs.promises.mkdir(path.dirname(cssPath), { recursive: true });
            
            // Write CSS file
            await fs.promises.writeFile(cssPath, css, 'utf-8');
            
            // Update workspace settings to include our CSS file
            const config = vscode.workspace.getConfiguration();
            
            // Use vscode-custom-css approach
            const cssFile = vscode.Uri.file(cssPath).toString();
            
            await config.update('vscode_custom_css.imports', [cssFile], vscode.ConfigurationTarget.Global);
            
            vscode.window.showInformationMessage(
                'CSS applied via workspace settings. If you have "Custom CSS and JS Loader" extension, reload the window.',
                'Reload Window'
            ).then(selection => {
                if (selection === 'Reload Window') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
            
        } catch (error) {
            console.error('CSS injection via settings failed:', error);
            throw error;
        }
    }

    /**
     * Apply CSS through webview approach
     */
    async applyCSSViaWebview(backgrounds: any, opacity: any): Promise<void> {
        try {
            // Create a hidden webview to inject CSS
            const panel = vscode.window.createWebviewPanel(
                'happyZencodeCSS',
                'Happy Zencode CSS Injector',
                { viewColumn: vscode.ViewColumn.One, preserveFocus: false },
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );

            const css = this.generateCustomCSS(backgrounds, opacity);
            
            panel.webview.html = this.getWebviewContent(css);
            
            // Hide the panel immediately
            panel.dispose();
            
            vscode.window.showInformationMessage('CSS applied via webview method.');
            
        } catch (error) {
            console.error('CSS injection via webview failed:', error);
            throw error;
        }
    }

    /**
     * Generate CSS content for injection
     */
    private generateCustomCSS(backgrounds: any, opacity: any): string {
        let css = `
/* Happy Zencode Custom CSS Injection */

/* Hide corruption warnings */
.notifications-toasts .notification-toast .notification-toast-contents .notification-list-item[aria-label*="corrupt"] {
    display: none !important;
}

/* Base styles for backgrounds */
body,
.monaco-workbench {
    position: relative;
}

.split-view-view > .editor-group-container,
.split-view-view > .part.sidebar,
.split-view-view > .part.auxiliarybar,
.split-view-view > .part.panel {
    position: relative;
}

/* Pseudo-element backgrounds */
body::before,
.split-view-view > .editor-group-container::after,
.split-view-view > .part.sidebar::after,
.split-view-view > .part.auxiliarybar::after,
.split-view-view > .part.panel::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    background-attachment: fixed;
    pointer-events: none;
    z-index: -1;
    transition: opacity 0.3s ease;
}
`;

        // Convert file paths to data URLs for better compatibility
        if (backgrounds.window) {
            const dataUrl = this.convertToDataUrl(backgrounds.window);
            if (dataUrl) {
                css += `
/* Window background */
body::before {
    background-image: url("${dataUrl}");
    opacity: ${opacity.window || 0.3};
}`;
            }
        }

        if (backgrounds.editor) {
            const dataUrl = this.convertToDataUrl(backgrounds.editor);
            if (dataUrl) {
                css += `
/* Editor background */
.split-view-view > .editor-group-container::after {
    background-image: url("${dataUrl}");
    opacity: ${opacity.editor || 0.1};
}`;
            }
        }

        if (backgrounds.primarySidebar) {
            const dataUrl = this.convertToDataUrl(backgrounds.primarySidebar);
            if (dataUrl) {
                css += `
/* Primary sidebar background */
.split-view-view > .part.sidebar::after {
    background-image: url("${dataUrl}");
    opacity: ${opacity.primarySidebar || 0.3};
}`;
            }
        }

        if (backgrounds.secondarySidebar) {
            const dataUrl = this.convertToDataUrl(backgrounds.secondarySidebar);
            if (dataUrl) {
                css += `
/* Secondary sidebar background */
.split-view-view > .part.auxiliarybar::after {
    background-image: url("${dataUrl}");
    opacity: ${opacity.secondarySidebar || 0.3};
}`;
            }
        }

        if (backgrounds.panel) {
            const dataUrl = this.convertToDataUrl(backgrounds.panel);
            if (dataUrl) {
                css += `
/* Panel background */
.split-view-view > .part.panel::after {
    background-image: url("${dataUrl}");
    opacity: ${opacity.panel || 0.3};
}`;
            }
        }

        return css;
    }

    /**
     * Convert file path to data URL
     */
    private convertToDataUrl(filePath: string): string | null {
        try {
            if (filePath.startsWith('http')) {
                return filePath; // Return HTTP URLs as-is
            }

            // Clean the file path
            const cleanPath = filePath.replace(/^file:\/\/\//, '').replace(/^vscode-file:\/\/vscode-app\//, '');
            
            if (!fs.existsSync(cleanPath)) {
                console.warn(`File not found: ${cleanPath}`);
                return null;
            }

            const imageBuffer = fs.readFileSync(cleanPath);
            const ext = path.extname(cleanPath).toLowerCase().substring(1);
            const mimeType = this.getMimeType(ext);
            const base64 = imageBuffer.toString('base64');
            
            return `data:${mimeType};base64,${base64}`;
        } catch (error) {
            console.error('Error converting to data URL:', error);
            return null;
        }
    }

    /**
     * Get MIME type for file extensions
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

    /**
     * Generate webview HTML content
     */
    private getWebviewContent(css: string): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        ${css}
    </style>
</head>
<body>
    <script>
        // Try to inject CSS into parent window
        if (window.parent && window.parent.document) {
            const style = window.parent.document.createElement('style');
            style.id = 'happy-zencode-injected';
            style.textContent = \`${css.replace(/`/g, '\\`')}\`;
            
            // Remove existing style
            const existing = window.parent.document.getElementById('happy-zencode-injected');
            if (existing) {
                existing.remove();
            }
            
            window.parent.document.head.appendChild(style);
            console.log('Happy Zencode CSS injected via webview');
        }
    </script>
</body>
</html>`;
    }
}