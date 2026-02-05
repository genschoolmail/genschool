import React from 'react';
import { prisma } from '@/lib/prisma';
import { getExamReportsData } from '@/lib/actions/exams';
import { Filter, Trophy, TrendingUp, Users, AlertTriangle, BarChart3 } from 'lucide-react';

export default async function ExamReportsPage({
    searchParams
}: {
    searchParams: { groupId?: string; classId?: string }
}) {
    const examGroups = await prisma.examGroup.findMany({ orderBy: { order: 'asc' } });
    const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });

    const selectedGroupId = searchParams.groupId || examGroups[0]?.id;
    const selectedClassId = searchParams.classId || classes[0]?.id;

    let reportData = null;
    let error = '';

    if (selectedGroupId && selectedClassId) {
        try {
            reportData = await getExamReportsData(selectedGroupId, selectedClassId);
        } catch (e) {
            console.error(e);
            error = 'Failed to load report data. Ensure results are generated.';
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Analytics</h1>
                <p className="text-slate-500 mt-1">Class performance reports and insights</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <form className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Exam Term
                        </label>
                        <select
                            name="groupId"
                            defaultValue={selectedGroupId}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            {examGroups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Class
                        </label>
                        <select
                            name="classId"
                            defaultValue={selectedClassId}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Analyze
                    </button>
                </form>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    {error}
                </div>
            )}

            {reportData && reportData.summary ? (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Total Students</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {reportData.summary.totalStudents}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Pass Percentage</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {reportData.summary.passPercentage.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Class Average</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {reportData.summary.avgPercentage.toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 text-red-600 rounded-lg">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">Failed</p>
                                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                        {reportData.summary.failedStudents}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Toppers List */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <Trophy className="w-5 h-5 text-yellow-500" />
                                Top Performers
                            </h3>
                            <div className="space-y-4">
                                {reportData.toppers.map((student, index) => (
                                    <div key={index} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
                                            ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-slate-400' : 'bg-orange-400'}
                                        `}>
                                            {index + 1}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800 dark:text-white">{student.name}</p>
                                            <p className="text-xs text-slate-500">Roll No: {student.rollNo}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-indigo-600">{student.percentage.toFixed(1)}%</p>
                                            <p className="text-xs text-slate-500">{student.totalObtained} Marks</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Subject Analysis */}
                        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Subject Analysis</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="p-3 text-left font-semibold text-slate-700 dark:text-slate-200">Subject</th>
                                            <th className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">Avg %</th>
                                            <th className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">Pass %</th>
                                            <th className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">Highest</th>
                                            <th className="p-3 text-center font-semibold text-slate-700 dark:text-slate-200">Lowest</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {reportData.subjectAnalysis.map((subject, index) => (
                                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="p-3 font-medium text-slate-800 dark:text-white">
                                                    {subject.name}
                                                    {subject.code && <span className="text-slate-400 text-xs ml-1">({subject.code})</span>}
                                                </td>
                                                <td className="p-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-indigo-500"
                                                                style={{ width: `${subject.avgPercentage}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs">{subject.avgPercentage.toFixed(0)}%</span>
                                                    </div>
                                                </td>
                                                <td className="p-3 text-center">
                                                    <span className={`
                                                        px-2 py-1 rounded text-xs font-medium
                                                        ${subject.passPercentage >= 90 ? 'bg-green-100 text-green-700' :
                                                            subject.passPercentage >= 70 ? 'bg-blue-100 text-blue-700' :
                                                                'bg-red-100 text-red-700'}
                                                    `}>
                                                        {subject.passPercentage.toFixed(0)}%
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center text-green-600 font-medium">{subject.highest}</td>
                                                <td className="p-3 text-center text-red-600 font-medium">{subject.lowest}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 text-center rounded-xl border border-slate-200 dark:border-slate-700">
                    <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        No Data Available
                    </h3>
                    <p className="text-slate-500">
                        {selectedGroupId && selectedClassId
                            ? "No results found for the selected criteria."
                            : "Select an Exam Term and Class to view the report."}
                    </p>
                </div>
            )}
        </div>
    );
}
