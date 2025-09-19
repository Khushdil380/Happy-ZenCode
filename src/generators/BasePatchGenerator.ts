/**
 * Base patch generator for creating JavaScript injection code
 * Based on vscode-background extension architecture
 */

import { Utils } from '../core/Utils';

/**
 * CSS template literal helper function
 * Enables syntax highlighting and IntelliSense for CSS-in-JS
 */
export function css(template: TemplateStringsArray, ...args: any[]): string {
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

export interface PatchGeneratorConfig {
    /** List of image URLs to use */
    images: string[];
    /** Custom CSS styles to apply */
    style?: Record<string, string>;
    /** Individual styles for each image */
    styles?: Array<Record<string, string>>;
    /** Background opacity (0-1) */
    opacity?: number;
    /** Background size */
    size?: string;
    /** Background position */
    position?: string;
    /** Use front (above content) or back (behind content) */
    useFront?: boolean;
}

/**
 * Abstract base class for patch generators
 */
export abstract class BasePatchGenerator<T extends PatchGeneratorConfig> {
    protected config: T;

    constructor(config: T) {
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
    protected normalizeImageUrls(images: string[]): string[] {
        return images.map(imageUrl => {
            return Utils.normalizeImageUrl(imageUrl);
        });
    }

    /**
     * Compile CSS using a simple CSS processor
     */
    protected compileCSS(source: string): string {
        // Simple CSS compilation - remove excess whitespace and comments
        return source
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Collapse whitespace
            .trim();
    }

    /**
     * Create image preload script
     */
    protected getPreload(): string {
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
     * Get the CSS styles for the background
     */
    protected abstract getStyle(): string;

    /**
     * Get additional JavaScript code to execute
     */
    protected getScript(): string {
        return '';
    }

    /**
     * Create the complete patch content
     */
    public create(): string {
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
        .map(component => Utils.wrapInIIFE(component));

        return components.join(';');
    }

    /**
     * Get default styles combined with custom styles
     */
    protected getDefaultStyles(): Record<string, string> {
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
    protected stylesToCSS(styles: Record<string, string>): string {
        return Object.entries(styles)
            .map(([key, value]) => `${key}: ${value};`)
            .join(' ');
    }

    /**
     * Get CSS variable name for background image
     */
    protected getImageVariable(index: number): string {
        return `--happy-zencode-bg-${index}`;
    }

    /**
     * Create CSS with dynamic image variables
     */
    protected createImageCSS(selector: string, styles: Record<string, string>, imageIndex: number): string {
        const imageVar = this.getImageVariable(imageIndex);
        const normalizedImages = this.normalizeImageUrls(this.config.images);
        const imageUrl = normalizedImages[imageIndex] || '';

        return css`
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
    protected getVersionInfo(): string {
        return `
        console.log('[Happy-Zencode] Background patch applied - v1.0.0');
        console.log('[Happy-Zencode] Images:', ${JSON.stringify(this.normalizeImageUrls(this.config.images))});
        `;
    }
}