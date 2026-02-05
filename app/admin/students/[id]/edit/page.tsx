import React from 'react';
import { updateStudent, getClasses } from '@/lib/actions';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EditStudentForm } from './EditStudentForm';

export default async function EditStudentPage({ params }: { params: { id: string } }) {
    const student = await prisma.student.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            class: true,
            parent: true
        }
    });

    if (!student) {
        redirect('/admin/students');
    }

    const classes = await getClasses();

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/students" className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-600" />
                </Link>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Student</h2>
            </div>

            <EditStudentForm student={student} classes={classes} />
        </div>
    );
}
