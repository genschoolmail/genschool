import React from 'react';
import { getClasses, getClassTeachers, removeClassTeacher } from '@/lib/actions/academics';
import { getTeachers } from '@/lib/actions';
import { Users, UserPlus, Trash2, GraduationCap } from 'lucide-react';
import AssignTeacherForm from './AssignTeacherForm';

export default async function ClassTeachersPage() {
    const classes = await getClasses();
    const teachers = await getTeachers();
    const assignments = await getClassTeachers();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <GraduationCap className="w-8 h-8 text-indigo-600" />
                    Class Teacher Assignments
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Assignment Form */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <UserPlus className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Assign Class Teacher</h3>
                    </div>

                    <AssignTeacherForm classes={classes} teachers={teachers} />
                </div>

                {/* Assignments List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Current Assignments</h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Class</th>
                                        <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Teacher</th>
                                        <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                                        <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Year</th>
                                        <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="p-4 font-medium text-slate-800 dark:text-white">
                                                {assignment.class.name} - {assignment.class.section}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                                                        {assignment.teacher.user?.name?.charAt(0) || 'T'}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800 dark:text-white">{assignment.teacher.user?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-slate-500">{assignment.teacher.designation || 'Teacher'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${assignment.role === 'PRIMARY'
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {assignment.role}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-600 dark:text-slate-400">
                                                {assignment.academicYear}
                                            </td>
                                            <td className="p-4">
                                                <form action={async () => {
                                                    'use server';
                                                    await removeClassTeacher(assignment.id);
                                                }}>
                                                    <button
                                                        type="submit"
                                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Remove Assignment"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    ))}
                                    {assignments.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-slate-500">
                                                No class teachers assigned yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
