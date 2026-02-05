'use client';

import React from 'react';
import { createSubject, updateSubject } from '@/lib/actions/academics';
import { Save, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { toast } from 'sonner';

type Props = {
    classes: any[];
    teachers: any[];
    subjectGroups: any[];
    initialData?: any; // For edit mode
    isEdit?: boolean;
};

export default function SubjectForm({ classes, teachers, subjectGroups, initialData, isEdit = false }: Props) {
    const router = useRouter();
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        try {
            let result;
            if (isEdit && initialData) {
                result = await updateSubject(initialData.id, formData);
            } else {
                result = await createSubject(formData);
            }

            if (result.success) {
                toast.success(`Subject ${isEdit ? 'updated' : 'created'} successfully!`);
                router.push('/admin/academics/subjects');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to save subject');
            }
        } catch (error) {
            console.error(error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form action={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Name */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Subject Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="name"
                        required
                        defaultValue={initialData?.name}
                        placeholder="e.g. Mathematics"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* Subject Code */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Subject Code
                    </label>
                    <input
                        type="text"
                        name="code"
                        defaultValue={initialData?.code}
                        placeholder="e.g. MATH101"
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>

                {/* Class Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Class <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="classId"
                        required
                        defaultValue={initialData?.classId}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                        <option value="">Select Class</option>
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name} - {cls.section} (Year: {cls.academicYear})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Subject Group */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Subject Group
                    </label>
                    <select
                        name="subjectGroupId"
                        defaultValue={initialData?.subjectGroupId || ''}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                        <option value="">None (Standalone)</option>
                        {subjectGroups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Assigned Teacher */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Teacher
                    </label>
                    <select
                        name="teacherId"
                        defaultValue={initialData?.teacherId || ''}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none"
                    >
                        <option value="">No Teacher Assigned</option>
                        {teachers.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.user.name || 'Unknown Teacher'} ({teacher.designation || 'Teacher'})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Credits */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Credits
                    </label>
                    <input
                        type="number"
                        name="credits"
                        min="0"
                        defaultValue={initialData?.credits || 0}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-700">
                <Link
                    href="/admin/academics/subjects"
                    className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            {isEdit ? 'Update Subject' : 'Save Subject'}
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
