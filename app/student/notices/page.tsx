import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Bell } from 'lucide-react';
import { getAnnouncements } from '@/lib/actions/announcement-actions';
import NoticeListClient from '@/components/ui/NoticeListClient';

export default async function StudentNoticesPage() {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            class: true,
            school: true
        }
    });

    if (!student) {
        return <div className="p-8 text-center">Student profile not found</div>;
    }

    // Fetch school/class specific notices
    const notices = await getAnnouncements({
        targetRole: 'STUDENT',
        classId: student.classId || undefined,
        recipientId: student.id,
        isPublic: false
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notices & Announcements</h1>
                <p className="text-slate-500">Important updates and circulars</p>
            </div>

            {notices.length > 0 ? (
                <NoticeListClient notices={notices} />
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <Bell className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Notices Yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        New announcements and notices will appear here
                    </p>
                </div>
            )}
        </div>
    );
}
