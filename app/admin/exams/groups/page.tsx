import React from 'react';
import Link from 'next/link';
import { Plus, Calendar } from 'lucide-react';
import { getExamGroups } from '@/lib/actions/exams';

export default async function ExamGroupsPage() {
    const examGroups = await getExamGroups();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Groups</h2>
                <Link
                    href="/admin/exams/groups/new"
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Exam Group
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examGroups.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-slate-800 p-12 rounded-2xl text-center">
                        <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-500">No exam groups found. Create one to get started.</p>
                    </div>
                ) : (
                    examGroups.map((group) => (
                        <Link
                            key={group.id}
                            href={`/admin/exams/groups/${group.id}`}
                            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all hover:scale-[1.02]"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                                    <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs rounded-full font-medium">
                                    {group.academicYear}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                {group.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                {group.description || 'No description'}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    {group.examSchedules.length} Exams
                                </span>
                                <span className="text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                                    View Details →
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
