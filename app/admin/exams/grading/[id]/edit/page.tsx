import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { GradeForm } from '../../GradeForm';

interface EditGradePageProps {
    params: {
        id: string;
    };
}

export default async function EditGradePage({ params }: EditGradePageProps) {
    const grade = await prisma.gradeSystem.findUnique({
        where: { id: params.id }
    });

    if (!grade) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Grade</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Update grade details and range
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <GradeForm initialData={grade} />
            </div>
        </div>
    );
}
