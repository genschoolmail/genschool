import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getTeacherExamSchedules } from '@/lib/marks-actions';
import MarksEntry from './MarksEntry';

export default async function UploadMarksPage() {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    const examSchedules = await getTeacherExamSchedules(session.user.id);

    // Serialize the data to ensure it's plain objects
    const serializedSchedules = examSchedules.map(exam => ({
        id: exam.id,
        examGroup: { name: exam.examGroup.name },
        class: { name: exam.class.name, section: exam.class.section },
        subject: { name: exam.subject.name },
        maxMarks: exam.maxMarks,
        passingMarks: exam.passingMarks
    }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-slate-100 dark:border-slate-700">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1 md:mb-2">
                        Upload Marks
                    </h1>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                        Enter exam marks for your students
                    </p>
                </div>

                <MarksEntry examSchedules={serializedSchedules} userId={session.user.id} />
            </div>
        </div>
    );
}
