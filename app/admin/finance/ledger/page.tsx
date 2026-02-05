import React from 'react';
import { prisma } from '@/lib/prisma';
import BackButton from '@/components/ui/BackButton';
import { ArrowUpCircle, ArrowDownCircle, Wallet, Download } from 'lucide-react';
import LedgerClientActions from '@/components/finance/LedgerClientActions';

// Type for Unified Transaction
type LedgerTransaction = {
    id: string;
    date: Date;
    description: string;
    category: string; // Source for Income, Category for Expense
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    reference?: string | null;
    mode?: string; // Method if available
    feePaymentId?: string | null; // For receipt linking
};

export default async function LedgerPage({
    searchParams
}: {
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
    }>
}) {
    const { startDate, endDate } = await searchParams;

    // Date Filters
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1); // Default to this month
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch Income
    const incomes = await prisma.income.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        },
        include: {
            feePayment: true // To get method if linked
        }
    });

    // Fetch Expenses
    const expenses = await prisma.expense.findMany({
        where: {
            date: {
                gte: start,
                lte: end
            }
        },
        include: {
            salary: true
        }
    });

    // Merge and Sort
    const transactions: LedgerTransaction[] = [
        ...incomes.map(i => ({
            id: i.id,
            date: i.date,
            description: i.description,
            category: i.source,
            type: 'CREDIT' as const,
            amount: i.amount,
            reference: i.reference,
            mode: i.feePayment?.method || 'N/A',
            feePaymentId: i.feePaymentId
        })),
        ...expenses.map(e => ({
            id: e.id,
            date: e.date,
            description: e.description,
            category: e.category,
            type: 'DEBIT' as const,
            amount: e.amount,
            reference: null,
            mode: 'N/A',
            feePaymentId: null
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Calculate Stats
    const totalCredit = transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalCredit - totalDebit;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                    <BackButton href="/admin/finance" />
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Wallet className="w-7 h-7 text-indigo-600" />
                            Financial Ledger
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Consolidated view of all Incomes and Expenses
                        </p>
                    </div>
                </div>
                <LedgerClientActions
                    transactions={transactions.map(t => ({
                        ...t,
                        date: t.date.toISOString(), // Convert Date to string for serialization
                    }))}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-soft border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowUpCircle className="w-8 h-8 text-green-500" />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{totalCredit.toLocaleString()}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-soft border border-red-100 dark:border-red-900/30">
                    <div className="flex items-center gap-3 mb-2">
                        <ArrowDownCircle className="w-8 h-8 text-red-500" />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expense</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{totalDebit.toLocaleString()}</p>
                </div>
                <div className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-soft border ${netBalance >= 0 ? 'border-indigo-100' : 'border-orange-100'}`}>
                    <div className="flex items-center gap-3 mb-2">
                        <Wallet className={`w-8 h-8 ${netBalance >= 0 ? 'text-indigo-500' : 'text-orange-500'}`} />
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Net Balance</span>
                    </div>
                    <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                        {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Filter Section (Simple Implementation) */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <form className="flex flex-col sm:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">Start Date</label>
                        <input
                            type="date"
                            name="startDate"
                            defaultValue={start.toISOString().slice(0, 10)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-medium text-slate-500 mb-1">End Date</label>
                        <input
                            type="date"
                            name="endDate"
                            defaultValue={end.toISOString().slice(0, 10)}
                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                        Filter
                    </button>
                </form>
            </div>

            {/* Ledger Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4 text-right">Credit (Income)</th>
                                <th className="px-6 py-4 text-right">Debit (Expense)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {transactions.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                        {t.date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-800 dark:text-white flex items-center gap-2">
                                            {t.description}
                                            {t.feePaymentId && (
                                                <a
                                                    href={`/admin/finance/fees/receipt/${t.feePaymentId}`}
                                                    target="_blank"
                                                    className="inline-flex items-center justify-center p-1 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                                                    title="View Receipt"
                                                >
                                                    <Download className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">{t.category} • {t.mode}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${t.type === 'CREDIT'
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-green-600 font-medium">
                                        {t.type === 'CREDIT' ? `₹${t.amount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-red-600 font-medium">
                                        {t.type === 'DEBIT' ? `₹${t.amount.toLocaleString()}` : '-'}
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                        No transactions found for the selected period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 dark:bg-slate-800 border-t-2 border-slate-200 dark:border-slate-700">
                            <tr>
                                <td colSpan={3} className="px-6 py-4 font-bold text-slate-800 dark:text-white text-right">Totals</td>
                                <td className="px-6 py-4 text-right font-bold text-green-600">₹{totalCredit.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right font-bold text-red-600">₹{totalDebit.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
}
