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
        [key: string]: string | {
            foreground?: string;
            background?: string;
            fontStyle?: string;
        };
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
export declare const BUILTIN_THEMES: ThemeDefinition[];
//# sourceMappingURL=themeDefinitions.d.ts.map