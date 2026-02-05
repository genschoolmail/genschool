'use client';

import React, { useState } from 'react';
import { updateSystemSettings } from '@/lib/actions/super-admin';
import { toast } from 'sonner';
import { Loader2, Save, X, Eye, EyeOff } from 'lucide-react';

interface Setting {
    key: string;
    value: string;
    type: string;
    category: string;
    description: string | null;
}

interface SettingsFormProps {
    category: string;
    settings: Setting[];
    onClose: () => void;
}

export default function SettingsForm({ category, settings, onClose }: SettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

    const togglePassword = (key: string) => {
        setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            const result = await updateSystemSettings(formData);
            if (result.success) {
                toast.success(`${category} settings updated successfully`);
                onClose();
            } else {
                toast.error("Failed to update settings");
            }
        } catch (error: any) {
            toast.error(error.message || "An unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">{category} Configuration</h2>
                    <p className="text-sm text-slate-500">Platform-wide settings for {category}</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                    {settings.map((setting) => (
                        <div key={setting.key} className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {setting.key.replace(/_/g, ' ')}
                            </label>
                            {setting.description && (
                                <p className="text-xs text-slate-500 mb-1">{setting.description}</p>
                            )}

                            {setting.type === 'PASSWORD' ? (
                                <div className="relative">
                                    <input
                                        name={setting.key}
                                        type={showPasswords[setting.key] ? 'text' : 'password'}
                                        defaultValue={setting.value}
                                        className="w-full pl-4 pr-12 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => togglePassword(setting.key)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                    >
                                        {showPasswords[setting.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            ) : setting.type === 'NUMBER' ? (
                                <input
                                    name={setting.key}
                                    type="number"
                                    defaultValue={setting.value}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            ) : (
                                <input
                                    name={setting.key}
                                    type="text"
                                    defaultValue={setting.value}
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 px-8 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
