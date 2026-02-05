'use client';

import { useState } from 'react';
import { updateFeeConfiguration } from '@/lib/fee-configuration-actions';
import { toast } from 'sonner';

interface FeeConfiguration {
    id: string;
    lateFeeEnabled: boolean;
    lateFeePercentage: number;
    lateFeeAmount: number;
    lateFeeGraceDays: number;
    discountEnabled: boolean;
    earlyBirdDiscountPercentage: number;
    earlyBirdDiscountDays: number;
}

export default function FeeConfigurationForm({ configuration }: { configuration: FeeConfiguration | null }) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const result = await updateFeeConfiguration(formData);

        if (result.success) {
            toast.success('Configuration updated successfully');
        } else {
            toast.error(result.error || 'Failed to update configuration');
        }

        setLoading(false);
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Configuration Settings</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Late Fee Settings */}
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white">Late Fee Settings</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="lateFeeEnabled"
                                    value="true"
                                    defaultChecked={configuration?.lateFeeEnabled}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Enable</span>
                            </label>
                        </div>
                        <p className="text-sm text-slate-500">Configure late payment penalties</p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Late Fee Percentage (%)
                            </label>
                            <input
                                type="number"
                                name="lateFeePercentage"
                                step="0.01"
                                min="0"
                                defaultValue={configuration?.lateFeePercentage || 0}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Fixed Late Fee Amount (₹)
                            </label>
                            <input
                                type="number"
                                name="lateFeeAmount"
                                step="1"
                                min="0"
                                defaultValue={configuration?.lateFeeAmount || 0}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Grace Period (Days)
                            </label>
                            <input
                                type="number"
                                name="lateFeeGraceDays"
                                min="0"
                                defaultValue={configuration?.lateFeeGraceDays || 0}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Discount Rules */}
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 dark:text-white">Discount Rules</h3>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="discountEnabled"
                                    value="true"
                                    defaultChecked={configuration?.discountEnabled}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Enable</span>
                            </label>
                        </div>
                        <p className="text-sm text-slate-500">Setup automatic discounts</p>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Early Bird Discount (%)
                            </label>
                            <input
                                type="number"
                                name="earlyBirdDiscountPercentage"
                                step="0.01"
                                min="0"
                                max="100"
                                defaultValue={configuration?.earlyBirdDiscountPercentage || 0}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Early Payment Days Before Due
                            </label>
                            <input
                                type="number"
                                name="earlyBirdDiscountDays"
                                min="0"
                                defaultValue={configuration?.earlyBirdDiscountDays || 0}
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-bold shadow-lg"
                    >
                        {loading ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </form>
        </div>
    );
}
