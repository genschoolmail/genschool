import React from 'react';
import Link from 'next/link';
import { Plus, BookOpen } from 'lucide-react';
import { getSubjects } from '@/lib/actions/academics';
import { SubjectActions } from './SubjectActions';

export default async function SubjectsPage() {
    const subjects = await getSubjects();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Subjects</h2>
                <Link
                    href="/admin/academics/subjects/new"
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Subject
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Subject Name</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Code</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Class</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Group</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Teacher</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Credits</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjects.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="p-8 text-center text-slate-500">
                                    No subjects found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            subjects.map((subject) => (
                                <tr key={subject.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 font-medium text-slate-800 dark:text-white flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg">
                                            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        </div>
                                        {subject.name}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm">
                                        {subject.code || 'N/A'}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                        {subject.class.name}-{subject.class.section}
                                    </td>
                                    <td className="p-4">
                                        {subject.subjectGroup ? (
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                                                {subject.subjectGroup.name}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-sm">N/A</span>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                        {subject.teacher ? subject.teacher.user.name : 'Not Assigned'}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                                            {subject.credits}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <SubjectActions subjectId={subject.id} subjectName={subject.name} />
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
