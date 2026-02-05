import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default async function EditAdmitCardPage({ params }: { params: { id: string } }) {
    const admitCard = await prisma.admitCard.findUnique({
        where: { id: params.id },
        include: {
            student: {
                include: {
                    user: true,
                    class: true
                }
            },
            examGroup: true
        }
    });

    if (!admitCard) {
        notFound();
    }

    async function updateAdmitCard(formData: FormData) {
        'use server';

        const status = formData.get('status') as string;
        const remarks = formData.get('remarks') as string;

        await prisma.admitCard.update({
            where: { id: params.id },
            data: {
                status: status as any,
                remarks: remarks || null
            }
        });

        redirect(`/admin/exams/admit-cards/${params.id}`);
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/exams/admit-cards/${params.id}`}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Admit Card</h1>
                    <p className="text-slate-500 mt-1">
                        {admitCard.student.user.name} - {admitCard.student.rollNo}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <form action={updateAdmitCard} className="space-y-6">
                    {/* Student Info (Read-only) */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Student Name</label>
                            <p className="text-slate-800 dark:text-white font-medium">{admitCard.student.user.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Roll Number</label>
                            <p className="text-slate-800 dark:text-white font-medium">{admitCard.student.rollNo}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Class</label>
                            <p className="text-slate-800 dark:text-white font-medium">
                                {admitCard.student.class?.name || '-'}-{admitCard.student.class?.section || ''}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Exam Term</label>
                            <p className="text-slate-800 dark:text-white font-medium">{admitCard.examGroup.name}</p>
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="status"
                            required
                            defaultValue={admitCard.status}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        >
                            <option value="GENERATED">Generated (Pending Issue)</option>
                            <option value="ISSUED">Issued (Student can download)</option>
                            <option value="BLOCKED">Blocked (Student cannot access)</option>
                        </select>
                        <p className="text-xs text-slate-500 mt-1">
                            Students can only download admit cards with "Issued" status
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Remarks (Optional)
                        </label>
                        <textarea
                            name="remarks"
                            rows={3}
                            defaultValue={admitCard.remarks || ''}
                            placeholder="Internal notes about this admit card..."
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div>
                            <label className="block text-sm font-medium text-slate-500 mb-1">Generated On</label>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {new Date(admitCard.generatedAt).toLocaleString()}
                            </p>
                        </div>
                        {admitCard.downloadedAt && (
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Last Downloaded</label>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {new Date(admitCard.downloadedAt).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <Link
                            href={`/admin/exams/admit-cards/${params.id}`}
                            className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center font-medium"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
