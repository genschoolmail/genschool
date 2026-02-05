'use client';

import { createClass } from '@/lib/actions/academics';
import { Plus, Loader2 } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { useState } from 'react';
import { toast } from 'sonner';

export function AddClassForm({ defaultAcademicYear = '2024-2025' }: { defaultAcademicYear?: string }) {
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        try {
            const result = await createClass(formData);
            if (result.success) {
                toast.success('Class created successfully!');
                (e.target as HTMLFormElement).reset();
            } else {
                toast.error(result.error || 'Failed to create class');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 h-fit">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                    <Plus className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add New Class</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Create a new class section</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Class Name"
                        name="name"
                        placeholder="e.g. 10"
                        required
                    />
                    <FormInput
                        label="Section"
                        name="section"
                        placeholder="e.g. A"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        label="Capacity"
                        name="capacity"
                        type="number"
                        defaultValue={50}
                        required
                    />
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            Academic Year
                        </label>
                        <input
                            name="academicYear"
                            defaultValue={defaultAcademicYear}
                            required
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white transition-all"
                            placeholder="YYYY-YYYY"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating...
                        </>
                    ) : (
                        <>
                            <Plus className="w-5 h-5" />
                            Create Class
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
