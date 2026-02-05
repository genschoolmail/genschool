import React from 'react';
import { getClasses, getSubjectGroups } from '@/lib/actions/academics';
import { getTeachers } from '@/lib/actions';
import SubjectForm from '../SubjectForm';
import Link from 'next/link';
import { ArrowLeft, BookOpen } from 'lucide-react';

export default async function NewSubjectPage() {
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
                        <BookOpen className="w-8 h-8 text-indigo-600" />
                        Add New Subject
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Create a new subject and assign it to a class
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <SubjectForm
                    classes={classes}
                    teachers={teachers}
                    subjectGroups={subjectGroups}
                />
            </div>
        </div>
    );
}
