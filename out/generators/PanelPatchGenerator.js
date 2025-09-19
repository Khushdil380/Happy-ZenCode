"use strict";
/**
 * Panel patch generator for VS Code background images
 * Generates JavaScript code to inject background images into the panel area (terminal/output/problems)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PanelPatchGenerator = void 0;
const BasePatchGenerator_1 = require("./BasePatchGenerator");
/**
 * Panel patch generator for background images in the bottom panel area
 */
class PanelPatchGenerator extends BasePatchGenerator_1.BasePatchGenerator {
    constructor(config) {
        super({
            useFront: false, // Default to behind for panel
            ...config
        });
        this.cssPlaceholder = '--happy-zencode-panel-placeholder';
    }
    /**
     * Get the CSS styles for panel background
     */
    getStyle() {
        const { images, useFront } = this.config;
        if (!images.length) {
            return '';
        }
        const pseudoElement = useFront ? 'after' : 'before';
        return this.compileCSS((0, BasePatchGenerator_1.css) `
            /* Panel background */
            .part.panel.bottom {
                position: relative;
            }

            .part.panel.bottom::${pseudoElement} {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: ${useFront ? 100 : -1};
                pointer-events: none;
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                /* Dynamic placeholder for image replacement */
                ${this.cssPlaceholder}0: #000;
                ${this.cssPlaceholder}-end: #000;
            }

            /* Ensure panel content stays visible */
            .part.panel.bottom .content {
                position: relative;
                z-index: 1;
            }

            /* Target specific panel views */
            .part.panel.bottom .panel-view-container {
                position: relative;
                z-index: 1;
            }
        `);
    }
    /**
     * Get JavaScript code for panel background management
     */
    getScript() {
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        const styleTemplate = this.getStyleTemplate();
        const imageStyles = this.getImageStyles();
        return `
        // Panel background application
        const panelStyleTemplate = ${JSON.stringify(styleTemplate)};
        const panelImageStyles = ${JSON.stringify(imageStyles)};
        
        const panelStyle = (() => {
            const ele = document.createElement('style');
            ele.id = 'happy-zencode-panel-styles';
            document.head.appendChild(ele);
            return ele;
        })();

        function applyPanelStyles() {
            let currentStyle = panelStyleTemplate;
            
            for (let i = 0; i < panelImageStyles.length; i++) {
                const placeholder = new RegExp('${this.cssPlaceholder}' + i + '[^;]+;', 'g');
                currentStyle = currentStyle.replace(placeholder, panelImageStyles[i]);
            }
            
            panelStyle.textContent = currentStyle;
        }

        applyPanelStyles();
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
exports.PanelPatchGenerator = PanelPatchGenerator;
//# sourceMappingURL=PanelPatchGenerator.js.map