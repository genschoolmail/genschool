'use client';

import React, { useTransition } from 'react';
import { updateExamSchedule } from '@/lib/exam-schedule-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface EditExamScheduleFormProps {
    id: string;
    initialData: any;
    teachers: any[];
}

export default function EditExamScheduleForm({ id, initialData, teachers }: EditExamScheduleFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const result = await updateExamSchedule(id, formData);
                if (result.success) {
                    toast.success(result.message);
                    router.push('/admin/exams');
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to update schedule');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only Info */}
            <div className="grid grid-cols-3 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                <div>
                    <p className="text-xs text-slate-500">Exam Term</p>
                    <p className="font-medium text-slate-800 dark:text-white">{initialData.examGroup.name}</p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Class</p>
                    <p className="font-medium text-slate-800 dark:text-white">
                        {initialData.class.name}-{initialData.class.section}
                    </p>
                </div>
                <div>
                    <p className="text-xs text-slate-500">Subject</p>
                    <p className="font-medium text-slate-800 dark:text-white">{initialData.subject.name}</p>
                </div>
            </div>


            {/* Date, Time and Shift */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Exam Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="examDate"
                        required
                        defaultValue={new Date(initialData.examDate).toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        name="startTime"
                        required
                        defaultValue={initialData.startTime}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="shift"
                        required
                        defaultValue={initialData.shift || '1st Shift'}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                        <option value="1st Shift">1st Shift (Morning)</option>
                        <option value="2nd Shift">2nd Shift (Afternoon)</option>
                        <option value="3rd Shift">3rd Shift (Evening)</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Maximum Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="maxMarks"
                        required
                        defaultValue={initialData.maxMarks}
                        min={1}
                        step="0.5"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Passing Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="passingMarks"
                        required
                        defaultValue={initialData.passingMarks}
                        min={1}
                        step="0.5"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                    href="/admin/exams"
                    className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center font-medium"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
