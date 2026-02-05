import React from 'react';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { EditTeacherForm } from './EditTeacherForm';

export default async function EditTeacherPage({
    params
}: {
    params: Promise<{ id: string }> | { id: string }
}) {
    // Handle Next.js 15 Promise params
    const resolvedParams = params instanceof Promise ? await params : params;

    const teacher = await prisma.teacher.findUnique({
        where: { id: resolvedParams.id },
        include: { user: true }
    });

    if (!teacher) {
        redirect('/admin/teachers');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="max-w-5xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Edit Teacher</h1>
                    <p className="text-slate-600 dark:text-slate-400">Update teacher information</p>
                </div>

                <EditTeacherForm
                    teacherId={resolvedParams.id}
                    defaultValues={{
                        name: teacher.user.name || '',
                        email: teacher.user.email || '',
                        phone: teacher.phone || '',
                        designation: teacher.designation || '',
                        subject: teacher.subject || '',
                        address: teacher.address || '',
                        currentImage: teacher.user.image || undefined,
                        currentDocuments: teacher.documents || undefined
                    }}
                />
            </div>
        </div>
    );
}
