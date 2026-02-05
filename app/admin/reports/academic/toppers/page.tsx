import React from 'react';
import { getToppers } from '@/lib/academic-report-actions';
import { prisma } from '@/lib/prisma';
import { Award, Trophy, Medal, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ToppersPage({ searchParams }: { searchParams: { examId?: string } }) {
    const exams = await prisma.examGroup.findMany({
        orderBy: { examStartDate: 'desc' },
        take: 20,
    });

    const selectedExam = searchParams.examId || exams[0]?.id;
    const toppers = selectedExam ? await getToppers(selectedExam) : [];

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/reports/academic"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Award className="w-8 h-8 text-orange-600" />
                        Top Performers
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Top 10 students by performance
                    </p>
                </div>
            </div>

            {/* Exam Selection */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <form method="GET" className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Exam</label>
                        <select
                            name="examId"
                            defaultValue={selectedExam}
                            onChange={(e) => {
                                const form = e.currentTarget.form;
                                if (form) form.submit();
                            }}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            {exams.map(e => (
                                <option key={e.id} value={e.id}>{e.name} - {e.examStartDate ? new Date(e.examStartDate).toLocaleDateString() : 'N/A'}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>

            {/* Toppers Cards */}
            {toppers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {toppers.map((student, index) => {
                        const getRankBadge = (rank: number) => {
                            if (rank === 1) return { icon: Trophy, bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-300 dark:border-yellow-700' };
                            if (rank === 2) return { icon: Medal, bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-300 dark:border-slate-600' };
                            if (rank === 3) return { icon: Award, bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' };
                            return { icon: Star, bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-700' };
                        };

                        const badge = getRankBadge(student.rank);
                        const Icon = badge.icon;

                        return (
                            <div key={student.studentId} className={`bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border-2 ${badge.border} transition-all hover:shadow-lg`}>
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 ${badge.bg} rounded-lg`}>
                                        <Icon className={`w-8 h-8 ${badge.text}`} />
                                    </div>
                                    <span className={`text-2xl font-bold ${badge.text}`}>#{student.rank}</span>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{student.studentName}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{student.className}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{student.admissionNo}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Marks</p>
                                        <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{student.totalMarks}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Percentage</p>
                                        <p className="text-lg font-bold text-green-600 dark:text-green-400">{student.percentage.toFixed(2)}%</p>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                                        <span>Average</span>
                                        <span>{student.averageMarks.toFixed(2)}/100</span>
                                    </div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                            style={{ width: `${student.averageMarks}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center text-slate-500">
                    No toppers data available for this exam.
                </div>
            )}
        </div>
    );
}
