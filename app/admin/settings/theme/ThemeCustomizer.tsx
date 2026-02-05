'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Check, Loader2, Eye, Paintbrush, Type, Layout, Moon } from 'lucide-react';

const PRESET_THEMES = [
    {
        name: 'Default',
        primaryColor: '#6366f1',
        secondaryColor: '#8b5cf6',
        accentColor: '#ec4899',
        description: 'Modern indigo and purple theme'
    },
    {
        name: 'Professional',
        primaryColor: '#1e40af',
        secondaryColor: '#64748b',
        accentColor: '#3b82f6',
        description: 'Clean navy and gray'
    },
    {
        name: 'Vibrant',
        primaryColor: '#2563eb',
        secondaryColor: '#f97316',
        accentColor: '#06b6d4',
        description: 'Energetic blue and orange'
    },
    {
        name: 'Nature',
        primaryColor: '#16a34a',
        secondaryColor: '#854d0e',
        accentColor: '#65a30d',
        description: 'Fresh green and brown'
    },
];

interface Theme {
    id: string;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    isActive: boolean;
}

export default function ThemeCustomizer({ themes, activeTheme }: { themes: Theme[]; activeTheme: Theme | null }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [previewColors, setPreviewColors] = useState({
        primaryColor: activeTheme?.primaryColor || '#6366f1',
        secondaryColor: activeTheme?.secondaryColor || '#8b5cf6',
        accentColor: activeTheme?.accentColor || '#ec4899',
    });

    const handleActivateTheme = async (themeId: string) => {
        setLoading(true);
        try {
            const response = await fetch('/api/settings/theme/activate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: themeId }),
            });

            if (!response.ok) throw new Error('Failed to activate theme');

            router.refresh();
        } catch (error) {
            alert('Failed to activate theme');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTheme = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData(e.currentTarget);
            const response = await fetch('/api/settings/theme/create', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Failed to create theme');

            router.refresh();
        } catch (error) {
            alert('Failed to create theme');
        } finally {
            setLoading(false);
        }
    };

    const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
        setPreviewColors({
            primaryColor: preset.primaryColor,
            secondaryColor: preset.secondaryColor,
            accentColor: preset.accentColor,
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        Theme Customization
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        Customize your app's appearance and color scheme
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Theme Selection */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Preset Themes */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Palette className="w-6 h-6 text-purple-500" />
                                Preset Themes
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {PRESET_THEMES.map((preset) => (
                                    <button
                                        key={preset.name}
                                        onClick={() => applyPreset(preset)}
                                        className="group relative bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border-2 border-transparent hover:border-purple-500 transition text-left"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="flex gap-1">
                                                <div className="w-6 h-6 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: preset.primaryColor }} />
                                                <div className="w-6 h-6 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: preset.secondaryColor }} />
                                                <div className="w-6 h-6 rounded-full border-2 border-white shadow-md" style={{ backgroundColor: preset.accentColor }} />
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{preset.name}</h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{preset.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Active Themes */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                                Saved Themes
                            </h2>
                            <div className="space-y-3">
                                {themes.map((theme) => (
                                    <div
                                        key={theme.id}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 ${theme.isActive
                                                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                                : 'border-slate-200 dark:border-slate-700'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1">
                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: theme.primaryColor }} />
                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: theme.secondaryColor }} />
                                                <div className="w-8 h-8 rounded-full border-2 border-white shadow" style={{ backgroundColor: theme.accentColor }} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-900 dark:text-white">{theme.name}</h3>
                                                {theme.isActive && (
                                                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Active Theme</span>
                                                )}
                                            </div>
                                        </div>
                                        {!theme.isActive && (
                                            <button
                                                onClick={() => handleActivateTheme(theme.id)}
                                                disabled={loading}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition text-sm flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                Activate
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Preview & Create */}
                    <div className="space-y-6">
                        {/* Live Preview */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Eye className="w-6 h-6 text-indigo-500" />
                                Preview
                            </h2>
                            <div className="space-y-3">
                                <div className="p-4 rounded-xl" style={{ backgroundColor: previewColors.primaryColor }}>
                                    <p className="text-white font-semibold">Primary Color</p>
                                </div>
                                <div className="p-4 rounded-xl" style={{ backgroundColor: previewColors.secondaryColor }}>
                                    <p className="text-white font-semibold">Secondary Color</p>
                                </div>
                                <div className="p-4 rounded-xl" style={{ backgroundColor: previewColors.accentColor }}>
                                    <p className="text-white font-semibold">Accent Color</p>
                                </div>
                            </div>
                        </div>

                        {/* Create Theme */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Paintbrush className="w-6 h-6 text-pink-500" />
                                Create Theme
                            </h2>
                            <form onSubmit={handleCreateTheme} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Theme Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                        placeholder="My Custom Theme"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Primary Color
                                    </label>
                                    <input
                                        type="color"
                                        name="primaryColor"
                                        value={previewColors.primaryColor}
                                        onChange={(e) => setPreviewColors({ ...previewColors, primaryColor: e.target.value })}
                                        className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Secondary Color
                                    </label>
                                    <input
                                        type="color"
                                        name="secondaryColor"
                                        value={previewColors.secondaryColor}
                                        onChange={(e) => setPreviewColors({ ...previewColors, secondaryColor: e.target.value })}
                                        className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                        Accent Color
                                    </label>
                                    <input
                                        type="color"
                                        name="accentColor"
                                        value={previewColors.accentColor}
                                        onChange={(e) => setPreviewColors({ ...previewColors, accentColor: e.target.value })}
                                        className="w-full h-12 rounded-lg border border-slate-300 dark:border-slate-600 cursor-pointer"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                    Save Theme
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
