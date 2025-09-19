"use strict";
/**
 * Shared utilities for the Happy-Zencode extension
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
exports.Utils = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const crypto_1 = require("crypto");
const os_1 = require("os");
var Utils;
(function (Utils) {
    /**
     * Sleep for specified milliseconds
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    Utils.sleep = sleep;
    /**
     * Generate a random UUID
     */
    function generateUUID() {
        return (0, crypto_1.randomUUID)();
    }
    Utils.generateUUID = generateUUID;
    /**
     * Safely read file with encoding
     */
    async function readFile(filePath, encoding = 'utf8') {
        try {
            return await fs_1.promises.readFile(filePath, encoding);
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error}`);
        }
    }
    Utils.readFile = readFile;
    /**
     * Safely write file with encoding
     */
    async function writeFile(filePath, content, encoding = 'utf8') {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs_1.promises.mkdir(dir, { recursive: true });
            await fs_1.promises.writeFile(filePath, content, encoding);
        }
        catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error}`);
        }
    }
    Utils.writeFile = writeFile;
    /**
     * Check if file exists
     */
    async function fileExists(filePath) {
        try {
            await fs_1.promises.access(filePath, fs_1.constants.F_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    Utils.fileExists = fileExists;
    /**
     * Check if file is writable
     */
    async function isWritable(filePath) {
        try {
            await fs_1.promises.access(filePath, fs_1.constants.W_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    Utils.isWritable = isWritable;
    /**
     * Create backup of file
     */
    async function createBackup(filePath) {
        const backupPath = `${filePath}.backup-${Date.now()}`;
        await fs_1.promises.copyFile(filePath, backupPath);
        return backupPath;
    }
    Utils.createBackup = createBackup;
    /**
     * Restore file from backup
     */
    async function restoreBackup(originalPath, backupPath) {
        await fs_1.promises.copyFile(backupPath, originalPath);
        await fs_1.promises.unlink(backupPath);
    }
    Utils.restoreBackup = restoreBackup;
    /**
     * Normalize image URL for VS Code
     * Converts file:// URLs to vscode-file://vscode-app protocol
     */
    function normalizeImageUrl(imageUrl) {
        if (!imageUrl.startsWith('file://')) {
            return imageUrl;
        }
        // file:///C:/path/image.png => vscode-file://vscode-app/C:/path/image.png
        const normalizedUrl = imageUrl.replace('file://', 'vscode-file://vscode-app');
        return normalizedUrl;
    }
    Utils.normalizeImageUrl = normalizeImageUrl;
    /**
     * Convert local file path to vscode-file URL
     */
    function pathToVSCodeFileUrl(filePath) {
        // Normalize path separators to forward slashes
        const normalizedPath = filePath.replace(/\\/g, '/');
        // Remove drive letter colon on Windows (C: becomes C)
        const urlPath = normalizedPath.replace(/^([A-Za-z]):/, '$1');
        return `vscode-file://vscode-app/${urlPath}`;
    }
    Utils.pathToVSCodeFileUrl = pathToVSCodeFileUrl;
    /**
     * Wrap code in IIFE (Immediately Invoked Function Expression)
     */
    function wrapInIIFE(code) {
        return `(function(){${code}})();`;
    }
    Utils.wrapInIIFE = wrapInIIFE;
    /**
     * Create CSS template with proper escaping
     */
    function createCSSTemplate(template, variables) {
        let result = template;
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = new RegExp(`\\$\\{${key}\\}`, 'g');
            result = result.replace(placeholder, value);
        }
        return result;
    }
    Utils.createCSSTemplate = createCSSTemplate;
    /**
     * Log debug information if debug mode is enabled
     */
    function debugLog(message, data) {
        const debugMode = process.env.HAPPY_ZENCODE_DEBUG === 'true';
        if (debugMode) {
            console.log(`[Happy-Zencode Debug] ${message}`, data || '');
        }
    }
    Utils.debugLog = debugLog;
    /**
     * Calculate MD5 hash of string
     */
    function calculateHash(content) {
        return (0, crypto_1.createHash)('md5').update(content).digest('hex');
    }
    Utils.calculateHash = calculateHash;
    /**
     * Parse VS Code version string
     */
    function parseVSCodeVersion(versionString) {
        const parts = versionString.split('.').map(Number);
        return {
            major: parts[0] || 0,
            minor: parts[1] || 0,
            patch: parts[2] || 0
        };
    }
    Utils.parseVSCodeVersion = parseVSCodeVersion;
    /**
     * Sanitize file name for safe usage
     */
    function sanitizeFileName(fileName) {
        return fileName.replace(/[<>:"/\\|?*]/g, '_');
    }
    Utils.sanitizeFileName = sanitizeFileName;
    /**
     * Get temporary directory path
     */
    function getTempDir() {
        return (0, os_1.tmpdir)();
    }
    Utils.getTempDir = getTempDir;
    /**
     * Format bytes to human readable string
     */
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    Utils.formatBytes = formatBytes;
})(Utils || (exports.Utils = Utils = {}));
//# sourceMappingURL=Utils.js.map