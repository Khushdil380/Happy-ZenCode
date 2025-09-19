/**
 * VS Code installation path detection and file location utilities
 * Based on vscode-background extension architecture
 */

import * as path from 'path';
import * as vscode from 'vscode';
import { Utils } from '../core/Utils';

// Node.js globals
declare const __dirname: string;
declare const require: any;
declare const process: any;

export interface VSCodePaths {
    /** Base VS Code installation directory */
    base: string;
    /** Extension root directory */
    extensionRoot: string;
    /** CSS file path for legacy CSS injection (deprecated) */
    cssPath: string;
    /** JavaScript file path for workbench patching */
    jsPath: string;
}

export namespace VSCodePathDetector {
    /**
     * Detect if running on desktop vs web/server
     */
    export function isDesktop(): boolean {
        return vscode.env.appHost === 'desktop';
    }

    /**
     * Detect VS Code installation base directory
     */
    export function getBaseDirectory(): string {
        // Try to get from main filename first
        const mainFilename = require.main?.filename;
        if (mainFilename) {
            return path.dirname(mainFilename);
        }

        // Fallback to VS Code app root
        const vscodeInstallPath = vscode.env.appRoot;
        if (vscodeInstallPath) {
            return path.join(vscodeInstallPath, 'out');
        }

        throw new Error('Unable to detect VS Code installation path');
    }

    /**
     * Get CSS file path (legacy, deprecated)
     */
    export function getCSSPath(baseDir: string): string {
        const getCssPath = (cssFileName: string) => 
            path.join(baseDir, 'vs', 'workbench', cssFileName);

        const desktopPath = getCssPath('workbench.desktop.main.css');
        const webPath = getCssPath('workbench.web.main.css');

        return isDesktop() ? desktopPath : webPath;
    }

    /**
     * Get JavaScript file path for workbench patching
     */
    export function getJSPath(baseDir: string): string {
        if (isDesktop()) {
            // Desktop VS Code
            return path.join(baseDir, 'vs', 'workbench', 'workbench.desktop.main.js');
        } else {
            // Code-server or web version
            return path.join(baseDir, 'vs', 'code', 'browser', 'workbench', 'workbench.js');
        }
    }

    /**
     * Get extension root directory
     */
    export function getExtensionRoot(): string {
        // Use current module path to determine extension root
        return path.resolve(__dirname, '../..');
    }

    /**
     * Get all VS Code paths
     */
    export function getAllPaths(): VSCodePaths {
        const base = getBaseDirectory();
        
        return {
            base,
            extensionRoot: getExtensionRoot(),
            cssPath: getCSSPath(base),
            jsPath: getJSPath(base)
        };
    }

    /**
     * Validate that all paths exist and are accessible
     */
    export async function validatePaths(paths: VSCodePaths): Promise<{
        valid: boolean;
        issues: string[];
    }> {
        const issues: string[] = [];

        // Check if base directory exists
        if (!(await Utils.fileExists(paths.base))) {
            issues.push(`Base directory not found: ${paths.base}`);
        }

        // Check if JS file exists
        if (!(await Utils.fileExists(paths.jsPath))) {
            issues.push(`JavaScript file not found: ${paths.jsPath}`);
        }

        // Check if JS file is writable
        if (await Utils.fileExists(paths.jsPath) && !(await Utils.isWritable(paths.jsPath))) {
            issues.push(`JavaScript file not writable: ${paths.jsPath} (may need admin/sudo)`);
        }

        // Check extension root
        if (!(await Utils.fileExists(paths.extensionRoot))) {
            issues.push(`Extension root not found: ${paths.extensionRoot}`);
        }

        return {
            valid: issues.length === 0,
            issues
        };
    }

    /**
     * Get VS Code version information
     */
    export function getVSCodeVersion(): {
        version: string;
        parsed: { major: number; minor: number; patch: number };
    } {
        const version = vscode.version;
        const parsed = Utils.parseVSCodeVersion(version);
        
        return { version, parsed };
    }

    /**
     * Log path information for debugging
     */
    export async function logPathInfo(): Promise<void> {
        try {
            const paths = getAllPaths();
            const validation = await validatePaths(paths);
            const versionInfo = getVSCodeVersion();

            Utils.debugLog('VS Code Path Information', {
                isDesktop: isDesktop(),
                version: versionInfo.version,
                paths,
                validation
            });

            if (!validation.valid) {
                console.warn('[Happy-Zencode] Path validation issues:', validation.issues);
            }
        } catch (error) {
            console.error('[Happy-Zencode] Failed to get path information:', error);
        }
    }

    /**
     * Get platform-specific workbench directory for manual fixes
     */
    export function getWorkbenchDirectory(): string {
        const platform = process.platform;
        let workbenchPath: string;

        switch (platform) {
            case 'win32':
                workbenchPath = path.join(
                    process.env.LOCALAPPDATA || '',
                    'Programs',
                    'Microsoft VS Code',
                    'resources',
                    'app',
                    'out',
                    'vs',
                    'workbench'
                );
                break;
            case 'darwin':
                workbenchPath = '/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench';
                break;
            case 'linux':
                // Try common Linux installation paths
                const commonPaths = [
                    '/usr/share/code/resources/app/out/vs/workbench',
                    '/opt/visual-studio-code/resources/app/out/vs/workbench',
                    '/snap/code/current/usr/share/code/resources/app/out/vs/workbench'
                ];
                
                workbenchPath = commonPaths[0]; // Default to most common
                break;
            default:
                throw new Error(`Unsupported platform: ${platform}`);
        }

        return workbenchPath;
    }
}