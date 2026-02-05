import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NewExamScheduleForm from './NewExamScheduleForm';

export default async function NewExamSchedulePage({
    searchParams
}: {
    searchParams: { groupId?: string }
}) {
    const examGroups = await prisma.examGroup.findMany({
        orderBy: { order: 'asc' }
    });

    const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' }
    });

    const subjects = await prisma.subject.findMany({
        include: {
            class: true
        },
        orderBy: { name: 'asc' }
    });

    const teachers = await prisma.teacher.findMany({
        include: { user: { select: { name: true } } },
        orderBy: { user: { name: 'asc' } }
    });

    const selectedGroupId = searchParams.groupId || examGroups[0]?.id;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/exams"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Schedule Exam</h1>
                    <p className="text-slate-500 mt-1">Create a new exam schedule for a subject</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <NewExamScheduleForm
                    examGroups={examGroups}
                    classes={classes}
                    subjects={subjects}
                    teachers={teachers}
                    selectedGroupId={selectedGroupId || ''}
                />
            </div>
        </div>
    );
}
