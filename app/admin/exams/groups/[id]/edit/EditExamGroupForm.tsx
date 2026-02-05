'use client';

import React, { useTransition } from 'react';
import { updateExamGroup } from '@/lib/exam-actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface EditExamGroupFormProps {
    id: string;
    initialData: any;
}

export default function EditExamGroupForm({ id, initialData }: EditExamGroupFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    // Helper to format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const formatDateForInput = (dateString: any) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        // Adjust for local timezone offset to ensure correct display
        const offset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - offset);
        return localDate.toISOString().slice(0, 16);
    };

    const formatDateOnly = (dateString: any) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const result = await updateExamGroup(id, formData);
                if (result.success) {
                    toast.success(result.message);
                    router.push(`/admin/exams/groups/${id}`);
                    router.refresh();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to update exam term');
            }
        });
    };

    return (
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
                    defaultValue={initialData.name}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                </label>
                <textarea
                    name="description"
                    rows={3}
                    defaultValue={initialData.description || ''}
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
                    defaultValue={initialData.academicYear}
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
                    defaultValue={initialData.order}
                    min={1}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Exam Dates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="examStartDate"
                            defaultValue={formatDateOnly(initialData.examStartDate)}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="examEndDate"
                            defaultValue={formatDateOnly(initialData.examEndDate)}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Admit Card Settings</h3>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Download Start Date
                            </label>
                            <input
                                type="datetime-local"
                                name="admitCardDownloadStart"
                                defaultValue={formatDateForInput(initialData.admitCardDownloadStart)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Download End Date
                            </label>
                            <input
                                type="datetime-local"
                                name="admitCardDownloadEnd"
                                defaultValue={formatDateForInput(initialData.admitCardDownloadEnd)}
                                className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="admitCardAutoIssue"
                            id="admitCardAutoIssue"
                            defaultChecked={initialData.admitCardAutoIssue}
                            className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="admitCardAutoIssue" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Auto-issue admit cards upon generation
                        </label>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Results Settings</h3>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Marksheet Publication Date
                    </label>
                    <input
                        type="datetime-local"
                        name="marksheetPublishDate"
                        defaultValue={formatDateForInput(initialData.marksheetPublishDate)}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                        Results will be visible to students after this date
                    </p>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                    href={`/admin/exams/groups/${id}`}
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
