'use client';

import { createAcademicYear } from '@/lib/actions/academic-year';
import { Calendar, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function NewAcademicYearPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        const result = await createAcademicYear(formData);

        if (result.success) {
            toast.success(result.message || 'Academic year created successfully');
            router.push('/admin/settings/academic-years');
        } else {
            toast.error(result.error || 'Failed to create academic year');
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/settings/academic-years"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-indigo-600" />
                        Create New Academic Year
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Set up a new academic session for your school
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <form action={handleSubmit} className="space-y-6">
                    {/* Year Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Academic Year Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g., 2025-2026"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Format: YYYY-YYYY (e.g., 2025-2026)
                        </p>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                defaultValue="2025-04-01"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                End Date *
                            </label>
                            <input
                                type="date"
                                name="endDate"
                                required
                                defaultValue="2026-03-31"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Initial Status
                        </label>
                        <select
                            name="status"
                            defaultValue="DRAFT"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="DRAFT">Draft (Not active yet)</option>
                            <option value="ACTIVE">Active</option>
                        </select>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            Draft years can be prepared ahead of time and activated later
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                            📌 Important Notes:
                        </h4>
                        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                            <li>Only one academic year can be set as "Current" at a time</li>
                            <li>You can create years in advance as drafts</li>
                            <li>Years can be archived when they're no longer active</li>
                            <li>All student data will be associated with the year they're admitted in</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {loading ? 'Creating...' : 'Create Academic Year'}
                        </button>
                        <Link
                            href="/admin/settings/academic-years"
                            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
