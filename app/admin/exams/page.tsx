import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BookOpen, Calendar, FileText, Plus, Users, Edit, UserPlus } from 'lucide-react';
import { DeleteExamGroupButton } from './DeleteExamGroupButton';
import { DeleteScheduleButton } from './DeleteScheduleButton';

export default async function ExamsPage() {
    const examGroups = await prisma.examGroup.findMany({
        include: {
            examSchedules: {
                include: {
                    class: true,
                    subject: true,
                    teacher: { include: { user: true } },
                    _count: {
                        select: { examResults: true }
                    }
                }
            }
        },
        orderBy: { order: 'asc' }
    });

    const totalSchedules = examGroups.reduce((acc, group) => acc + group.examSchedules.length, 0);
    const admitCardCount = await prisma.admitCard.count();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Management</h1>
                    <p className="text-slate-500 mt-1">Manage exam terms, schedules, and results</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        href="/admin/exams/assignments"
                        className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
                    >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Assign Teachers
                    </Link>
                    <Link
                        href="/admin/exams/groups/new"
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        New Exam Term
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Total Exam Terms</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{examGroups.length}</p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Scheduled Exams</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalSchedules}</p>
                        </div>
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-500">Admit Cards Issued</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{admitCardCount}</p>
                        </div>
                        <div className="p-3 bg-purple-100 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Management Tools */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link
                    href="/admin/exams/admit-cards"
                    className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:scale-105"
                >
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                        <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-white text-center">Admit Cards</span>
                </Link>

                <Link
                    href="/admin/exams/grading"
                    className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:scale-105"
                >
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-3">
                        <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-white text-center">Grading System</span>
                </Link>

                <Link
                    href="/admin/exams/marksheets"
                    className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:scale-105"
                >
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-3">
                        <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-white text-center">Marksheets</span>
                </Link>

                <Link
                    href="/admin/exams/reports"
                    className="flex flex-col items-center p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all hover:scale-105"
                >
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg mb-3">
                        <FileText className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-white text-center">Exam Reports</span>
                </Link>
            </div>

            {/* Exam Groups List */}
            <div className="space-y-4">
                {examGroups.map(group => (
                    <div key={group.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Group Header */}
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">{group.name}</h2>
                                    <p className="text-indigo-100 mt-1">{group.description}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                            📅 {group.academicYear}
                                        </span>
                                        <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                                            {group.examSchedules.length} Exams
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link
                                        href={`/admin/exams/groups/${group.id}/edit`}
                                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                                        title="Edit Exam Group"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </Link>
                                    <DeleteExamGroupButton groupId={group.id} groupName={group.name} />
                                    <Link
                                        href={`/admin/exams/schedule/new?groupId=${group.id}`}
                                        className="px-4 py-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                                    >
                                        + Add Schedule
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Schedules Table */}
                        {group.examSchedules.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Subject</th>
                                            <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Class</th>
                                            <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Date & Time</th>
                                            <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Assigned Teacher</th>
                                            <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Marks</th>
                                            <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Results</th>
                                            <th className="p-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {group.examSchedules.map(schedule => (
                                            <tr key={schedule.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium text-slate-800 dark:text-white">
                                                            {schedule.subject.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                                    {schedule.class.name}-{schedule.class.section}
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-sm">
                                                        <p className="text-slate-800 dark:text-white font-medium">
                                                            {new Date(schedule.examDate).toLocaleDateString()}
                                                        </p>
                                                        <p className="text-slate-500 text-xs">
                                                            {schedule.startTime} ({schedule.duration} min)
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    {schedule.teacher ? (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                                                {schedule.teacher.user.name?.[0] || 'T'}
                                                            </div>
                                                            <span className="text-sm text-slate-600 dark:text-slate-300">
                                                                {schedule.teacher.user.name}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-slate-600 dark:text-slate-300">
                                                    {schedule.maxMarks} (Pass: {schedule.passingMarks})
                                                </td>
                                                <td className="p-4">
                                                    {schedule._count.examResults > 0 ? (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            {schedule._count.examResults} Entered
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                            Pending
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/admin/exams/schedule/${schedule.id}/edit`}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                            title="Edit Schedule"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <DeleteScheduleButton
                                                            scheduleId={schedule.id}
                                                            subjectName={schedule.subject.name}
                                                        />
                                                        <Link
                                                            href={`/admin/exams/${schedule.id}/marks`}
                                                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium ml-2"
                                                        >
                                                            Enter Marks →
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-500">
                                <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                                <p>No exam schedules created yet</p>
                                <p className="text-sm mt-1">Click "Add Schedule" to create one</p>
                            </div>
                        )}
                    </div>
                ))}

                {examGroups.length === 0 && (
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                        <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            No Exam Terms Created
                        </h3>
                        <p className="text-slate-500 mb-6">
                            Create your first exam term (like "Mid-Term" or "Final") to get started
                        </p>
                        <Link
                            href="/admin/exams/groups/new"
                            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Create Exam Term
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
