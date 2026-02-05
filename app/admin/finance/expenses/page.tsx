import React from 'react';
import Link from 'next/link';
import { Plus, Check, X, Clock } from 'lucide-react';
import { getExpenses, approveExpense } from '@/lib/finance-actions';
import { auth } from '@/auth';
import ExportButton from '@/components/common/ExportButton';

export default async function ExpensesPage() {
    const expenses = await getExpenses();
    const session = await auth();

    const categories = {
        UTILITY: 'Utilities',
        STATIONERY: 'Stationery',
        SALARY: 'Salary',
        MAINTENANCE: 'Maintenance',
        TRANSPORT: 'Transport',
        OTHER: 'Other'
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Expense Tracking</h2>
                <div className="flex gap-2">
                    <ExportButton type="EXPENSE" />
                    <Link
                        href="/admin/finance/expenses/new"
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4" />
                        Add Expense
                    </Link>
                </div>
            </div>

            {/* Expense List - Desktop */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Category</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Description</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expenses.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-slate-500">
                                    No expenses recorded.
                                </td>
                            </tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="p-4 text-slate-700 dark:text-slate-300">
                                        {new Date(expense.date).toLocaleDateString('en-IN')}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">
                                            {categories[expense.category as keyof typeof categories] || expense.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-slate-800 dark:text-white">{expense.description}</p>
                                        {expense.remarks && (
                                            <p className="text-xs text-slate-500 mt-1">{expense.remarks}</p>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-red-600">₹{expense.amount.toLocaleString()}</span>
                                    </td>
                                    <td className="p-4">
                                        {expense.status === 'APPROVED' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                <Check className="w-3 h-3" />
                                                Approved
                                            </span>
                                        ) : expense.status === 'REJECTED' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                                <X className="w-3 h-3" />
                                                Rejected
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                <Clock className="w-3 h-3" />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        {expense.salaryId && (
                                            <Link
                                                href={`/admin/finance/salary/receipt/${expense.salaryId}`}
                                                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                            >
                                                Download Slip
                                            </Link>
                                        )}
                                        {expense.status === 'PENDING' && session?.user?.id && (
                                            <form action={async () => {
                                                'use server';
                                                await approveExpense(expense.id, session.user.id);
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                                                >
                                                    Approve
                                                </button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Expense List - Mobile */}
            <div className="md:hidden space-y-4">
                {expenses.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200">
                        No expenses recorded.
                    </div>
                ) : (
                    expenses.map((expense) => (
                        <div key={expense.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium text-slate-600 dark:text-slate-300 mb-2 inline-block">
                                        {categories[expense.category as keyof typeof categories] || expense.category}
                                    </span>
                                    <h3 className="font-medium text-slate-900 dark:text-white mt-1">{expense.description}</h3>
                                    <p className="text-xs text-slate-500 mt-1">{new Date(expense.date).toLocaleDateString('en-IN')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-red-600 text-lg">₹{expense.amount.toLocaleString()}</p>
                                    {expense.status === 'APPROVED' ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full mt-1">
                                            <Check className="w-3 h-3" /> Approved
                                        </span>
                                    ) : expense.status === 'REJECTED' ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded-full mt-1">
                                            <X className="w-3 h-3" /> Rejected
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded-full mt-1">
                                            <Clock className="w-3 h-3" /> Pending
                                        </span>
                                    )}
                                </div>
                            </div>

                            {expense.remarks && (
                                <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-700/30 p-2 rounded mb-3">
                                    {expense.remarks}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                                {expense.salaryId && (
                                    <Link
                                        href={`/admin/finance/salary/receipt/${expense.salaryId}`}
                                        className="text-sm text-indigo-600 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg"
                                    >
                                        Download Slip
                                    </Link>
                                )}
                                {expense.status === 'PENDING' && session?.user?.id && (
                                    <form action={async () => {
                                        'use server';
                                        await approveExpense(expense.id, session.user.id);
                                    }}>
                                        <button
                                            type="submit"
                                            className="text-sm text-white bg-green-600 hover:bg-green-700 px-4 py-1.5 rounded-lg font-medium"
                                        >
                                            Approve
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 font-medium">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mt-1">
                        {expenses.filter(e => e.status === 'PENDING').length}
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">Approved</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-300 mt-1">
                        ₹{expenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Total Expenses</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                        {expenses.length}
                    </p>
                </div>
            </div>
        </div>
    );
}
