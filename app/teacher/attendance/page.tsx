import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTeacherClasses } from '@/lib/attendance-actions';
import AttendanceSheet from './AttendanceSheet';

export default async function AttendancePage() {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    const classes = await getTeacherClasses(session.user.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-slate-100 dark:border-slate-700">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1 md:mb-2">
                        Mark Attendance
                    </h1>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                        Record daily attendance for your classes
                    </p>
                </div>

                <AttendanceSheet classes={classes} />
            </div>
        </div>
    );
}
