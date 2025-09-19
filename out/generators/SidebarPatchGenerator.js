"use strict";
/**
 * Sidebar patch generator for VS Code background images
 * Generates JavaScript code to inject background images into the primary sidebar area
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SidebarPatchGenerator = void 0;
const BasePatchGenerator_1 = require("./BasePatchGenerator");
/**
 * Sidebar patch generator for background images in the primary sidebar area
 */
class SidebarPatchGenerator extends BasePatchGenerator_1.BasePatchGenerator {
    constructor(config) {
        super({
            useFront: false, // Default to behind for sidebar
            ...config
        });
        this.cssPlaceholder = '--happy-zencode-sidebar-placeholder';
    }
    /**
     * Get the CSS styles for sidebar background
     */
    getStyle() {
        const { images, useFront } = this.config;
        if (!images.length) {
            return '';
        }
        const pseudoElement = useFront ? 'after' : 'before';
        return this.compileCSS((0, BasePatchGenerator_1.css) `
            /* Primary sidebar background */
            .part.sidebar.left {
                position: relative;
            }

            .part.sidebar.left::${pseudoElement} {
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

            /* Ensure content stays visible */
            .part.sidebar.left .content {
                position: relative;
                z-index: 1;
            }
        `);
    }
    /**
     * Get JavaScript code for sidebar background management
     */
    getScript() {
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        const styleTemplate = this.getStyleTemplate();
        const imageStyles = this.getImageStyles();
        return `
        // Sidebar background application
        const sidebarStyleTemplate = ${JSON.stringify(styleTemplate)};
        const sidebarImageStyles = ${JSON.stringify(imageStyles)};
        
        const sidebarStyle = (() => {
            const ele = document.createElement('style');
            ele.id = 'happy-zencode-sidebar-styles';
            document.head.appendChild(ele);
            return ele;
        })();

        function applySidebarStyles() {
            let currentStyle = sidebarStyleTemplate;
            
            for (let i = 0; i < sidebarImageStyles.length; i++) {
                const placeholder = new RegExp('${this.cssPlaceholder}' + i + '[^;]+;', 'g');
                currentStyle = currentStyle.replace(placeholder, sidebarImageStyles[i]);
            }
            
            sidebarStyle.textContent = currentStyle;
        }

        applySidebarStyles();
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
exports.SidebarPatchGenerator = SidebarPatchGenerator;
//# sourceMappingURL=SidebarPatchGenerator.js.map