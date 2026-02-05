import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AttendanceFilter from './AttendanceFilter';

export default async function AttendanceSheetPage({ searchParams }: { searchParams: { classId?: string, month?: string } }) {
    try {
        const session = await auth();
        if (!session?.user) redirect('/login');

        const userRole = session.user.role;
        const userId = session.user.id;

        // Fetch classes based on role
        let classes;
        if (userRole === 'TEACHER') {
            const teacher = await prisma.teacher.findUnique({ where: { userId } });
            if (!teacher) return <div>Teacher profile not found.</div>;

            classes = await prisma.class.findMany({
                where: { teacherId: teacher.id }
            });
        } else {
            classes = await prisma.class.findMany();
        }

        const selectedClassId = searchParams.classId || (classes.length > 0 ? classes[0].id : null);
        const selectedMonth = searchParams.month ? new Date(searchParams.month) : new Date();

        if (!selectedClassId) {
            return <div className="p-6">No classes found.</div>;
        }

        // Fetch students and attendance for the selected class and month
        const startOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const endOfMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

        const students = await prisma.student.findMany({
            where: { classId: selectedClassId },
            include: {
                user: true, attendances: {
                    where: {
                        date: {
                            gte: startOfMonth,
                            lte: endOfMonth
                        }
                    }
                }
            },
            orderBy: { rollNo: 'asc' }
        });

        const daysInMonth = endOfMonth.getDate();
        const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div className="space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Attendance Sheet</h2>
                    <AttendanceFilter
                        classes={classes}
                        selectedClassId={selectedClassId}
                        selectedMonth={selectedMonth}
                    />
                </div>

                {/* Mobile hint */}
                <div className="md:hidden bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3">
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Swipe left/right to view all days
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mobile-scroll">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-max">
                            <thead>
                                <tr>
                                    <th className="p-2 md:p-3 border-b border-r border-slate-200 dark:border-slate-700 min-w-[140px] md:min-w-[200px] sticky left-0 bg-white dark:bg-slate-800 z-10 text-xs md:text-sm font-semibold">Student</th>
                                    {daysArray.map(day => (
                                        <th key={day} className="p-1.5 md:p-2 border-b border-slate-200 dark:border-slate-700 text-center min-w-[32px] md:min-w-[40px] text-xs font-medium">
                                            {day}
                                        </th>
                                    ))}
                                    <th className="p-2 md:p-3 border-b border-l border-slate-200 dark:border-slate-700 text-center text-xs md:text-sm font-semibold min-w-[60px]">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => {
                                    const presentCount = student.attendances.filter(a => a.status === 'PRESENT').length;
                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="p-2 md:p-3 border-b border-r border-slate-200 dark:border-slate-700 sticky left-0 bg-white dark:bg-slate-800 font-medium text-xs md:text-sm">
                                                <div className="truncate max-w-[120px] md:max-w-none">{student.user.name}</div>
                                                <span className="block text-xs text-slate-500">{student.rollNo}</span>
                                            </td>
                                            {daysArray.map(day => {
                                                const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
                                                const attendance = student.attendances.find(a => new Date(a.date).getDate() === day);
                                                let statusColor = 'bg-slate-100 dark:bg-slate-700';
                                                let statusText = '-';

                                                if (attendance) {
                                                    if (attendance.status === 'PRESENT') {
                                                        statusColor = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
                                                        statusText = 'P';
                                                    } else if (attendance.status === 'ABSENT') {
                                                        statusColor = 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
                                                        statusText = 'A';
                                                    } else if (attendance.status === 'LATE') {
                                                        statusColor = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
                                                        statusText = 'L';
                                                    }
                                                }

                                                return (
                                                    <td key={day} className="p-0.5 md:p-1 border-b border-slate-200 dark:border-slate-700 text-center">
                                                        <div className={`w-5 h-5 md:w-6 md:h-6 mx-auto flex items-center justify-center rounded text-xs font-bold ${statusColor}`}>
                                                            {statusText}
                                                        </div>
                                                    </td>
                                                );
                                            })}
                                            <td className="p-2 md:p-3 border-b border-l border-slate-200 dark:border-slate-700 text-center font-bold text-emerald-600 dark:text-emerald-400 text-xs md:text-sm">
                                                {presentCount}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Attendance Sheet Error:', error);
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Attendance Sheet Error</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-4">Unable to load attendance data. Please check your database connection and try again.</p>
                    <a href="/admin/attendance/sheet" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                        Retry
                    </a>
                </div>
            </div>
        );
    }
}
