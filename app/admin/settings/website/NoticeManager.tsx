'use client';

import React, { useState } from 'react';
import { updateHomepageNotice, updateAdmissionSettings } from '@/lib/cms-actions';
import { Bell, Save, Loader2, Eye, EyeOff, AlertCircle, CheckCircle2, GraduationCap, Sparkles } from 'lucide-react';

interface NoticeManagerProps {
    initialNotice: string;
    initialEnabled: boolean;
    initialAdmissionEnabled?: boolean;
    initialAdmissionText?: string;
}

export default function NoticeManager({
    initialNotice,
    initialEnabled,
    initialAdmissionEnabled = false,
    initialAdmissionText = 'Admissions Open 2025-26'
}: NoticeManagerProps) {
    // Notice State
    const [notice, setNotice] = useState(initialNotice || '');
    const [enabled, setEnabled] = useState(initialEnabled);
    const [noticeLoading, setNoticeLoading] = useState(false);
    const [noticeSaved, setNoticeSaved] = useState(false);

    // Admission State
    const [admissionEnabled, setAdmissionEnabled] = useState(initialAdmissionEnabled);
    const [admissionText, setAdmissionText] = useState(initialAdmissionText);
    const [admissionLoading, setAdmissionLoading] = useState(false);
    const [admissionSaved, setAdmissionSaved] = useState(false);

    const handleSaveNotice = async () => {
        setNoticeLoading(true);
        setNoticeSaved(false);
        try {
            const result = await updateHomepageNotice({ notice, enabled });
            if (result.success) {
                setNoticeSaved(true);
                setTimeout(() => setNoticeSaved(false), 3000);
            } else {
                alert('Update failed: ' + (result as any).error);
            }
        } catch (error) {
            console.error('Error saving notice:', error);
            alert('Failed to save notice. Please try again.');
        } finally {
            setNoticeLoading(false);
        }
    };

    const handleSaveAdmission = async () => {
        setAdmissionLoading(true);
        setAdmissionSaved(false);
        try {
            const result = await updateAdmissionSettings({ enabled: admissionEnabled, text: admissionText });
            if (result.success) {
                setAdmissionSaved(true);
                setTimeout(() => setAdmissionSaved(false), 3000);
            } else {
                alert('Update failed: ' + (result as any).error);
            }
        } catch (error) {
            console.error('Error saving admission settings:', error);
            alert('Failed to save admission settings.');
        } finally {
            setAdmissionLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            {/* Homepage Notice Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-200 dark:shadow-none">
                            <Bell className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-slate-900 dark:text-white">Notice Board</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Global Announcements</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setEnabled(!enabled)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${enabled
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}
                    >
                        {enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {enabled ? 'LIVE' : 'HIDDEN'}
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="relative">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Banner Message</label>
                        <textarea
                            value={notice}
                            onChange={(e) => setNotice(e.target.value)}
                            rows={3}
                            placeholder="Type your notice here..."
                            className="w-full px-5 py-4 text-sm bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-violet-500 transition-all resize-none font-medium"
                        />
                        <div className="absolute top-10 right-4 opacity-10">
                            <Sparkles className="w-12 h-12 text-violet-600" />
                        </div>
                    </div>

                    {/* Modern Preview */}
                    {notice && enabled && (
                        <div className="relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                            <div className="bg-gradient-to-r from-violet-500 via-purple-500 to-violet-500 text-white px-5 py-4 rounded-2xl text-center font-bold shadow-lg shadow-purple-100 text-sm animate-pulse">
                                {notice}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleSaveNotice}
                        disabled={noticeLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-violet-600 text-white rounded-2xl font-black text-sm transition-all duration-300 shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {noticeLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : noticeSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {noticeLoading ? 'UPDATING...' : noticeSaved ? 'SAVED SUCCESSFULLY!' : 'UPDATE NOTICE BOARD'}
                    </button>
                </div>
            </div>

            {/* Admission Status Card */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-rose-200 dark:shadow-none">
                            <GraduationCap className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="font-black text-xl text-slate-900 dark:text-white">Admission Desk</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Enrolment Status</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setAdmissionEnabled(!admissionEnabled)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all ${admissionEnabled
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-slate-50 text-slate-400 border border-slate-100'
                            }`}
                    >
                        {admissionEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        {admissionEnabled ? 'OPEN' : 'CLOSED'}
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Admission Badge Text</label>
                        <input
                            type="text"
                            value={admissionText}
                            onChange={(e) => setAdmissionText(e.target.value)}
                            placeholder="e.g., Admission Open 2025-26"
                            className="w-full px-5 py-4 text-sm bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:outline-none focus:border-rose-500 transition-all font-bold"
                        />
                    </div>

                    <div className="p-5 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 text-center">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-3">Live Button Preview</span>
                        <div className={`inline-flex items-center px-6 py-2 rounded-full font-black text-xs uppercase tracking-tighter ${admissionEnabled ? 'bg-gradient-to-r from-violet-600 to-rose-500 text-white shadow-lg' : 'bg-slate-200 text-slate-500'}`}>
                            {admissionText || 'Admissions Closed'}
                        </div>
                    </div>

                    <button
                        onClick={handleSaveAdmission}
                        disabled={admissionLoading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl font-black text-sm transition-all duration-300 shadow-xl shadow-slate-200 disabled:opacity-50"
                    >
                        {admissionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : admissionSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                        {admissionLoading ? 'SAVING...' : admissionSaved ? 'SETTINGS SAVED!' : 'UPDATE ADMISSION STATUS'}
                    </button>
                </div>
            </div>
        </div>
    );
}
