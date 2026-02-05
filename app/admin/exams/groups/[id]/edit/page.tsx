import React from 'react';
import { prisma } from '@/lib/prisma';
import { updateExamGroup } from '@/lib/exam-actions';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { notFound } from 'next/navigation';
import EditExamGroupForm from './EditExamGroupForm';

export default async function EditExamGroupPage({ params }: { params: { id: string } }) {
    const examGroup = await prisma.examGroup.findUnique({
        where: { id: params.id },
        include: {
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

    const updateAction = updateExamGroup.bind(null, params.id);

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/exams/groups/${params.id}`}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Exam Term</h1>
                    <p className="text-slate-500 mt-1">Modify exam group details</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Exam Schedules</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">
                        {examGroup._count.examSchedules}
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Admit Cards</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200 mt-1">
                        {examGroup._count.admitCards}
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <EditExamGroupForm id={params.id} initialData={examGroup} />
            </div>
        </div>
    );
}
