import React from 'react';
import { getClasses, createClass, deleteClass } from '@/lib/actions/academics';
import { Layers } from 'lucide-react';
import { AddClassForm } from './AddClassForm';
import AcademicsQuickMenu from '@/components/academics/QuickActionsMenu';
import ClassCard from '@/components/academics/ClassCard';

import { prisma } from '@/lib/prisma';

export default async function AcademicsPage() {
    try {
        const classes = await getClasses();
        const currentAcademicYear = '2024-2025';

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Layers className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                        Class Management
                    </h1>
                    <div className="flex items-center gap-3">
                        <a
                            href="/admin/academics/subjects"
                            className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
                        >
                            Manage Subjects
                        </a>
                        <AcademicsQuickMenu />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Class Form */}
                    <AddClassForm defaultAcademicYear={currentAcademicYear} />

                    {/* Class List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Existing Classes</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{classes.length} classes total</p>
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Class</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Section</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Students</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Capacity</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {classes.map((c) => (
                                            <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="p-4 font-medium text-slate-800 dark:text-white">{c.name}</td>
                                                <td className="p-4 text-slate-600 dark:text-slate-400">
                                                    <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-sm font-semibold">
                                                        {c.section}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-semibold text-slate-800 dark:text-white">
                                                        {c._count?.students || 0}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-600 dark:text-slate-400">{c.capacity}</span>
                                                        <div className="w-20 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full ${((c._count?.students || 0) / c.capacity) * 100 >= 90
                                                                    ? 'bg-red-500'
                                                                    : ((c._count?.students || 0) / c.capacity) * 100 >= 75
                                                                        ? 'bg-yellow-500'
                                                                        : 'bg-green-500'
                                                                    }`}
                                                                style={{
                                                                    width: `${Math.min(((c._count?.students || 0) / c.capacity) * 100, 100)}%`
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex gap-2">
                                                        <a
                                                            href={`/admin/academics/classes/${c.id}/edit`}
                                                            className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                                                        >
                                                            Edit
                                                        </a>
                                                        <form action={async () => {
                                                            'use server';
                                                            await deleteClass(c.id);
                                                        }} className="inline">
                                                            <button
                                                                type="submit"
                                                                className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Card View */}
                            <div className="md:hidden p-4 space-y-3">
                                {classes.map((c) => (
                                    <ClassCard key={c.id} classData={c} />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Academics Page Error:', error);
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Academics Module Error</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-4">Unable to load class data. Please check your database connection and try again.</p>
                    <a href="/admin/academics" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                        Retry
                    </a>
                </div>
            </div>
        );
    }
}
