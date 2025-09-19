"use strict";
/**
 * VS Code installation path detection and file location utilities
 * Based on vscode-background extension architecture
 */
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
exports.VSCodePathDetector = void 0;
const path = __importStar(require("path"));
const vscode = __importStar(require("vscode"));
const Utils_1 = require("../core/Utils");
var VSCodePathDetector;
(function (VSCodePathDetector) {
    /**
     * Detect if running on desktop vs web/server
     */
    function isDesktop() {
        return vscode.env.appHost === 'desktop';
    }
    VSCodePathDetector.isDesktop = isDesktop;
    /**
     * Detect VS Code installation base directory
     */
    function getBaseDirectory() {
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
    VSCodePathDetector.getBaseDirectory = getBaseDirectory;
    /**
     * Get CSS file path (legacy, deprecated)
     */
    function getCSSPath(baseDir) {
        const getCssPath = (cssFileName) => path.join(baseDir, 'vs', 'workbench', cssFileName);
        const desktopPath = getCssPath('workbench.desktop.main.css');
        const webPath = getCssPath('workbench.web.main.css');
        return isDesktop() ? desktopPath : webPath;
    }
    VSCodePathDetector.getCSSPath = getCSSPath;
    /**
     * Get JavaScript file path for workbench patching
     */
    function getJSPath(baseDir) {
        if (isDesktop()) {
            // Desktop VS Code
            return path.join(baseDir, 'vs', 'workbench', 'workbench.desktop.main.js');
        }
        else {
            // Code-server or web version
            return path.join(baseDir, 'vs', 'code', 'browser', 'workbench', 'workbench.js');
        }
    }
    VSCodePathDetector.getJSPath = getJSPath;
    /**
     * Get extension root directory
     */
    function getExtensionRoot() {
        // Use current module path to determine extension root
        return path.resolve(__dirname, '../..');
    }
    VSCodePathDetector.getExtensionRoot = getExtensionRoot;
    /**
     * Get all VS Code paths
     */
    function getAllPaths() {
        const base = getBaseDirectory();
        return {
            base,
            extensionRoot: getExtensionRoot(),
            cssPath: getCSSPath(base),
            jsPath: getJSPath(base)
        };
    }
    VSCodePathDetector.getAllPaths = getAllPaths;
    /**
     * Validate that all paths exist and are accessible
     */
    async function validatePaths(paths) {
        const issues = [];
        // Check if base directory exists
        if (!(await Utils_1.Utils.fileExists(paths.base))) {
            issues.push(`Base directory not found: ${paths.base}`);
        }
        // Check if JS file exists
        if (!(await Utils_1.Utils.fileExists(paths.jsPath))) {
            issues.push(`JavaScript file not found: ${paths.jsPath}`);
        }
        // Check if JS file is writable
        if (await Utils_1.Utils.fileExists(paths.jsPath) && !(await Utils_1.Utils.isWritable(paths.jsPath))) {
            issues.push(`JavaScript file not writable: ${paths.jsPath} (may need admin/sudo)`);
        }
        // Check extension root
        if (!(await Utils_1.Utils.fileExists(paths.extensionRoot))) {
            issues.push(`Extension root not found: ${paths.extensionRoot}`);
        }
        return {
            valid: issues.length === 0,
            issues
        };
    }
    VSCodePathDetector.validatePaths = validatePaths;
    /**
     * Get VS Code version information
     */
    function getVSCodeVersion() {
        const version = vscode.version;
        const parsed = Utils_1.Utils.parseVSCodeVersion(version);
        return { version, parsed };
    }
    VSCodePathDetector.getVSCodeVersion = getVSCodeVersion;
    /**
     * Log path information for debugging
     */
    async function logPathInfo() {
        try {
            const paths = getAllPaths();
            const validation = await validatePaths(paths);
            const versionInfo = getVSCodeVersion();
            Utils_1.Utils.debugLog('VS Code Path Information', {
                isDesktop: isDesktop(),
                version: versionInfo.version,
                paths,
                validation
            });
            if (!validation.valid) {
                console.warn('[Happy-Zencode] Path validation issues:', validation.issues);
            }
        }
        catch (error) {
            console.error('[Happy-Zencode] Failed to get path information:', error);
        }
    }
    VSCodePathDetector.logPathInfo = logPathInfo;
    /**
     * Get platform-specific workbench directory for manual fixes
     */
    function getWorkbenchDirectory() {
        const platform = process.platform;
        let workbenchPath;
        switch (platform) {
            case 'win32':
                workbenchPath = path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Microsoft VS Code', 'resources', 'app', 'out', 'vs', 'workbench');
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
    VSCodePathDetector.getWorkbenchDirectory = getWorkbenchDirectory;
})(VSCodePathDetector || (exports.VSCodePathDetector = VSCodePathDetector = {}));
//# sourceMappingURL=VSCodePath.js.map