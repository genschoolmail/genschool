import React from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { getExamSchedules } from '@/lib/actions/exams';

export default async function ExamSchedulePage() {
    const schedules = await getExamSchedules();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Schedule</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Schedule exams for classes and subjects</p>
                </div>
                <Link
                    href="/admin/exams/schedule/new"
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Schedule Exam
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Exam Group</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Class</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Subject</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Date & Time</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Duration</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Max Marks</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                    No exams scheduled yet. Schedule exams to get started.
                                </td>
                            </tr>
                        ) : (
                            schedules.map((schedule) => (
                                <tr key={schedule.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold">
                                            {schedule.examGroup.name}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-slate-800 dark:text-white">
                                        {schedule.class.name}-{schedule.class.section}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{schedule.subject.name}</td>
                                    <td className="p-4">
                                        <div className="text-sm">
                                            <p className="font-medium text-slate-800 dark:text-white">
                                                {new Date(schedule.examDate).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            <p className="text-slate-500">{schedule.startTime}</p>
                                        </div>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{schedule.duration} mins</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-full font-bold">
                                            {schedule.maxMarks}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors">
                                            Edit
                                        </button>
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
