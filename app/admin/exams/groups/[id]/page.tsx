import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Edit, Calendar, BookOpen, Users, ArrowLeft, Trash2 } from 'lucide-react';
import { notFound } from 'next/navigation';
import { DeleteExamGroupButton } from '../../DeleteExamGroupButton';

export default async function ExamGroupDetailPage({ params }: { params: { id: string } }) {
    const examGroup = await prisma.examGroup.findUnique({
        where: { id: params.id },
        include: {
            examSchedules: {
                include: {
                    class: true,
                    subject: true
                },
                orderBy: { examDate: 'asc' }
            },
            admitCards: {
                include: {
                    student: {
                        include: {
                            user: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    examSchedules: true,
                    admitCards: true
                }
            }
        }
    });

    if (!examGroup) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/exams/groups"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{examGroup.name}</h1>
                        <p className="text-sm text-slate-500 mt-1">{examGroup.academicYear}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/admin/exams/groups/${examGroup.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Group
                    </Link>
                    <DeleteExamGroupButton groupId={examGroup.id} groupName={examGroup.name} />
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                            <Calendar className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Exams</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {examGroup._count.examSchedules}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-500/20 rounded-lg">
                            <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Admit Cards</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                {examGroup._count.admitCards}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                            <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Order</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                #{examGroup.order}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Description */}
            {examGroup.description && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h2 className="font-semibold text-slate-800 dark:text-white mb-2">Description</h2>
                    <p className="text-slate-600 dark:text-slate-300">{examGroup.description}</p>
                </div>
            )}

            {/* Exam Schedules */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Exam Schedules</h2>
                        <Link
                            href={`/admin/exams/schedule/new?groupId=${examGroup.id}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                        >
                            + Add Schedule
                        </Link>
                    </div>
                </div>
                <div className="p-6">
                    {examGroup.examSchedules.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500">No exam schedules yet</p>
                            <Link
                                href={`/admin/exams/schedule/new?groupId=${examGroup.id}`}
                                className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block"
                            >
                                Create first schedule →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {examGroup.examSchedules.map((schedule) => (
                                <div
                                    key={schedule.id}
                                    className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 dark:text-white">
                                            {schedule.subject.name}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                            {schedule.class.name}-{schedule.class.section} • {new Date(schedule.examDate).toLocaleDateString()} • {schedule.startTime}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                Max: {schedule.maxMarks}
                                            </p>
                                            <p className="text-xs text-slate-500">
                                                Pass: {schedule.passingMarks}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/admin/exams/schedule/${schedule.id}/edit`}
                                            className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Link
                        href={`/admin/exams/admit-cards?groupId=${examGroup.id}`}
                        className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                    >
                        <Users className="w-5 h-5" />
                        <span className="font-medium">Manage Admit Cards</span>
                    </Link>
                    <Link
                        href={`/admin/exams/marks/entry?groupId=${examGroup.id}`}
                        className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
                    >
                        <Edit className="w-5 h-5" />
                        <span className="font-medium">Enter Marks</span>
                    </Link>
                    <Link
                        href={`/admin/exams/reports?groupId=${examGroup.id}`}
                        className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors"
                    >
                        <BookOpen className="w-5 h-5" />
                        <span className="font-medium">View Reports</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
