import React, { createContext, useContext, useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type ColorTheme = 'default' | 'emerald' | 'violet' | 'amber' | 'rose';

interface ThemeContextType {
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
    colorTheme: ColorTheme;
    setColorTheme: (theme: ColorTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<ThemeMode>(() => {
        const saved = localStorage.getItem('theme-mode');
        return (saved as ThemeMode) || 'system';
    });

    const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
        const saved = localStorage.getItem('color-theme');
        return (saved as ColorTheme) || 'default';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old mode classes
        root.classList.remove('light', 'dark');

        if (mode === 'system') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(mode);
        }

        localStorage.setItem('theme-mode', mode);
    }, [mode]);

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old color classes
        const colorClasses = ['theme-default', 'theme-emerald', 'theme-violet', 'theme-amber', 'theme-rose'];
        root.classList.remove(...colorClasses);

        root.classList.add(`theme-${colorTheme}`);
        localStorage.setItem('color-theme', colorTheme);
    }, [colorTheme]);

    return (
        <ThemeContext.Provider value={{ mode, setMode, colorTheme, setColorTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
