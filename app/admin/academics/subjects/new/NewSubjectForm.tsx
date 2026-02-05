'use client';

import { useFormStatus } from 'react-dom';
import { createSubject } from '@/lib/actions/academics';
import { Loader2, Save, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';

interface Class {
    id: string;
    name: string;
    section: string;
}

interface Teacher {
    id: string;
    user: {
        name: string | null;
    };
}

interface SubjectGroup {
    id: string;
    name: string;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                </>
            ) : (
                <>
                    <Save className="w-5 h-5" />
                    Create Subject
                </>
            )}
        </button>
    );
}

export function NewSubjectForm({
    classes,
    teachers,
    subjectGroups
}: {
    classes: Class[];
    teachers: Teacher[];
    subjectGroups: SubjectGroup[];
}) {
    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/academics/subjects"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Add Subject</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create a new academic subject</p>
                </div>
            </div>

            <form action={createSubject} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormInput
                            label="Subject Name *"
                            name="name"
                            placeholder="e.g. Mathematics"
                            required
                            icon={<BookOpen className="w-4 h-4" />}
                        />

                        <FormInput
                            label="Subject Code"
                            name="code"
                            placeholder="e.g. MATH101"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Class *"
                            name="classId"
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}-{cls.section}
                                </option>
                            ))}
                        </FormSelect>

                        <FormSelect
                            label="Subject Group"
                            name="subjectGroupId"
                        >
                            <option value="">Select Group (Optional)</option>
                            {subjectGroups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </FormSelect>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Teacher"
                            name="teacherId"
                        >
                            <option value="">Select Teacher (Optional)</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.user.name}
                                </option>
                            ))}
                        </FormSelect>

                        <FormInput
                            label="Credits"
                            name="credits"
                            type="number"
                            min={0}
                            defaultValue={0}
                        />
                    </div>
                </div>

                {/* Sticky Submit Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-40 md:static md:bg-transparent md:border-0 md:p-6 md:pt-0 md:flex md:justify-end">
                    <div className="max-w-4xl mx-auto md:mx-0 w-full md:w-auto flex gap-4">
                        <SubmitButton />
                        <Link
                            href="/admin/academics/subjects"
                            className="hidden md:flex items-center justify-center px-6 py-3.5 border border-slate-300 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
