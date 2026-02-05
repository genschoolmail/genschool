import React from 'react';
import { prisma } from '@/lib/prisma';
import { Calendar } from 'lucide-react';
import { PrintButton, ReportFilters } from './ReportComponents';

export default async function AttendanceReportsPage({
    searchParams
}: {
    searchParams: { classId?: string; reportType?: string }
}) {
    const classes = await prisma.class.findMany();
    const selectedClassId = searchParams.classId;
    const reportType = searchParams.reportType || 'weekly';

    let attendanceData: any[] = [];
    let students: any[] = [];

    if (selectedClassId) {
        // Get students in the class
        students = await prisma.student.findMany({
            where: { classId: selectedClassId },
            include: { user: true }
        });

        // Calculate date range based on report type
        const now = new Date();
        let startDate = new Date();

        if (reportType === 'weekly') {
            startDate.setDate(now.getDate() - 7);
        } else if (reportType === 'monthly') {
            startDate.setMonth(now.getMonth() - 1);
        } else if (reportType === 'yearly') {
            startDate.setFullYear(now.getFullYear() - 1);
        }

        // Fetch attendance records
        attendanceData = await prisma.attendance.findMany({
            where: {
                student: { classId: selectedClassId },
                date: { gte: startDate }
            },
            include: {
                student: {
                    include: { user: true }
                }
            },
            orderBy: { date: 'desc' }
        });
    }

    // Calculate statistics per student
    const studentStats = students.map(student => {
        const studentAttendance = attendanceData.filter(a => a.studentId === student.id);
        const present = studentAttendance.filter(a => a.status === 'PRESENT').length;
        const absent = studentAttendance.filter(a => a.status === 'ABSENT').length;
        const late = studentAttendance.filter(a => a.status === 'LATE').length;
        const total = studentAttendance.length;
        const percentage = total > 0 ? (present / total) * 100 : 0;

        return {
            student,
            present,
            absent,
            late,
            total,
            percentage
        };
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Attendance Reports</h2>
                {selectedClassId && <PrintButton />}
            </div>

            {/* Filters */}
            <ReportFilters classes={classes} />

            {/* Report Display */}
            {selectedClassId ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Attendance Report
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                            Class: {classes.find(c => c.id === selectedClassId)?.name}-{classes.find(c => c.id === selectedClassId)?.section}
                        </p>
                    </div>

                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Student Name</th>
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Roll No</th>
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Present</th>
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Absent</th>
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Late</th>
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Total Days</th>
                                <th className="p-4 font-semibold text-slate-700 dark:text-slate-300 text-center">Percentage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {studentStats.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-500">
                                        No attendance records found for the selected period.
                                    </td>
                                </tr>
                            ) : (
                                studentStats.map(({ student, present, absent, late, total, percentage }) => (
                                    <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4">
                                            <p className="font-medium text-slate-800 dark:text-white">{student.user.name}</p>
                                            <p className="text-xs text-slate-500">{student.admissionNo}</p>
                                        </td>
                                        <td className="p-4 text-center text-slate-700 dark:text-slate-300">{student.rollNo || '-'}</td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                                {present}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                                                {absent}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                                                {late}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center text-slate-700 dark:text-slate-300 font-semibold">{total}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${percentage >= 75
                                                ? 'bg-green-100 text-green-700'
                                                : percentage >= 60
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                {percentage.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Summary */}
                    {studentStats.length > 0 && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/20 border-t border-slate-200 dark:border-slate-700">
                            <div className="grid grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-sm text-slate-500">Total Students</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{studentStats.length}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Avg. Attendance</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {(studentStats.reduce((sum, s) => sum + s.percentage, 0) / studentStats.length).toFixed(1)}%
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Above 75%</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {studentStats.filter(s => s.percentage >= 75).length}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Below 60%</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {studentStats.filter(s => s.percentage < 60).length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Select a class to view attendance reports</p>
                </div>
            )}
        </div>
    );
}
