"use strict";
/**
 * Editor patch generator for VS Code background images
 * Generates JavaScript code to inject background images into the editor area
 * Based on successful vscode-background extension patterns
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditorPatchGenerator = void 0;
const BasePatchGenerator_1 = require("./BasePatchGenerator");
/**
 * Editor patch generator for background images in the editor area
 * This generates the actual JavaScript code that modifies VS Code's DOM
 */
class EditorPatchGenerator extends BasePatchGenerator_1.BasePatchGenerator {
    constructor(config) {
        super({
            useFront: true,
            interval: 0,
            random: false,
            ...config
        });
        this.cssPlaceholder = '--happy-zencode-editor-placeholder';
    }
    /**
     * Get the CSS styles for editor background
     */
    getStyle() {
        const { images, useFront } = this.config;
        if (!images.length) {
            return '';
        }
        // Determine pseudo-element to use
        const pseudoElement = useFront ? 'after' : 'before';
        return this.compileCSS((0, BasePatchGenerator_1.css) `
            /* Reduce minimap opacity for better visibility */
            .minimap {
                opacity: 0.8;
            }

            /* Remove background from monaco editor to prevent conflicts */
            [id='workbench.parts.editor'] .split-view-view {
                .editor-container .overflow-guard > .monaco-scrollable-element > .monaco-editor-background {
                    background: none;
                }

                /* Apply background to each editor instance */
                ${images.map((_, index) => {
            const nthChild = `${images.length}n + ${index + 1}`;
            return (0, BasePatchGenerator_1.css) `
                        /* Code editor background */
                        &:nth-child(${nthChild}) .editor-instance > .monaco-editor .overflow-guard > .monaco-scrollable-element::${pseudoElement},
                        /* Home screen (welcome tab) background */
                        &:nth-child(${nthChild}) .editor-group-container.empty::before {
                            content: '';
                            width: 100%;
                            height: 100%;
                            position: absolute;
                            z-index: ${useFront ? 99 : 'initial'};
                            pointer-events: ${useFront ? 'none' : 'initial'};
                            transition: 0.3s;
                            background-repeat: no-repeat;
                            background-attachment: fixed;
                            /* Dynamic placeholder for image replacement */
                            ${this.cssPlaceholder}${index}: #000;
                            ${this.cssPlaceholder}-end: #000;
                        }
                    `;
        })}
            }
        `);
    }
    /**
     * Get JavaScript code for dynamic image management
     */
    getScript() {
        const { images, interval, random } = this.config;
        if (!images.length || !interval) {
            return this.getStaticScript();
        }
        return this.getDynamicScript();
    }
    /**
     * Get static script that just sets images once
     */
    getStaticScript() {
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        const styleTemplate = this.getStyleTemplate();
        const imageStyles = this.getImageStyles();
        return `
        // Static image application
        const styleTemplate = ${JSON.stringify(styleTemplate)};
        const imageStyles = ${JSON.stringify(imageStyles)};
        
        const style = (() => {
            const ele = document.createElement('style');
            document.head.appendChild(ele);
            return ele;
        })();

        function applyStyles() {
            let currentStyle = styleTemplate;
            
            for (let i = 0; i < imageStyles.length; i++) {
                const placeholder = new RegExp('${this.cssPlaceholder}' + i + '[^;]+;', 'g');
                currentStyle = currentStyle.replace(placeholder, imageStyles[i]);
            }
            
            style.textContent = currentStyle;
        }

        applyStyles();
        ${this.getVersionInfo()}
        `;
    }
    /**
     * Get dynamic script for image cycling
     */
    getDynamicScript() {
        const { interval, random } = this.config;
        const styleTemplate = this.getStyleTemplate();
        const imageStyles = this.getImageStyles();
        return `
        // Dynamic image cycling
        const styleTemplate = ${JSON.stringify(styleTemplate)};
        const imageStyles = ${JSON.stringify(imageStyles)};
        const interval = ${interval};
        const random = ${random};

        let currentIndex = -1;

        const style = (() => {
            const ele = document.createElement('style');
            document.head.appendChild(ele);
            return ele;
        })();

        function getNextStyles() {
            if (random) {
                return imageStyles.slice().sort(() => Math.random() - 0.5);
            }

            currentIndex++;
            currentIndex = currentIndex % imageStyles.length;
            
            return imageStyles.map((_, index) => {
                const styleIndex = (currentIndex + index) % imageStyles.length;
                return imageStyles[styleIndex];
            });
        }

        function setNextStyles() {
            let currentStyle = styleTemplate;
            const nextStyles = getNextStyles();
            
            for (let i = 0; i < nextStyles.length; i++) {
                const placeholder = new RegExp('${this.cssPlaceholder}' + i + '[^;]+;', 'g');
                currentStyle = currentStyle.replace(placeholder, nextStyles[i]);
            }
            
            style.textContent = currentStyle;
        }

        // Apply initial styles
        setNextStyles();

        // Set up interval for image cycling
        if (interval > 0) {
            setInterval(setNextStyles, interval * 1000);
        }

        ${this.getVersionInfo()}
        `;
    }
    /**
     * Get style template with placeholders for dynamic replacement
     */
    getStyleTemplate() {
        return this.getStyle();
    }
    /**
     * Get individual image styles for each image
     */
    getImageStyles() {
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        const defaultStyles = this.getDefaultStyles();
        return normalizedImages.map((imageUrl, index) => {
            // Get custom styles for this specific image
            const customStyles = this.config.styles?.[index] || {};
            const combinedStyles = { ...defaultStyles, ...customStyles };
            // Create the CSS property string for this image
            const styleEntries = Object.entries(combinedStyles)
                .filter(([key]) => !['pointer-events', 'z-index'].includes(key) || this.config.useFront)
                .map(([key, value]) => `${key}: ${value};`);
            return `background-image: url('${imageUrl}'); ${styleEntries.join(' ')}`;
        });
    }
    /**
     * Get styles specific to editor backgrounds, excluding incompatible properties
     */
    getDefaultStyles() {
        const baseStyles = super.getDefaultStyles();
        // Remove properties that don't work well in editor context
        const { content, position, top, left, width, height, ...editorStyles } = baseStyles;
        return {
            'background-repeat': 'no-repeat',
            'background-attachment': 'fixed',
            'background-size': this.config.size || 'cover',
            'background-position': this.config.position || 'center center',
            'opacity': String(this.config.opacity || 0.1),
            'transition': '0.3s',
            ...this.config.style
        };
    }
    /**
     * Create editor-specific configuration for themes
     */
    static createThemeConfig(themeName, images, customOptions) {
        const baseConfig = {
            images,
            useFront: true,
            opacity: 0.1,
            size: 'cover',
            position: 'center center',
            interval: 0,
            random: false
        };
        // Theme-specific configurations
        switch (themeName) {
            case 'zen-sunset':
                return {
                    ...baseConfig,
                    opacity: 0.15,
                    size: 'cover',
                    style: {
                        'filter': 'brightness(0.8) contrast(1.1)',
                        'background-blend-mode': 'multiply'
                    },
                    ...customOptions
                };
            case 'zen-ocean':
                return {
                    ...baseConfig,
                    opacity: 0.12,
                    style: {
                        'filter': 'hue-rotate(10deg) saturate(1.1)',
                        'background-blend-mode': 'soft-light'
                    },
                    ...customOptions
                };
            case 'zen-forest':
                return {
                    ...baseConfig,
                    opacity: 0.1,
                    style: {
                        'filter': 'sepia(0.1) saturate(1.2)',
                        'background-blend-mode': 'overlay'
                    },
                    ...customOptions
                };
            case 'zen-space':
                return {
                    ...baseConfig,
                    opacity: 0.08,
                    style: {
                        'filter': 'brightness(0.9) contrast(1.2)',
                        'background-blend-mode': 'darken'
                    },
                    ...customOptions
                };
            case 'zen-minimal':
                return {
                    ...baseConfig,
                    opacity: 0.05,
                    style: {
                        'filter': 'grayscale(0.3) brightness(1.1)',
                        'background-blend-mode': 'luminosity'
                    },
                    ...customOptions
                };
            default:
                return {
                    ...baseConfig,
                    ...customOptions
                };
        }
    }
}
exports.EditorPatchGenerator = EditorPatchGenerator;
//# sourceMappingURL=EditorPatchGenerator.js.map