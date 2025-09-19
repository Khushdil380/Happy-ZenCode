"use strict";
/**
 * Base patch generator for creating JavaScript injection code
 * Based on vscode-background extension architecture
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePatchGenerator = void 0;
exports.css = css;
const Utils_1 = require("../core/Utils");
/**
 * CSS template literal helper function
 * Enables syntax highlighting and IntelliSense for CSS-in-JS
 */
function css(template, ...args) {
    return template.reduce((prev, curr, i) => {
        let arg = args[i];
        // Handle function arguments
        if (typeof arg === 'function') {
            arg = arg();
        }
        // Handle array arguments
        if (Array.isArray(arg)) {
            arg = arg.join('');
        }
        return prev + curr + (arg ?? '');
    }, '');
}
/**
 * Abstract base class for patch generators
 */
class BasePatchGenerator {
    constructor(config) {
        this.config = {
            images: [],
            style: {},
            styles: [],
            opacity: 0.1,
            size: 'cover',
            position: 'center center',
            useFront: true,
            ...config
        };
    }
    /**
     * Normalize image URLs for VS Code compatibility
     * Converts file:// URLs to vscode-file://vscode-app protocol
     */
    normalizeImageUrls(images) {
        return images.map(imageUrl => {
            return Utils_1.Utils.normalizeImageUrl(imageUrl);
        });
    }
    /**
     * Compile CSS using a simple CSS processor
     */
    compileCSS(source) {
        // Simple CSS compilation - remove excess whitespace and comments
        return source
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .trim();
    }
    /**
     * Create image preload script
     */
    getPreload() {
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        if (normalizedImages.length === 0) {
            return '';
        }
        return `
        // Preload images for better performance
        const images = ${JSON.stringify(normalizedImages)};
        images.forEach(src => {
            const img = new Image();
            img.src = src;
        });
        `;
    }
    /**
     * Get additional JavaScript code to execute
     */
    getScript() {
        return '';
    }
    /**
     * Create the complete patch content
     */
    create() {
        if (!this.config?.images.length) {
            return '';
        }
        const style = this.compileCSS(this.getStyle());
        const script = this.getScript().trim();
        const components = [
            this.getPreload(),
            `
                var style = document.createElement("style");
                style.textContent = ${JSON.stringify(style)};
                document.head.appendChild(style);
            `,
            script
        ]
            .filter(component => component.trim().length > 0)
            .map(component => Utils_1.Utils.wrapInIIFE(component));
        return components.join(';');
    }
    /**
     * Get default styles combined with custom styles
     */
    getDefaultStyles() {
        return {
            'content': '""',
            'position': 'absolute',
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'background-repeat': 'no-repeat',
            'background-attachment': 'fixed',
            'background-size': this.config.size || 'cover',
            'background-position': this.config.position || 'center center',
            'opacity': String(this.config.opacity || 0.1),
            'pointer-events': this.config.useFront ? 'none' : 'initial',
            'z-index': this.config.useFront ? '99' : 'initial',
            'transition': '0.3s',
            ...this.config.style
        };
    }
    /**
     * Convert style object to CSS string
     */
    stylesToCSS(styles) {
        return Object.entries(styles)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    }
    /**
     * Get CSS variable name for background image
     */
    getImageVariable(index) {
        return `--happy-zencode-bg-${index}`;
    }
    /**
     * Create CSS with dynamic image variables
     */
    createImageCSS(selector, styles, imageIndex) {
        const imageVar = this.getImageVariable(imageIndex);
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        const imageUrl = normalizedImages[imageIndex] || '';
        return css `
            ${selector} {
                ${this.stylesToCSS(styles)}
                background-image: url('${imageUrl}');
                ${imageVar}: url('${imageUrl}');
            }
        `;
    }
    /**
     * Get version information for debugging
     */
    getVersionInfo() {
        return `
        console.log('[Happy-Zencode] Background patch applied - v1.0.0');
        console.log('[Happy-Zencode] Images:', ${JSON.stringify(this.normalizeImageUrls(this.config.images))});
        `;
    }
}
exports.BasePatchGenerator = BasePatchGenerator;
//# sourceMappingURL=BasePatchGenerator.js.map