import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookOpen, TrendingUp, Award } from 'lucide-react';

export default async function TeacherResultsPage() {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
            classes: true,
            subjects: true
        }
    });

    if (!teacher) {
        return <div>Teacher profile not found.</div>;
    }

    const classIds = teacher.classes.map(c => c.id);
    const subjectIds = teacher.subjects.map(s => s.id);

    // Get exam schedules for teacher's classes/subjects
    const examSchedules = await prisma.examSchedule.findMany({
        where: {
            OR: [
                { classId: { in: classIds } },
                { subjectId: { in: subjectIds } }
            ]
        },
        include: {
            examGroup: true,
            class: true,
            subject: true,
            examResults: true,
            _count: {
                select: { examResults: true }
            }
        },
        orderBy: { examDate: 'desc' },
        take: 20
    });

    // Calculate stats and serialize
    const examsWithStats = examSchedules.map(exam => {
        const marks = exam.examResults.map(r => r.marksObtained);
        const avgMarks = marks.length > 0
            ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2)
            : '0.00';
        const maxMarks = marks.length > 0 ? Math.max(...marks) : 0;
        const minMarks = marks.length > 0 ? Math.min(...marks) : 0;

        return {
            id: exam.id,
            examGroup: exam.examGroup.name,
            className: `${exam.class.name}-${exam.class.section}`,
            subject: exam.subject.name,
            examDate: exam.examDate.toISOString().split('T')[0],
            maxMarks: exam.maxMarks,
            passingMarks: exam.passingMarks,
            stats: {
                totalResults: exam._count.examResults,
                avgMarks,
                maxMarks,
                minMarks
            }
        };
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-slate-100 dark:border-slate-700">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1 md:mb-2">
                        Exam Results
                    </h1>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                        View exam results and statistics for your classes
                    </p>
                </div>

                {examsWithStats.length > 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b-2 border-indigo-200 dark:border-indigo-800">
                                        <th className="p-3 md:p-4 font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Exam</th>
                                        <th className="p-3 md:p-4 font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Class</th>
                                        <th className="p-3 md:p-4 font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Subject</th>
                                        <th className="p-3 md:p-4 font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm hidden sm:table-cell">Date</th>
                                        <th className="p-3 md:p-4 font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm hidden md:table-cell">Max</th>
                                        <th className="p-3 md:p-4 font-bold text-slate-700 dark:text-slate-300 text-xs md:text-sm">Stats</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {examsWithStats.map((exam) => (
                                        <tr key={exam.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <td className="p-3 md:p-4 font-semibold text-slate-900 dark:text-white text-xs md:text-sm">
                                                {exam.examGroup}
                                            </td>
                                            <td className="p-3 md:p-4 text-slate-600 dark:text-slate-300 text-xs md:text-sm">
                                                {exam.className}
                                            </td>
                                            <td className="p-3 md:p-4 text-slate-600 dark:text-slate-300 text-xs md:text-sm">
                                                {exam.subject}
                                            </td>
                                            <td className="p-3 md:p-4 text-slate-600 dark:text-slate-300 text-xs md:text-sm hidden sm:table-cell">
                                                {exam.examDate}
                                            </td>
                                            <td className="p-3 md:p-4 text-slate-600 dark:text-slate-300 text-xs md:text-sm hidden md:table-cell">
                                                {exam.maxMarks}
                                            </td>
                                            <td className="p-3 md:p-4">
                                                <div className="text-xs md:text-sm space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-emerald-600 dark:text-emerald-400" />
                                                        <span className="text-slate-600 dark:text-slate-300">
                                                            Avg: <span className="font-bold text-slate-900 dark:text-white">{exam.stats.avgMarks}</span>
                                                        </span>
                                                    </div>
                                                    <div className="text-slate-500 dark:text-slate-400">
                                                        {exam.stats.totalResults} students
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 md:py-20 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full mb-4 md:mb-6">
                            <Award className="w-8 h-8 md:w-10 md:h-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">No Exam Results</h3>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto px-4">
                            No exam results are available for your classes yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
