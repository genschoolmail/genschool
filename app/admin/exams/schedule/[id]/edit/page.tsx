import React from 'react';
import { prisma } from '@/lib/prisma';
import { updateExamSchedule } from '@/lib/exam-schedule-actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import EditExamScheduleForm from './EditExamScheduleForm';

export default async function EditExamSchedulePage({ params }: { params: { id: string } }) {
    const schedule = await prisma.examSchedule.findUnique({
        where: { id: params.id },
        include: {
            examGroup: true,
            class: true,
            subject: true,
            _count: {
                select: { examResults: true }
            }
        }
    });

    if (!schedule) {
        notFound();
    }

    const teachers = await prisma.teacher.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { user: { name: 'asc' } }
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/exams"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Exam Schedule</h1>
                    <p className="text-slate-500 mt-1">
                        {schedule.subject.name} - Class {schedule.class.name}-{schedule.class.section}
                    </p>
                </div>
            </div>

            {/* Stats */}
            {schedule._count.examResults > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                        📊 <strong>{schedule._count.examResults} student results</strong> have been entered for this exam.
                    </p>
                </div>
            )}

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <EditExamScheduleForm id={params.id} initialData={schedule} teachers={teachers} />
            </div>
        </div>
    );
}
