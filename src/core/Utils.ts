/**
 * Shared utilities for the Happy-Zencode extension
 */

import { promises as fs, constants as fsConstants } from 'fs';
import * as path from 'path';
import { createHash, randomUUID } from 'crypto';
import { tmpdir } from 'os';

export namespace Utils {
    /**
     * Sleep for specified milliseconds
     */
    export function sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate a random UUID
     */
    export function generateUUID(): string {
        return randomUUID();
    }

    /**
     * Safely read file with encoding
     */
    export async function readFile(filePath: string, encoding: 'utf8' = 'utf8'): Promise<string> {
        try {
            return await fs.readFile(filePath, encoding);
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error}`);
        }
    }

    /**
     * Safely write file with encoding
     */
    export async function writeFile(filePath: string, content: string, encoding: 'utf8' = 'utf8'): Promise<void> {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            
            await fs.writeFile(filePath, content, encoding);
        } catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error}`);
        }
    }

    /**
     * Check if file exists
     */
    export async function fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath, fsConstants.F_OK);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Check if file is writable
     */
    export async function isWritable(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath, fsConstants.W_OK);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create backup of file
     */
    export async function createBackup(filePath: string): Promise<string> {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        await fs.copyFile(filePath, backupPath);
        return backupPath;
    }

    /**
     * Restore file from backup
     */
    export async function restoreBackup(originalPath: string, backupPath: string): Promise<void> {
        await fs.copyFile(backupPath, originalPath);
        await fs.unlink(backupPath);
    }

    /**
     * Normalize image URL for VS Code
     * Converts file:// URLs to vscode-file://vscode-app protocol
     */
    export function normalizeImageUrl(imageUrl: string): string {
        if (!imageUrl.startsWith('file://')) {
            return imageUrl;
        }

        // file:///C:/path/image.png => vscode-file://vscode-app/C:/path/image.png
        const normalizedUrl = imageUrl.replace('file://', 'vscode-file://vscode-app');
        return normalizedUrl;
    }

    /**
     * Convert local file path to vscode-file URL
     */
    export function pathToVSCodeFileUrl(filePath: string): string {
        // Normalize path separators to forward slashes
        const normalizedPath = filePath.replace(/\\/g, '/');
        
        // Remove drive letter colon on Windows (C: becomes C)
        const urlPath = normalizedPath.replace(/^([A-Za-z]):/, '$1');
        
        return `vscode-file://vscode-app/${urlPath}`;
    }

    /**
     * Wrap code in IIFE (Immediately Invoked Function Expression)
     */
    export function wrapInIIFE(code: string): string {
        return `(function(){${code}})();`;
    }

    /**
     * Create CSS template with proper escaping
     */
    export function createCSSTemplate(template: string, variables: Record<string, string>): string {
        let result = template;
        
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
            result = result.replace(placeholder, value);
        }
        
        return result;
    }

    /**
     * Log debug information if debug mode is enabled
     */
    export function debugLog(message: string, data?: any): void {
        const debugMode = process.env.HAPPY_ZENCODE_DEBUG === 'true';
        if (debugMode) {
            console.log(`[Happy-Zencode Debug] ${message}`, data || '');
        }
    }

    /**
     * Calculate MD5 hash of string
     */
    export function calculateHash(content: string): string {
        return createHash('md5').update(content).digest('hex');
    }

    /**
     * Parse VS Code version string
     */
    export function parseVSCodeVersion(versionString: string): { major: number; minor: number; patch: number } {
        const parts = versionString.split('.').map(Number);
        return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
        };
    }

    /**
     * Sanitize file name for safe usage
     */
    export function sanitizeFileName(fileName: string): string {
        return fileName.replace(/[<>:"/\\|?*]/g, '_');
    }

    /**
     * Get temporary directory path
     */
    export function getTempDir(): string {
        return tmpdir();
    }

    /**
     * Format bytes to human readable string
     */
    export function formatBytes(bytes: number, decimals: number = 2): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}