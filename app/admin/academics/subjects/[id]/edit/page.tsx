import React from 'react';
import { getClasses, getSubjectGroups, getSubjects } from '@/lib/actions/academics'; // Need getSubject(id) but getSubjects is available, or use prisma directly
import { getTeachers } from '@/lib/actions';
import SubjectForm from '../../SubjectForm';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function EditSubjectPage({ params }: { params: { id: string } }) {
    const subject = await prisma.subject.findUnique({
        where: { id: params.id },
    });

    if (!subject) notFound();

    const classes = await getClasses();
    const teachers = await getTeachers();
    const subjectGroups = await getSubjectGroups();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/academics/subjects"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Edit className="w-8 h-8 text-indigo-600" />
                        Edit Subject
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Update subject details and assignments
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <SubjectForm
                    classes={classes}
                    teachers={teachers}
                    subjectGroups={subjectGroups}
                    initialData={subject}
                    isEdit={true}
                />
            </div>
        </div>
    );
}
