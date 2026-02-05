'use client';

import React, { useTransition } from 'react';
import { createExamGroup } from '@/lib/exam-actions';
import Link from 'next/link';
import { ArrowLeft, Calendar, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function NewExamGroupPage() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const defaultAcademicYear = `${currentYear}-${nextYear}`;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const result = await createExamGroup(formData);
                if (result.success) {
                    toast.success(result.message);
                    router.push('/admin/exams');
                    router.refresh();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to create exam term');
            }
        });
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/exams"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create Exam Term</h1>
                    <p className="text-slate-500 mt-1">Define a new exam group (e.g., Mid-Term, Final)</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Exam Term Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Exam Term Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g., Term 1 Examination, Mid-Term, Final Examination"
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                        <p className="text-xs text-slate-500 mt-1">This will be displayed on admit cards and marksheets</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Optional details about this exam term"
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>

                    {/* Academic Year */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Academic Year <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="academicYear"
                            required
                            defaultValue={defaultAcademicYear}
                            placeholder="e.g., 2024-2025"
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>

                    {/* Display Order */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Display Order
                        </label>
                        <input
                            type="number"
                            name="order"
                            defaultValue={1}
                            min={1}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Used for sorting (Term 1 = 1, Term 2 = 2, Final = 3)
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex gap-3">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800 dark:text-blue-200">
                                <p className="font-medium mb-1">What happens next?</p>
                                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                                    <li>Create exam schedules for each subject</li>
                                    <li>Generate admit cards for students</li>
                                    <li>Teachers can enter marks</li>
                                    <li>Generate marksheets and reports</li>
                                </ul>
                            </div>
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
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-5 h-5" />
                                    Create Exam Term
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
