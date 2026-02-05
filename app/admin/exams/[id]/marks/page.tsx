import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MarksEntryGrid from '@/components/MarksEntryGrid';
import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { saveMarks, submitMarksForReview } from '@/lib/marks-entry-actions';

export default async function MarksEntryPage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) {
        redirect('/login');
    }

    // Get exam schedule with all related data
    const schedule = await prisma.examSchedule.findUnique({
        where: { id: params.id },
        include: {
            examGroup: true,
            class: {
                include: {
                    students: {
                        orderBy: {
                            rollNo: 'asc'
                        },
                        include: {
                            user: true
                        }
                    }
                }
            },
            subject: true,
            examResults: {
                include: {
                    student: true
                }
            }
        }
    });

    const gradingSystem = await prisma.gradeSystem.findMany({
        where: { schoolId: session.user.schoolId },
        orderBy: { minMarks: 'asc' }
    });

    if (!schedule) {
        redirect('/admin/exams');
    }

    // Map students for grid
    const formattedStudents = schedule.class.students.map(s => ({
        id: s.id,
        name: s.user.name || 'Unknown',
        rollNo: s.rollNo || '-'
    }));

    // Get workflow status from first result (all have same status)
    const workflowStatus = (schedule.examResults[0] as any)?.workflowStatus || 'DRAFT';
    const isLocked = workflowStatus === 'LOCKED';

    // Check permissions
    const isAdmin = session.user.role === 'ADMIN';
    const isTeacher = session.user.role === 'TEACHER';

    // Teachers can only edit DRAFT, Admins can edit until LOCKED
    const canEdit = isLocked
        ? false
        : isAdmin
            ? true
            : isTeacher && workflowStatus === 'DRAFT';

    async function handleSaveMarks(marks: Array<{ studentId: string; marksObtained: number; status: string }>) {
        'use server';
        await saveMarks(params.id, marks);
    }

    async function handleSubmit() {
        'use server';
        await submitMarksForReview(params.id);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/exams"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marks Entry</h1>
                        <p className="text-slate-500 mt-1">
                            {schedule.subject.name} - Class {schedule.class.name}-{schedule.class.section}
                        </p>
                    </div>
                </div>
                {isLocked && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                        <Lock className="w-5 h-5" />
                        <span className="font-medium">Results Locked</span>
                    </div>
                )}
            </div>

            {/* Exam Info */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <p className="text-sm text-slate-500">Exam Term</p>
                        <p className="font-semibold text-slate-800 dark:text-white">{schedule.examGroup.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Exam Date</p>
                        <p className="font-semibold text-slate-800 dark:text-white">
                            {new Date(schedule.examDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Max Marks</p>
                        <p className="font-semibold text-slate-800 dark:text-white">{schedule.maxMarks}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Passing Marks</p>
                        <p className="font-semibold text-slate-800 dark:text-white">{schedule.passingMarks}</p>
                    </div>
                </div>
            </div>

            {/* Permission Warning */}
            {!canEdit && !isLocked && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-amber-800">
                        ⚠️ You do not have permission to edit these marks. Status: <strong>{workflowStatus}</strong>
                    </p>
                </div>
            )}

            {/* Marks Entry Grid */}
            {canEdit || isLocked ? (
                <MarksEntryGrid
                    students={formattedStudents}
                    maxMarks={schedule.maxMarks}
                    passingMarks={schedule.passingMarks}
                    scheduleId={schedule.id}
                    existingResults={schedule.examResults as any}
                    workflowStatus={workflowStatus}
                    isLocked={isLocked}
                    onSave={handleSaveMarks}
                    onSubmit={handleSubmit}
                    gradingSystem={gradingSystem}
                />
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <Lock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">Access Denied</h3>
                    <p className="text-slate-500">
                        You do not have permission to view or edit marks for this exam.
                    </p>
                </div>
            )}
        </div>
    );
}
