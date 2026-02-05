import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getSubjectGroups } from '@/lib/actions/academics';
import { SubjectGroupActions } from './SubjectGroupActions';

export default async function SubjectGroupsPage() {
    const subjectGroups = await getSubjectGroups();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Subject Groups</h2>
                <Link
                    href="/admin/academics/subject-groups/new"
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add Subject Group
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Group Name</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Description</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Subjects</th>
                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subjectGroups.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-slate-500">
                                    No subject groups found. Create one to get started.
                                </td>
                            </tr>
                        ) : (
                            subjectGroups.map((group) => (
                                <tr key={group.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 font-medium text-slate-800 dark:text-white">{group.name}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{group.description || 'N/A'}</td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                                            {(group as any).subjects?.length || 0} Subjects
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <SubjectGroupActions groupId={group.id} groupName={group.name} />
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
