'use client';

import React, { useState } from 'react';
import { Building, CreditCard, Landmark, Percent } from 'lucide-react';
import { registerSchoolBankAccount } from '@/lib/actions/bank-actions';

interface BankRegistrationFormProps {
    schoolId: string;
    school: any;
}

export default function BankRegistrationForm({ schoolId, school }: BankRegistrationFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const hasBankDetails = !!school.subMerchantId;
    let parsedBankDetails: any = null;

    if (school.bankDetails) {
        try {
            parsedBankDetails = JSON.parse(school.bankDetails);
        } catch (e) { }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const formData = new FormData(e.currentTarget);

        try {
            const res = await registerSchoolBankAccount(schoolId, formData);
            if (res.success) {
                setSuccess(res.message);
            } else {
                setError(res.error || 'Setup failed');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Razorpay Bank Setup</h2>
                        <p className="text-sm text-slate-500">Configure bank account for fee settlement (Marketplace Split)</p>
                    </div>
                </div>
                {hasBankDetails && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 text-xs font-semibold rounded-full border border-green-200 dark:border-green-800">
                        Linked (Acc: {school.subMerchantId})
                    </span>
                )}
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Name</label>
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="accountName"
                                required
                                defaultValue={parsedBankDetails?.accountName || ''}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                placeholder="School Trust Name"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Account Number</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="accountNumber"
                                required
                                defaultValue={parsedBankDetails?.accountNumber || ''}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                placeholder={hasBankDetails ? "••••••••" : "501004561234"}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">IFSC Code</label>
                        <div className="relative">
                            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="ifsc"
                                required
                                defaultValue={parsedBankDetails?.ifsc || ''}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                placeholder="HDFC0001234"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Platform Comm. (%)</label>
                        <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                name="commissionPercentage"
                                type="number"
                                step="0.1"
                                defaultValue={school.commissionPercentage || 2.5}
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-500/30"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {hasBankDetails ? 'Update Bank Details' : 'Create Linked Account'}
                    </button>
                </div>
            </form>
        </div>
    );
}
