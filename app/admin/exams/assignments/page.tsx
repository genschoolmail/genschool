import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import ExamAssignmentClient from './ExamAssignmentClient';

export default async function ExamAssignmentsPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect('/login');

    const schoolId = session.user.schoolId;

    const schedules = await prisma.examSchedule.findMany({
        where: { schoolId },
        include: {
            subject: true,
            class: true,
            examGroup: true,
            teacher: {
                include: { user: true }
            }
        },
        orderBy: { examDate: 'desc' }
    });

    const teachers = await prisma.teacher.findMany({
        where: { schoolId: session.user.schoolId }, // using correct schoolId
        include: { user: true },
        orderBy: { user: { name: 'asc' } }
    });

    const examGroups = await prisma.examGroup.findMany({
        where: { schoolId },
        orderBy: { order: 'asc' } // Changed from created_at to order
    });

    const classes = await prisma.class.findMany({
        where: { schoolId },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Exam Assignments</h1>
                <p className="text-slate-500 mt-1">Assign teachers to specific exams for marks entry.</p>
            </div>

            <ExamAssignmentClient
                schedules={schedules as any}
                teachers={teachers as any}
                examGroups={examGroups}
                classes={classes}
            />
        </div>
    );
}
