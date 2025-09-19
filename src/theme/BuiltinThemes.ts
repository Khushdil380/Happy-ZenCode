/**
 * Built-in Themes Configuration for Happy Zencode
 * Uses images from the GitHub repository
 */

export interface ThemeConfig {
    name: string;
    description: string;
    images: {
        editor: string;
        window: string;
        primarySidebar: string;
        secondarySidebar: string;
        panel: string;
        welcome: string;
    };
    settings: {
        opacity: number;
        useFront: boolean;
        style: Record<string, string>;
    };
}

// GitHub repository base URL for images
const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/KatsuteDev/Background/main/Happy-Zencode/assets';

export const BUILTIN_THEMES: ThemeConfig[] = [
    {
        name: 'Cosmic Space',
        description: 'Dark space theme with cosmic elements',
        images: {
            editor: `${GITHUB_BASE_URL}/editor/1.png`,
            window: `${GITHUB_BASE_URL}/window/1.png`,
            primarySidebar: `${GITHUB_BASE_URL}/psidebar/1.png`,
            secondarySidebar: `${GITHUB_BASE_URL}/ssidebar/1.png`,
            panel: `${GITHUB_BASE_URL}/panel/1.png`,
            welcome: `${GITHUB_BASE_URL}/Welcome/1.png`
        },
        settings: {
            opacity: 0.15,
            useFront: true,
            style: {
                'background-size': 'cover',
                'background-position': 'center',
                'background-repeat': 'no-repeat'
            }
        }
    },
    {
        name: 'Ocean Depths',
        description: 'Calming blue ocean theme',
        images: {
            editor: `${GITHUB_BASE_URL}/editor/2.png`,
            window: `${GITHUB_BASE_URL}/window/2.png`,
            primarySidebar: `${GITHUB_BASE_URL}/psidebar/2.png`,
            secondarySidebar: `${GITHUB_BASE_URL}/ssidebar/2.png`,
            panel: `${GITHUB_BASE_URL}/panel/2.png`,
            welcome: `${GITHUB_BASE_URL}/Welcome/2.png`
        },
        settings: {
            opacity: 0.12,
            useFront: true,
            style: {
                'background-size': 'cover',
                'background-position': 'center',
                'background-repeat': 'no-repeat'
            }
        }
    },
    {
        name: 'Forest Zen',
        description: 'Peaceful green forest theme',
        images: {
            editor: `${GITHUB_BASE_URL}/editor/3.png`,
            window: `${GITHUB_BASE_URL}/window/3.png`,
            primarySidebar: `${GITHUB_BASE_URL}/psidebar/3.png`,
            secondarySidebar: `${GITHUB_BASE_URL}/ssidebar/3.png`,
            panel: `${GITHUB_BASE_URL}/panel/3.png`,
            welcome: `${GITHUB_BASE_URL}/Welcome/3.png`
        },
        settings: {
            opacity: 0.10,
            useFront: true,
            style: {
                'background-size': 'cover',
                'background-position': 'center',
                'background-repeat': 'no-repeat'
            }
        }
    },
    {
        name: 'Desert Sunset',
        description: 'Warm desert landscape theme',
        images: {
            editor: `${GITHUB_BASE_URL}/editor/4.png`,
            window: `${GITHUB_BASE_URL}/window/4.png`,
            primarySidebar: `${GITHUB_BASE_URL}/psidebar/4.png`,
            secondarySidebar: `${GITHUB_BASE_URL}/ssidebar/4.png`,
            panel: `${GITHUB_BASE_URL}/panel/4.png`,
            welcome: `${GITHUB_BASE_URL}/Welcome/4.png`
        },
        settings: {
            opacity: 0.14,
            useFront: true,
            style: {
                'background-size': 'cover',
                'background-position': 'center',
                'background-repeat': 'no-repeat'
            }
        }
    },
    {
        name: 'Abstract Art',
        description: 'Modern abstract patterns',
        images: {
            editor: `${GITHUB_BASE_URL}/editor/5.png`,
            window: `${GITHUB_BASE_URL}/window/5.png`,
            primarySidebar: `${GITHUB_BASE_URL}/psidebar/5.png`,
            secondarySidebar: `${GITHUB_BASE_URL}/ssidebar/5.png`,
            panel: `${GITHUB_BASE_URL}/panel/5.png`,
            welcome: `${GITHUB_BASE_URL}/Welcome/5.png`
        },
        settings: {
            opacity: 0.13,
            useFront: true,
            style: {
                'background-size': 'cover',
                'background-position': 'center',
                'background-repeat': 'no-repeat'
            }
        }
    }
];

/**
 * Get theme by index (1-5)
 */
export function getThemeByIndex(index: number): ThemeConfig | undefined {
    if (index < 1 || index > BUILTIN_THEMES.length) {
        return undefined;
    }
    return BUILTIN_THEMES[index - 1];
}

/**
 * Get theme by name
 */
export function getThemeByName(name: string): ThemeConfig | undefined {
    return BUILTIN_THEMES.find(theme => 
        theme.name.toLowerCase() === name.toLowerCase()
    );
}

/**
 * Get all theme names for quick picker
 */
export function getThemeNames(): string[] {
    return BUILTIN_THEMES.map(theme => theme.name);
}