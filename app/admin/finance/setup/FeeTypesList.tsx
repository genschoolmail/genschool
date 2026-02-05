'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { createFeeType, deleteFeeType } from '@/lib/fee-configuration-actions';
import { toast } from 'sonner';

interface FeeType {
    id: string;
    name: string;
    description: string | null;
}

export default function FeeTypesList({ feeTypes }: { feeTypes: FeeType[] }) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createFeeType(formData);

        if (result.success) {
            toast.success('Fee type created successfully');
            setShowForm(false);
            e.currentTarget.reset();
        } else {
            toast.error(result.error || 'Failed to create fee type');
        }

        setLoading(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete fee type "${name}"?`)) return;

        const result = await deleteFeeType(id);
        if (result.success) {
            toast.success('Fee type deleted');
        } else {
            toast.error(result.error || 'Failed to delete');
        }
    }

    return (
        <div className="space-y-3">
            {feeTypes.map((type) => (
                <div key={type.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-medium text-slate-800 dark:text-white">{type.name}</p>
                        {type.description && <p className="text-sm text-slate-500">{type.description}</p>}
                    </div>
                    <button
                        onClick={() => handleDelete(type.id, type.name)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}

            {showForm ? (
                <form onSubmit={handleSubmit} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                    <input
                        type="text"
                        name="name"
                        placeholder="Fee Type Name (e.g., Tuition Fee)"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Description (optional)"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-white rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setShowForm(true)}
                    className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Fee Type
                </button>
            )}
        </div>
    );
}
