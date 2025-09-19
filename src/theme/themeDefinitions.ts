export interface ThemeDefinition {
    id: string;
    name: string;
    description: string;
    backgrounds: {
        window: string;
        primarySidebar: string;
        editor: string;
        secondarySidebar: string;
        panel: string;
        welcomePage: string;
    };
    colorCustomizations: {
        [key: string]: string;
    };
    tokenColorCustomizations: {
        [key: string]: string | { foreground?: string; background?: string; fontStyle?: string };
    };
    defaultOpacity: {
        window: number;
        primarySidebar: number;
        editor: number;
        secondarySidebar: number;
        panel: number;
        welcomePage: number;
    };
}

// Define the 5 built-in themes
export const BUILTIN_THEMES: ThemeDefinition[] = [
    {
        id: 'zen-ocean',
        name: 'Zen Ocean',
        description: 'Calming ocean-inspired blue theme',
        backgrounds: {
            window: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/ocean/window.jpg',
            primarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/ocean/sidebar.jpg',
            editor: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/ocean/editor.jpg',
            secondarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/ocean/sidebar.jpg',
            panel: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/ocean/panel.jpg',
            welcomePage: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/ocean/welcome.jpg'
        },
        colorCustomizations: {
            'editor.background': '#001a2e',
            'sideBar.background': '#002a4a',
            'activityBar.background': '#003d6b',
            'panel.background': '#001a2e',
            'welcomePage.background': '#001a2e',
            'statusBar.background': '#0066cc',
            'titleBar.activeBackground': '#004080'
        },
        tokenColorCustomizations: {
            'comments': '#87ceeb',
            'strings': '#40e0d0',
            'keywords': '#00bfff',
            'functions': '#87cefa',
            'variables': '#b0e0e6'
        },
        defaultOpacity: {
            window: 0.4,
            primarySidebar: 0.3,
            editor: 0.1,
            secondarySidebar: 0.3,
            panel: 0.3,
            welcomePage: 0.4
        }
    },
    {
        id: 'zen-forest',
        name: 'Zen Forest',
        description: 'Natural forest-inspired green theme',
        backgrounds: {
            window: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/forest/window.jpg',
            primarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/forest/sidebar.jpg',
            editor: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/forest/editor.jpg',
            secondarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/forest/sidebar.jpg',
            panel: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/forest/panel.jpg',
            welcomePage: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/forest/welcome.jpg'
        },
        colorCustomizations: {
            'editor.background': '#0d2818',
            'sideBar.background': '#1a4a2e',
            'activityBar.background': '#2d6b3d',
            'panel.background': '#0d2818',
            'welcomePage.background': '#0d2818',
            'statusBar.background': '#228b22',
            'titleBar.activeBackground': '#2e8b57'
        },
        tokenColorCustomizations: {
            'comments': '#90ee90',
            'strings': '#98fb98',
            'keywords': '#00ff7f',
            'functions': '#32cd32',
            'variables': '#adff2f'
        },
        defaultOpacity: {
            window: 0.4,
            primarySidebar: 0.3,
            editor: 0.1,
            secondarySidebar: 0.3,
            panel: 0.3,
            welcomePage: 0.4
        }
    },
    {
        id: 'zen-sunset',
        name: 'Zen Sunset',
        description: 'Warm sunset-inspired orange and pink theme',
        backgrounds: {
            window: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/sunset/window.jpg',
            primarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/sunset/sidebar.jpg',
            editor: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/sunset/editor.jpg',
            secondarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/sunset/sidebar.jpg',
            panel: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/sunset/panel.jpg',
            welcomePage: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/sunset/welcome.jpg'
        },
        colorCustomizations: {
            'editor.background': '#2a1810',
            'sideBar.background': '#4a2a1a',
            'activityBar.background': '#6b3d2d',
            'panel.background': '#2a1810',
            'welcomePage.background': '#2a1810',
            'statusBar.background': '#ff6347',
            'titleBar.activeBackground': '#ff4500'
        },
        tokenColorCustomizations: {
            'comments': '#ffb07a',
            'strings': '#ffa07a',
            'keywords': '#ff7f50',
            'functions': '#ff8c00',
            'variables': '#ffd700'
        },
        defaultOpacity: {
            window: 0.4,
            primarySidebar: 0.3,
            editor: 0.1,
            secondarySidebar: 0.3,
            panel: 0.3,
            welcomePage: 0.4
        }
    },
    {
        id: 'zen-night',
        name: 'Zen Night',
        description: 'Deep night-inspired dark theme',
        backgrounds: {
            window: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/night/window.jpg',
            primarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/night/sidebar.jpg',
            editor: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/night/editor.jpg',
            secondarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/night/sidebar.jpg',
            panel: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/night/panel.jpg',
            welcomePage: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/night/welcome.jpg'
        },
        colorCustomizations: {
            'editor.background': '#0a0a0a',
            'sideBar.background': '#1a1a1a',
            'activityBar.background': '#2a2a2a',
            'panel.background': '#0a0a0a',
            'welcomePage.background': '#0a0a0a',
            'statusBar.background': '#333333',
            'titleBar.activeBackground': '#404040'
        },
        tokenColorCustomizations: {
            'comments': '#808080',
            'strings': '#c0c0c0',
            'keywords': '#ffffff',
            'functions': '#e0e0e0',
            'variables': '#d0d0d0'
        },
        defaultOpacity: {
            window: 0.5,
            primarySidebar: 0.4,
            editor: 0.2,
            secondarySidebar: 0.4,
            panel: 0.4,
            welcomePage: 0.5
        }
    },
    {
        id: 'zen-cosmic',
        name: 'Zen Cosmic',
        description: 'Mystical cosmic-inspired purple theme',
        backgrounds: {
            window: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/cosmic/window.jpg',
            primarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/cosmic/sidebar.jpg',
            editor: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/cosmic/editor.jpg',
            secondarySidebar: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/cosmic/sidebar.jpg',
            panel: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/cosmic/panel.jpg',
            welcomePage: 'https://raw.githubusercontent.com/your-username/happy-zencode-assets/main/themes/cosmic/welcome.jpg'
        },
        colorCustomizations: {
            'editor.background': '#1a0d2a',
            'sideBar.background': '#2a1a4a',
            'activityBar.background': '#3d2d6b',
            'panel.background': '#1a0d2a',
            'welcomePage.background': '#1a0d2a',
            'statusBar.background': '#8a2be2',
            'titleBar.activeBackground': '#9370db'
        },
        tokenColorCustomizations: {
            'comments': '#dda0dd',
            'strings': '#da70d6',
            'keywords': '#ba55d3',
            'functions': '#9370db',
            'variables': '#e6e6fa'
        },
        defaultOpacity: {
            window: 0.4,
            primarySidebar: 0.3,
            editor: 0.1,
            secondarySidebar: 0.3,
            panel: 0.3,
            welcomePage: 0.4
        }
    }
];