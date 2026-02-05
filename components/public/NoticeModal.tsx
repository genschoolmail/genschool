'use client';

import { useState } from 'react';
import { X, Calendar, Paperclip, Download } from 'lucide-react';
import { format } from 'date-fns';

interface NoticeModalProps {
    notice: any;
    onClose: () => void;
}

export default function NoticeModal({ notice, onClose }: NoticeModalProps) {
    if (!notice) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <h2 className="text-2xl font-black mb-3">{notice.title}</h2>
                    <div className="flex items-center gap-2 text-sm font-bold text-blue-100">
                        <Calendar className="w-4 h-4" />
                        {notice.createdAt ? format(new Date(notice.createdAt), 'MMMM dd, yyyy') : 'Date not available'}
                    </div>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="prose prose-slate dark:prose-invert max-w-none">
                        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                            {notice.content}
                        </p>
                    </div>

                    {/* Attachments */}
                    {(notice.attachments || notice.attachmentUrl) && (
                        <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-2 mb-4">
                                <Paperclip className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                <h3 className="font-black text-slate-900 dark:text-white">Attachments</h3>
                            </div>
                            <div className="space-y-3">
                                {(() => {
                                    // Handle attachmentUrl field (Announcement model)
                                    if (notice.attachmentUrl) {
                                        return (
                                            <a
                                                href={notice.attachmentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                        <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                                                        {notice.attachmentType === 'IMAGE' ? 'View Image' : 'Download Attachment'}
                                                    </span>
                                                </div>
                                                <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            </a>
                                        );
                                    }

                                    // Handle attachments JSON field
                                    try {
                                        const attachmentList = typeof notice.attachments === 'string'
                                            ? JSON.parse(notice.attachments)
                                            : notice.attachments;

                                        if (Array.isArray(attachmentList) && attachmentList.length > 0) {
                                            return attachmentList.map((attachment: any, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={attachment.url || attachment}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 transition-all group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                            <Paperclip className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                        </div>
                                                        <span className="font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">
                                                            {attachment.name || `Attachment ${idx + 1}`}
                                                        </span>
                                                    </div>
                                                    <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                </a>
                                            ));
                                        }
                                        return <p className="text-sm text-slate-500 italic">No attachments</p>;
                                    } catch (e) {
                                        console.error('Attachment parse error:', e);
                                        return <p className="text-sm text-slate-500 italic">No attachments</p>;
                                    }
                                })()}
                            </div>
                        </div>
                    )}

                    {/* Additional Info */}
                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 dark:text-slate-400">
                                Type: <span className="font-bold text-slate-700 dark:text-slate-300">{notice.type || 'General'}</span>
                            </span>
                            {notice.priority && (
                                <span className={`px-3 py-1 rounded-full text-xs font-black ${notice.priority === 'HIGH' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                    notice.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {notice.priority}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black hover:scale-105 transition-transform"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
