import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Bell, Calendar, FileText, Image as ImageIcon, ArrowLeft, AlertCircle } from 'lucide-react';
import { getAnnouncements } from '@/lib/actions/announcement-actions';
import { getActiveAnnouncements } from '@/lib/actions/global-notifications';
import { format } from 'date-fns';
import Link from 'next/link';

export default async function DriverNoticesPage() {
    const session = await auth();

    if (!session || session.user.role !== 'DRIVER') {
        redirect('/login');
    }

    // Fetch school/driver specific notices
    const notices = await getAnnouncements({
        targetRole: 'DRIVER',
        isPublic: false
    });

    return (
        <div className="p-4 max-w-md mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link
                    href="/driver"
                    className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 tracking-tight">Driver Notice Board</h1>
                    <p className="text-xs text-slate-500 font-medium">Important updates for transport staff</p>
                </div>
            </div>

            {notices.length > 0 ? (
                <div className="space-y-4">
                    {notices.map((notice: any) => {
                        const isGlobal = notice.isGlobal;
                        return (
                            <div
                                key={notice.id}
                                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${isGlobal
                                    ? notice.priority === 'CRITICAL' ? 'border-red-100 bg-red-50/30' : 'border-amber-100 bg-amber-50/30'
                                    : 'border-slate-200'
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl flex-shrink-0 shadow-sm ${isGlobal
                                            ? notice.priority === 'CRITICAL' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                                            : 'bg-indigo-600 text-white'
                                            }`}>
                                            <Bell className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col gap-1 mb-2">
                                                <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">
                                                    {notice.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(notice.date), 'PP')}
                                                </div>
                                            </div>

                                            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                                                {notice.content}
                                            </p>

                                            {/* Attachments */}
                                            {notice.attachmentUrl && (
                                                <div className="mt-4">
                                                    {notice.attachmentType === 'IMAGE' ? (
                                                        <div className="rounded-xl overflow-hidden border border-slate-100 shadow-md">
                                                            <img src={notice.attachmentUrl} alt="Attachment" className="max-h-52 w-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <a
                                                            href={notice.attachmentUrl}
                                                            target="_blank"
                                                            className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 transition-colors group"
                                                        >
                                                            <div className="p-1.5 bg-red-100 rounded-lg text-red-600 group-hover:scale-110 transition-transform">
                                                                <FileText className="w-4 h-4" />
                                                            </div>
                                                            <span className="font-bold text-xs text-slate-700">Open PDF Document</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            {isGlobal && (
                                                <div className={`mt-4 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-tight ${notice.priority === 'CRITICAL' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                                                    }`}>
                                                    <AlertCircle className="w-2.5 h-2.5" />
                                                    Urgent Notice
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                        <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-1">No Notices</h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Staff notices will appear here. Correct any pending trips.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
