'use client';

import React, { useState } from 'react';
import { Building, CreditCard, Landmark, Percent, Link2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { registerSchoolBankAccount } from '@/lib/actions/bank-actions';

interface BankRegistrationFormProps {
    schoolId: string;
    school: any;
}

export default function BankRegistrationForm({ schoolId, school }: BankRegistrationFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const hasRealLinkedAccount = !!school.subMerchantId && school.subMerchantId.startsWith('acc_');
    const hasMockAccount = !!school.subMerchantId && school.subMerchantId.startsWith('mock_');

    let parsedBankDetails: any = null;
    if (school.bankDetails) {
        try { parsedBankDetails = JSON.parse(school.bankDetails); } catch (e) { }
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
                setSuccess(res.message || 'Saved successfully!');
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
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg">
                        <Landmark className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Razorpay Bank Setup</h2>
                        <p className="text-sm text-slate-500">Link school bank account for automatic fee settlements</p>
                    </div>
                </div>

                {/* Status Badge */}
                {hasRealLinkedAccount && (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 text-xs font-semibold rounded-full border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Linked: {school.subMerchantId}
                    </span>
                )}
                {hasMockAccount && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Not Linked (add Razorpay acc_ ID below)
                    </span>
                )}
                {!school.subMerchantId && (
                    <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full border border-slate-200">
                        Not Configured
                    </span>
                )}
            </div>

            {/* Step Guide */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 mb-5">
                <p className="text-xs font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider mb-2">How to get the Razorpay Linked Account ID</p>
                <ol className="text-xs text-indigo-800 dark:text-indigo-200 space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://dashboard.razorpay.com/app/route/accounts" target="_blank" rel="noopener noreferrer" className="font-bold underline inline-flex items-center gap-0.5">Razorpay → Route → Accounts <ExternalLink className="w-3 h-3" /></a></li>
                    <li>Click <strong>Add Account</strong> → fill school name & email → click <strong>Add</strong></li>
                    <li>Copy the generated ID (format: <code className="bg-indigo-100 px-1 rounded">acc_XXXXXXXXXXXXXXXXX</code>)</li>
                    <li>Paste it in the field below and save</li>
                </ol>
            </div>

            {error && (
                <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {error}
                </div>
            )}
            {success && (
                <div className="p-3 mb-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Razorpay Linked Account ID — Most Important */}
                <div className="bg-slate-900 rounded-xl p-4">
                    <label className="block text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                        Razorpay Linked Account ID <span className="text-amber-400">*</span>
                    </label>
                    <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            name="razorpayLinkedAccountId"
                            defaultValue={hasRealLinkedAccount ? school.subMerchantId : ''}
                            className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-white font-mono placeholder:text-slate-500"
                            placeholder="acc_XXXXXXXXXXXXXXXXX"
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                        Paste the Account ID from Razorpay Route dashboard. Leave blank to only save bank details.
                    </p>
                </div>

                {/* Bank Details */}
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
                                defaultValue={''}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                                placeholder={parsedBankDetails?.accountNumber ? `Saved: ${parsedBankDetails.accountNumber}` : "501004561234"}
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
                                min="0"
                                max="100"
                                defaultValue={school.commissionPercentage || 2.5}
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-emerald-500/30"
                    >
                        {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                        {hasRealLinkedAccount ? 'Update Bank Settings' : 'Save Bank Details'}
                    </button>
                </div>
            </form>
        </div>
    );
}
