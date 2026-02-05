import React from 'react';
import { getStudentRankings } from '@/lib/academic-report-actions';
import { prisma } from '@/lib/prisma';
import { TrendingUp, Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function RankingsPage({ searchParams }: { searchParams: { examId?: string; classId?: string } }) {
    const exams = await prisma.examGroup.findMany({
        orderBy: { examStartDate: 'desc' },
        take: 20,
    });

    const classes = await prisma.class.findMany({
        orderBy: [{ name: 'asc' }, { section: 'asc' }],
    });

    const selectedExam = searchParams.examId || exams[0]?.id;
    const selectedClass = searchParams.classId;

    const rankings = selectedExam ? await getStudentRankings(selectedExam, selectedClass) : [];

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
                        <TrendingUp className="w-8 h-8 text-purple-600" />
                        Student Rankings
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        View student ranks and percentiles
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <form method="GET" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Exam</label>
                        <select
                            name="examId"
                            defaultValue={selectedExam}
                            onChange={(e) => {
                                const form = e.currentTarget.form;
                                if (form) form.submit();
                            }}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {exams.map(e => (
                                <option key={e.id} value={e.id}>{e.name} - {e.examStartDate ? new Date(e.examStartDate).toLocaleDateString() : 'N/A'}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filter by Class (Optional)</label>
                        <select
                            name="classId"
                            defaultValue={selectedClass || ''}
                            onChange={(e) => {
                                const form = e.currentTarget.form;
                                if (form) form.submit();
                            }}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>

            {/* Rankings Table */}
            {rankings.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Student Rankings ({rankings.length} students)</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Rank</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Adm. No</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Student Name</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Class</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Total Marks</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Average</th>
                                    <th className="p-4 text-left font-semibold text-slate-700 dark:text-slate-300">Percentage</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {rankings.map((student) => {
                                    const getRankIcon = (rank: number) => {
                                        if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
                                        if (rank === 2) return <Medal className="w-5 h-5 text-slate-400" />;
                                        if (rank === 3) return <Award className="w-5 h-5 text-orange-600" />;
                                        return null;
                                    };

                                    return (
                                        <tr key={student.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    {getRankIcon(student.rank)}
                                                    <span className={`font-bold ${student.rank <= 3 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>
                                                        #{student.rank}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 font-mono text-sm text-slate-600 dark:text-slate-400">{student.admissionNo}</td>
                                            <td className="p-4 font-medium text-slate-800 dark:text-white">{student.studentName}</td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">{student.className}</td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded font-semibold">
                                                    {student.totalMarks}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded font-semibold">
                                                    {student.averageMarks.toFixed(2)}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className="px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded font-semibold">
                                                    {student.percentage.toFixed(2)}%
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
                    No ranking data available for this exam.
                </div>
            )}
        </div>
    );
}
