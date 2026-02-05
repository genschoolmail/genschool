import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Bell, ArrowLeft } from 'lucide-react';
import { getAnnouncements } from '@/lib/actions/announcement-actions';
import Link from 'next/link';
import NoticeListClient from '@/components/ui/NoticeListClient';

export default async function TeacherNoticesPage() {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    // Fetch school specific notices
    const notices = await getAnnouncements({
        targetRole: 'TEACHER',
        isPublic: false
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4">
                <Link
                    href="/teacher"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                >
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">Notice Board</h1>
                    <p className="text-xs text-slate-500 font-medium">Official announcements and academic circulars</p>
                </div>
            </div>

            {notices.length > 0 ? (
                <NoticeListClient notices={notices} />
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 text-center space-y-4">
                    <div className="w-16 h-16 mx-auto bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center border border-slate-100 dark:border-slate-800">
                        <Bell className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">No Notices</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto text-sm">
                            No active notices found. When new announcements arrive, they will appear here.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
