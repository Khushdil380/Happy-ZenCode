import * as vscode from 'vscode';
export declare class BackgroundManager {
    private context;
    constructor(context: vscode.ExtensionContext);
    /**
     * Show background image uploader interface
     */
    showBackgroundUploader(): Promise<void>;
    /**
     * Handle file upload
     */
    private handleFileUpload;
    /**
     * Handle URL input
     */
    private handleUrlInput;
    /**
     * Check if URL looks like an image URL
     */
    private isImageUrl;
    /**
     * Update background configuration
     */
    private updateBackgroundConfig;
    /**
     * Get current background for an area
     */
    getCurrentBackground(area: string): string;
    /**
     * Clear all backgrounds
     */
    clearAllBackgrounds(): Promise<void>;
    /**
     * Clean up old background files
     */
    cleanupOldBackgrounds(): Promise<void>;
}
//# sourceMappingURL=backgroundManager.d.ts.map