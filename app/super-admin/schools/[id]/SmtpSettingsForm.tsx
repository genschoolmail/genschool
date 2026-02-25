'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { getSchoolSmtpConfig, saveSchoolSmtpConfig } from '@/lib/actions/school-settings';

export default function SmtpSettingsForm({ schoolId }: { schoolId: string }) {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [config, setConfig] = useState<any>(null);

    useEffect(() => {
        loadConfig();
    }, [schoolId]);

    const loadConfig = async () => {
        try {
            const res = await getSchoolSmtpConfig(schoolId);
            if (res.success && res.data) {
                setConfig(res.data);
            }
        } catch (error) {
            console.error('Failed to load SMTP config', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData(e.currentTarget);
            formData.append('schoolId', schoolId);

            const res = await saveSchoolSmtpConfig(formData);

            if (res.success) {
                toast.success('SMTP settings saved successfully!');
                loadConfig(); // Reload to show masked password
            } else {
                toast.error(res.error || 'Failed to save SMTP settings');
            }
        } catch (error: any) {
            toast.error(error.message || 'An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse mt-6">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mt-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <Mail className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Custom Notification Email (SMTP)</h3>
                    <p className="text-sm text-slate-500">
                        Configure this school's specific email sender (e.g. for OTPs).<br />
                        Leave blank to use your Global Super Admin SMTP.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SMTP Host</label>
                        <input
                            name="SMTP_HOST"
                            type="text"
                            placeholder="smtp.gmail.com"
                            defaultValue={config?.SMTP_HOST || ''}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SMTP Port</label>
                        <input
                            name="SMTP_PORT"
                            type="number"
                            placeholder="465 or 587"
                            defaultValue={config?.SMTP_PORT || ''}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SMTP User (Email)</label>
                        <input
                            name="SMTP_USER"
                            type="email"
                            placeholder="school@gmail.com"
                            defaultValue={config?.SMTP_USER || ''}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">SMTP Password (App Password)</label>
                        <div className="relative">
                            <input
                                name="SMTP_PASS"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter App Password"
                                defaultValue={config?.SMTP_PASS === '********' ? '' : (config?.SMTP_PASS || '')}
                                className="w-full pl-4 pr-10 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            {config?.SMTP_PASS === '********' && (
                                <p className="text-xs text-green-600 mt-1">✔ Password is securely saved</p>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From Name & Email (Format: "Name" &lt;email@domain.com&gt;)</label>
                    <input
                        name="SMTP_FROM"
                        type="text"
                        placeholder='"My School" <school@gmail.com>'
                        defaultValue={config?.SMTP_FROM || ''}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <p className="text-xs text-slate-500 mt-1">Leave all fields entirely blank if you want to fall back to the global platform SMTP.</p>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {config ? 'Update Settings' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </form>
    );
}
