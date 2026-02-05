import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { getIncome } from '@/lib/finance-actions';
import ExportButton from '@/components/common/ExportButton';

export default async function IncomePage() {
    const incomeRecords = await getIncome();

    const sources = {
        FEE: 'Fee Collection',
        LIBRARY_FINE: 'Library Fine',
        DONATION: 'Donation',
        EVENT: 'Event',
        TRANSPORT: 'Transport',
        OTHER: 'Other'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Income Management</h2>
                <div className="flex gap-2">
                    <ExportButton type="INCOME" />
                    <Link
                        href="/admin/finance/income/new"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Income
                    </Link>
                </div>
                <form action={async () => {
                    'use server';
                    // We need to import dynamically or use the imported one.
                    // But importing 'backfillIncomeFromPayments' which is in same file as 'getIncome'?
                    // Yes, it was exported.
                    const { backfillIncomeFromPayments } = await import('@/lib/finance-actions');
                    await backfillIncomeFromPayments();
                }}>
                    <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm">
                        Fix Missing Data
                    </button>
                </form>
            </div>

            {/* Income List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Source</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Description</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Reference</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incomeRecords.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-500">
                                    No income records found.
                                </td>
                            </tr>
                        ) : (
                            incomeRecords.map((income) => (
                                <tr key={income.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="p-4 text-slate-700 dark:text-slate-300">
                                        {new Date(income.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium">
                                            {sources[income.source as keyof typeof sources]}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-slate-800 dark:text-white">{income.description}</p>
                                        {income.remarks && (
                                            <p className="text-xs text-slate-500 mt-1">{income.remarks}</p>
                                        )}
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                        {income.reference || '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-green-600">₹{income.amount.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">Total Income</p>
                    <p className="text-3xl font-bold text-green-800 dark:text-green-300 mt-2">
                        ₹{incomeRecords.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-6">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Records</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                        {incomeRecords.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
