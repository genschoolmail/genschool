import React from 'react';
import { getSubjectPerformance } from '@/lib/academic-report-actions';
import { prisma } from '@/lib/prisma';
import { BarChart3, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function SubjectAnalysisPage({ searchParams }: { searchParams: { examId?: string } }) {
    const exams = await prisma.examGroup.findMany({
        orderBy: { examStartDate: 'desc' },
        take: 20,
    });

    const selectedExam = searchParams.examId;
    const subjects = await getSubjectPerformance(selectedExam);

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
                        <BarChart3 className="w-8 h-8 text-green-600" />
                        Subject-wise Analysis
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Analyze performance across subjects
                    </p>
                </div>
            </div>

            {/* Exam Selection */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <form method="GET" className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filter by Exam (Optional)</label>
                        <select
                            name="examId"
                            defaultValue={selectedExam || ''}
                            onChange={(e) => {
                                const form = e.currentTarget.form;
                                if (form) form.submit();
                            }}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">All Exams</option>
                            {exams.map(e => (
                                <option key={e.id} value={e.id}>{e.name} - {e.examStartDate ? new Date(e.examStartDate).toLocaleDateString() : 'N/A'}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>

            {/* Subject Stats */}
            {subjects.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Subject Statistics</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Subject</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Code</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Attempts</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Average</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Highest</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Lowest</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Pass Rate</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Difficulty</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {subjects.map((subject, index) => {
                                    const difficulty = subject.averageMarks >= 70 ? 'Easy' : subject.averageMarks >= 50 ? 'Medium' : 'Hard';
                                    const difficultyColor = difficulty === 'Easy' ? 'text-green-600 dark:text-green-400' :
                                        difficulty === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                                            'text-red-600 dark:text-red-400';

                                    return (
                                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-800 dark:text-white">{subject.subjectName}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm">{subject.subjectCode}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">{subject.totalAttempts}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-semibold">
                                                    {subject.averageMarks.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded font-semibold">
                                                    {subject.highest}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded font-semibold">
                                                    {subject.lowest}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden max-w-[100px]">
                                                        <div
                                                            className={`h-full ${subject.passRate >= 75 ? 'bg-green-500' : subject.passRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                            style={{ width: `${subject.passRate}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                                                        {subject.passRate.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`font-semibold ${difficultyColor}`}>
                                                    {difficulty}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center text-slate-500">
                    No subject data available.
                </div>
            )}
        </div>
    );
}
