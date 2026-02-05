import React from 'react';
import { redirect } from 'next/navigation';
import { createIncome } from '@/lib/finance-actions';

export default function NewIncomePage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Add Income Record</h2>

            <form action={async (formData) => {
                'use server';
                await createIncome(formData);
                redirect('/admin/finance/income');
            }} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Source *
                        </label>
                        <select
                            name="source"
                            required
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        >
                            <option value="">Select Source</option>
                            <option value="FEE">Fee Collection</option>
                            <option value="LIBRARY_FINE">Library Fine</option>
                            <option value="DONATION">Donation</option>
                            <option value="EVENT">Event/Function</option>
                            <option value="TRANSPORT">Transport</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Description *
                        </label>
                        <input
                            type="text"
                            name="description"
                            required
                            placeholder="e.g., Library fine from Class 5-A students"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Amount * (₹)
                            </label>
                            <input
                                type="number"
                                name="amount"
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Date
                            </label>
                            <input
                                type="date"
                                name="date"
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Reference Number
                        </label>
                        <input
                            type="text"
                            name="reference"
                            placeholder="Receipt/Reference number (optional)"
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            rows={3}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                            placeholder="Additional notes..."
                        ></textarea>
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Add Income
                    </button>
                    <a
                        href="/admin/finance/income"
                        className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    );
}
