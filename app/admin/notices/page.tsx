import { getAnnouncements, deleteAnnouncement } from '@/lib/actions/announcement-actions';
import {
    Plus,
    Trash2,
    Calendar,
    User,
    Globe,
    Users,
    FileText,
    Image as ImageIcon,
    Target
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export default async function NoticesPage() {
    const announcements = await getAnnouncements();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notice Board</h1>
                    <p className="text-slate-500 mt-1">Manage portal-specific and public homepage notices.</p>
                </div>
                <Link
                    href="/admin/notices/create"
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 font-bold"
                >
                    <Plus className="w-5 h-5" />
                    <span>Create New Notice</span>
                </Link>
            </div>

            <div className="grid gap-6">
                {announcements.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No notices published yet.</p>
                        <Link href="/admin/notices/create" className="text-indigo-600 hover:text-indigo-700 font-bold mt-2 inline-block">Post your first notice now</Link>
                    </div>
                ) : (
                    announcements.map((notice: any) => (
                        <div key={notice.id} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row justify-between items-start gap-4 hover:border-indigo-200 transition-all">
                            <div className="space-y-4 flex-1">
                                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-slate-500">
                                    <span className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {format(new Date(notice.date), 'PPP')}
                                    </span>
                                    {notice.isPublic ? (
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg">
                                            <Globe className="w-3.5 h-3.5" />
                                            PUBLIC HOMEPAGE
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg">
                                            <Users className="w-3.5 h-3.5" />
                                            PORTAL: {notice.targetRole}
                                        </span>
                                    )}
                                    {notice.classId && (
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg">
                                            <Target className="w-3.5 h-3.5" />
                                            CLASS SPECIFIC
                                        </span>
                                    )}
                                    {notice.attachmentUrl && (
                                        <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg">
                                            {notice.attachmentType === 'IMAGE' ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                                            ATTACHED {notice.attachmentType}
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                        {notice.title}
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                        {notice.content}
                                    </p>
                                </div>

                                {notice.attachmentUrl && notice.attachmentType === 'IMAGE' && (
                                    <div className="mt-4">
                                        <img src={notice.attachmentUrl} alt="Notice Attachment" className="max-h-64 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700" />
                                    </div>
                                )}

                                {notice.attachmentUrl && notice.attachmentType === 'PDF' && (
                                    <a
                                        href={notice.attachmentUrl}
                                        target="_blank"
                                        download
                                        className="mt-4 inline-flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-red-400 transition-all group"
                                    >
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-sm font-bold group-hover:text-red-600">Download Notice Document</p>
                                            <p className="text-xs text-slate-500">Click to view/download PDF</p>
                                        </div>
                                    </a>
                                )}
                            </div>

                            <form
                                action={async () => {
                                    'use server';
                                    await deleteAnnouncement(notice.id);
                                }}
                            >
                                <button
                                    type="submit"
                                    className="p-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all hover:scale-110"
                                    title="Delete Notice"
                                >
                                    <Trash2 className="w-6 h-6" />
                                </button>
                            </form>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
