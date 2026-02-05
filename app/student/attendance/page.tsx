import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Calendar, CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export default async function StudentAttendancePage() {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            attendances: {
                orderBy: { date: 'desc' },
                take: 60 // Last 60 days
            }
        }
    });

    if (!student) {
        return <div className="p-8 text-center">Student profile not found</div>;
    }

    // Calculate stats
    const totalDays = student.attendances.length;
    const presentDays = student.attendances.filter(a => a.status === 'PRESENT').length;
    const absentDays = student.attendances.filter(a => a.status === 'ABSENT').length;
    const lateDays = student.attendances.filter(a => a.status === 'LATE').length;
    const attendancePercentage = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0;

    // Group by month
    const attendanceByMonth = student.attendances.reduce((acc: any, att) => {
        const month = new Date(att.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!acc[month]) {
            acc[month] = [];
        }
        acc[month].push(att);
        return acc;
    }, {});

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">My Attendance</h1>
                <p className="text-sm md:text-base text-green-100">Track your daily presence</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-blue-600">{attendancePercentage}%</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Attendance Rate</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-green-200 dark:border-green-700">
                    <div className="flex items-center justify-between mb-2">
                        <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Present</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-green-600">{presentDays}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Days Present</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-red-200 dark:border-red-700">
                    <div className="flex items-center justify-between mb-2">
                        <XCircle className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
                        <span className="text-xs font-medium text-red-600">Absent</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-red-600">{absentDays}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Days Absent</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center justify-between mb-2">
                        <Clock className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-600">Late</span>
                    </div>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-600">{lateDays}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Times Late</p>
                </div>
            </div>

            {/* Attendance Progress Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Attendance Breakdown</h3>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-green-600 font-medium">Present ({presentDays})</span>
                            <span className="text-slate-600 dark:text-slate-400">{totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(presentDays / totalDays) * 100}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-red-600 font-medium">Absent ({absentDays})</span>
                            <span className="text-slate-600 dark:text-slate-400">{totalDays > 0 ? ((absentDays / totalDays) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(absentDays / totalDays) * 100}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-yellow-600 font-medium">Late ({lateDays})</span>
                            <span className="text-slate-600 dark:text-slate-400">{totalDays > 0 ? ((lateDays / totalDays) * 100).toFixed(1) : 0}%</span>
                        </div>
                        <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-500 rounded-full transition-all" style={{ width: `${(lateDays / totalDays) * 100}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Monthly Attendance Records */}
            <div className="space-y-4">
                {Object.entries(attendanceByMonth).map(([month, records]: [string, any]) => (
                    <div key={month} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                {month}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{records.length} records</p>
                        </div>
                        <div className="p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {records.map((att: any) => (
                                    <div
                                        key={att.id}
                                        className={`p-3 rounded-lg border-l-4 ${att.status === 'PRESENT'
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                                : att.status === 'ABSENT'
                                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                                                    : 'bg-yellow-50 dark:bg-yellow=900/20 border-yellow-500'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {new Date(att.date).toLocaleDateString('en-US', {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${att.status === 'PRESENT'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                                                    : att.status === 'ABSENT'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                                                }`}>
                                                {att.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {totalDays === 0 && (
                <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Attendance Records</h3>
                    <p className="text-slate-500 dark:text-slate-400">Your attendance will appear here once marked</p>
                </div>
            )}
        </div>
    );
}
