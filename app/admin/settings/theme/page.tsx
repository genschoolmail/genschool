import React from 'react';
import { getAvailableThemes, getThemeSettings } from '@/lib/actions';
import ThemeCustomizer from './ThemeCustomizer';

export default async function ThemePage() {
    const [themes, activeTheme] = await Promise.all([
        getAvailableThemes(),
        getThemeSettings(),
    ]);

    return <ThemeCustomizer themes={themes} activeTheme={activeTheme} />;
}
