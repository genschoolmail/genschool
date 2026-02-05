import React from 'react';
import Link from 'next/link';
import { Plus, Award } from 'lucide-react';
import { getGradingSystem } from '@/lib/actions/exams';
import { GradeActions } from './GradeActions';

export default async function GradingSystemPage() {
    const grades = await getGradingSystem();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Grading System</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Configure grades and grade points for exam results</p>
                </div>
                <Link
                    href="/admin/exams/grading/new"
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Grade
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Grade</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Min Marks</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Max Marks</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Grade Point</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Description</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grades.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No grades configured. Add grades to get started.
                                </td>
                            </tr>
                        ) : (
                            grades.map((grade) => (
                                <tr key={grade.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full font-bold text-lg">
                                            {grade.grade}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800 dark:text-white">{grade.minMarks}%</td>
                                    <td className="p-4 font-medium text-slate-800 dark:text-white">{grade.maxMarks}%</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">
                                            {grade.gradePoint || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{grade.description || 'N/A'}</td>
                                    <td className="p-4">
                                        <GradeActions gradeId={grade.id} gradeName={grade.grade} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
