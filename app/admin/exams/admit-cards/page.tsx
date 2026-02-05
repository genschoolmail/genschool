import React from 'react';
import { prisma } from '@/lib/prisma';
import { generateAdmitCardsForClass } from '@/lib/actions/exams';
import Link from 'next/link';
import { Download, Users, CheckCircle, XCircle, Filter } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getStudentName, getStudentClassDesignation } from '@/lib/helpers/exam-data-transformers';
import BulkGenerateAdmitCardsForm from './BulkGenerateAdmitCardsForm';
import { IssueButton, BulkIssueButton } from './IssueActions';

export default async function AdmitCardsManagementPage({
    searchParams
}: {
    searchParams: { groupId?: string; classId?: string }
}) {
    const examGroups = await prisma.examGroup.findMany({
        include: {
            _count: {
                select: { admitCards: true }
            }
        },
        orderBy: { order: 'asc' }
    });

    const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' }
    });

    const selectedGroupId = searchParams.groupId || examGroups[0]?.id;
    const selectedClassId = searchParams.classId || '';

    const whereClause: any = {};
    if (selectedGroupId) whereClause.examGroupId = selectedGroupId;
    if (selectedClassId) whereClause.student = { classId: selectedClassId };

    const admitCards = selectedGroupId
        ? await prisma.admitCard.findMany({
            where: whereClause,
            include: {
                student: {
                    include: {
                        class: true,
                        user: true
                    }
                },
                examGroup: true
            },
            orderBy: {
                student: {
                    rollNo: 'asc'
                }
            }
        })
        : [];


    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admit Card Management</h1>
                <p className="text-slate-500 mt-1">Generate and manage exam admit cards</p>
            </div>

            {/* Filters & Actions */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {/* Filter Form */}
                <form className="flex flex-col md:flex-row gap-4 items-end mb-6">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Exam Term
                        </label>
                        <select
                            name="groupId"
                            defaultValue={selectedGroupId}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        >
                            {examGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Class (Optional Filter)
                        </label>
                        <select
                            name="classId"
                            defaultValue={selectedClassId}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </form>

                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <BulkGenerateAdmitCardsForm groupId={selectedGroupId || ''} classes={classes} />
                    <BulkIssueButton
                        groupId={selectedGroupId || ''}
                        classId={selectedClassId}
                        totalToIssue={admitCards.filter(c => c.status === 'GENERATED').length}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">Total Cards</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{admitCards.length}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">Generated</p>
                    <p className="text-2xl font-bold text-green-600">
                        {admitCards.filter(c => c.status === 'GENERATED').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">Issued</p>
                    <p className="text-2xl font-bold text-blue-600">
                        {admitCards.filter(c => c.status === 'ISSUED').length}
                    </p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500">Blocked</p>
                    <p className="text-2xl font-bold text-red-600">
                        {admitCards.filter(c => c.status === 'BLOCKED').length}
                    </p>
                </div>
            </div>

            {/* Admit Cards List */}
            {admitCards.length > 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Roll No
                                </th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Student Name
                                </th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Class
                                </th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Status
                                </th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Downloaded
                                </th>
                                <th className="p-4 text-right text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {admitCards.map(card => (
                                <tr key={card.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-4 font-medium text-slate-800 dark:text-white">
                                        {card.student.rollNo}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">
                                        {card.student.user.name}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300">
                                        {card.student.class ? `${card.student.class.name}-${card.student.class.section}` : 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        {card.status === 'GENERATED' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Generated
                                            </span>
                                        )}
                                        {card.status === 'ISSUED' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Issued
                                            </span>
                                        )}
                                        {card.status === 'BLOCKED' && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                <XCircle className="w-3 h-3 mr-1" />
                                                Blocked
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                                        {card.downloadedAt
                                            ? new Date(card.downloadedAt).toLocaleDateString()
                                            : 'Not yet'}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <IssueButton id={card.id} status={card.status} />
                                            <Link
                                                href={`/admin/exams/admit-cards/${card.id}`}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium inline-flex items-center gap-1"
                                            >
                                                <Download className="w-4 h-4" />
                                                View
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <Users className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        No Admit Cards Generated
                    </h3>
                    <p className="text-slate-500 mb-6">Select a class and click "Generate" to create admit cards.</p>
                </div>
            )}
        </div>
    );
}
