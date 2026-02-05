'use client';

import React, { useTransition } from 'react';
import { createGrade, updateGrade } from '@/lib/actions/exams';
import Link from 'next/link';
import { Plus, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface GradeFormProps {
    initialData?: any;
}

export function GradeForm({ initialData }: GradeFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isEditing = !!initialData;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                let result;
                if (isEditing) {
                    result = await updateGrade(initialData.id, formData);
                } else {
                    result = await createGrade(formData);
                }

                if (result.success) {
                    toast.success(result.message);
                    router.push('/admin/exams/grading');
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            } catch (error: any) {
                toast.error(error.message || 'An error occurred');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Grade *
                    </label>
                    <input
                        type="text"
                        name="grade"
                        defaultValue={initialData?.grade}
                        placeholder="e.g. A+, A, B, C"
                        required
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Grade Point
                    </label>
                    <input
                        type="number"
                        step="0.1"
                        name="gradePoint"
                        defaultValue={initialData?.gradePoint}
                        placeholder="e.g. 10, 9, 8"
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Min Marks (%) *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        name="minMarks"
                        defaultValue={initialData?.minMarks}
                        placeholder="e.g. 90"
                        required
                        min="0"
                        max="100"
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Max Marks (%) *
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        name="maxMarks"
                        defaultValue={initialData?.maxMarks}
                        placeholder="e.g. 100"
                        required
                        min="0"
                        max="100"
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Display Order
                    </label>
                    <input
                        type="number"
                        name="order"
                        defaultValue={initialData?.order || 1}
                        min="1"
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Description (Remarks)
                    </label>
                    <input
                        type="text"
                        name="description"
                        defaultValue={initialData?.description}
                        placeholder="e.g. Excellent, Very Good"
                        className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
            </div>

            <div className="flex gap-3 pt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isEditing ? 'Updating...' : 'Creating...'}
                        </>
                    ) : (
                        <>
                            {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                            {isEditing ? 'Update Grade' : 'Create Grade'}
                        </>
                    )}
                </button>
                <Link
                    href="/admin/exams/grading"
                    className="px-6 py-3 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors text-center"
                >
                    Cancel
                </Link>
            </div>
        </form>
    );
}
