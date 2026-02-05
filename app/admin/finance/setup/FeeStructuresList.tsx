'use client';

import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { createFeeStructureConfig, deleteFeeStructureConfig } from '@/lib/fee-configuration-actions';
import { toast } from 'sonner';

interface FeeStructure {
    id: string;
    name: string;
    amount: number;
    frequency: string;
    class: { name: string; section: string } | null;
    feeType: { name: string } | null;
}

interface Class {
    id: string;
    name: string;
    section: string;
}

interface FeeType {
    id: string;
    name: string;
}

export default function FeeStructuresList({
    feeStructures,
    classes,
    feeTypes
}: {
    feeStructures: FeeStructure[];
    classes: Class[];
    feeTypes: FeeType[];
}) {
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await createFeeStructureConfig(formData);

        if (result.success) {
            toast.success('Fee structure created successfully');
            setShowForm(false);
            e.currentTarget.reset();
        } else {
            toast.error(result.error || 'Failed to create fee structure');
        }

        setLoading(false);
    }

    async function handleDelete(id: string, name: string) {
        if (!confirm(`Delete fee structure "${name}"?`)) return;

        const result = await deleteFeeStructureConfig(id);
        if (result.success) {
            toast.success('Fee structure deleted');
        } else {
            toast.error(result.error || 'Failed to delete');
        }
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {feeStructures.map((structure) => (
                    <div key={structure.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">{structure.name}</p>
                                <p className="text-sm text-slate-500">
                                    {structure.class ? `${structure.class.name}-${structure.class.section}` : 'All Classes'}
                                </p>
                            </div>
                            <button
                                onClick={() => handleDelete(structure.id, structure.name)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-200 dark:border-slate-600">
                            <span className="text-sm text-slate-500">{structure.frequency}</span>
                            <span className="font-bold text-green-600 dark:text-green-400">₹{structure.amount.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {showForm ? (
                <form onSubmit={handleSubmit} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                            type="text"
                            name="name"
                            placeholder="Structure Name"
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                        />
                        <input
                            type="number"
                            name="amount"
                            placeholder="Amount"
                            required
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                        />
                        <select
                            name="frequency"
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                        >
                            <option value="">Select Frequency</option>
                            <option value="MONTHLY">Monthly</option>
                            <option value="QUARTERLY">Quarterly</option>
                            <option value="HALF_YEARLY">Half Yearly</option>
                            <option value="YEARLY">Yearly</option>
                            <option value="ONE_TIME">One Time</option>
                        </select>
                        <input
                            type="number"
                            name="dueDay"
                            placeholder="Due Day (1-31)"
                            min="1"
                            max="31"
                            defaultValue="1"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                        />
                        <select
                            name="classId"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                        >
                            <option value="">All Classes</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}-{cls.section}
                                </option>
                            ))}
                        </select>
                        <select
                            name="feeTypeId"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                        >
                            <option value="">Select Fee Type</option>
                            {feeTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Structure'}
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
                    className="w-full p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Fee Structure
                </button>
            )}
        </div>
    );
}
