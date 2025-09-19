"use strict";
/**
 * Window patch generator for VS Code background images
 * Generates JavaScript code to inject background images into the main window/workbench area
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WindowPatchGenerator = void 0;
const BasePatchGenerator_1 = require("./BasePatchGenerator");
/**
 * Window patch generator for background images in the main workbench area
 */
class WindowPatchGenerator extends BasePatchGenerator_1.BasePatchGenerator {
    constructor(config) {
        super({
            useFront: false, // Default to behind for window
            ...config
        });
        this.cssPlaceholder = '--happy-zencode-window-placeholder';
    }
    /**
     * Get the CSS styles for window background
     */
    getStyle() {
        const { images, useFront } = this.config;
        if (!images.length) {
            return '';
        }
        const pseudoElement = useFront ? 'after' : 'before';
        return this.compileCSS((0, BasePatchGenerator_1.css) `
            /* Main workbench background */
            .monaco-workbench {
                position: relative;
            }

            .monaco-workbench::${pseudoElement} {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: ${useFront ? 1000 : -1};
                pointer-events: none;
                background-repeat: no-repeat;
                background-attachment: fixed;
                background-position: center;
                background-size: cover;
                /* Dynamic placeholder for image replacement */
                ${this.cssPlaceholder}0: #000;
                ${this.cssPlaceholder}-end: #000;
            }
        `);
    }
    /**
     * Get JavaScript code for window background management
     */
    getScript() {
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        const styleTemplate = this.getStyleTemplate();
        const imageStyles = this.getImageStyles();
        return `
        // Window background application
        const windowStyleTemplate = ${JSON.stringify(styleTemplate)};
        const windowImageStyles = ${JSON.stringify(imageStyles)};
        
        const windowStyle = (() => {
            const ele = document.createElement('style');
            ele.id = 'happy-zencode-window-styles';
            document.head.appendChild(ele);
            return ele;
        })();

        function applyWindowStyles() {
            let currentStyle = windowStyleTemplate;
            
            for (let i = 0; i < windowImageStyles.length; i++) {
                const placeholder = new RegExp('${this.cssPlaceholder}' + i + '[^;]+;', 'g');
                currentStyle = currentStyle.replace(placeholder, windowImageStyles[i]);
            }
            
            windowStyle.textContent = currentStyle;
        }

        applyWindowStyles();
        `;
    }
    /**
     * Get style template with placeholders
     */
    getStyleTemplate() {
        return this.getStyle();
    }
    /**
     * Get image-specific styles
     */
    getImageStyles() {
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        return normalizedImages.map(image => `background-image: url('${image}');`);
    }
}
exports.WindowPatchGenerator = WindowPatchGenerator;
//# sourceMappingURL=WindowPatchGenerator.js.map