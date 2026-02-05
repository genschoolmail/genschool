import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getAccountantDashboard } from '@/lib/finance-phase2-actions';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AccountantDashboard() {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRINCIPAL')) {
        redirect('/');
    }

    const dashboard = await getAccountantDashboard();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Accountant Operations Dashboard</h1>
                    <p className="text-slate-500 mt-1">Today's transactions and pending tasks</p>
                </div>

                {/* Today's Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <DollarSign className="w-8 h-8 opacity-80 mb-2" />
                        <p className="text-sm opacity-90">Today's Collections</p>
                        <p className="text-3xl font-bold mt-1">₹{dashboard.todayCollections.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-2">{dashboard.todayPaymentsCount} payments</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                        <TrendingDown className="w-8 h-8 opacity-80 mb-2" />
                        <p className="text-sm opacity-90">Today's Expenses</p>
                        <p className="text-3xl font-bold mt-1">₹{dashboard.todayExpenses.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-2">{dashboard.todayExpensesCount} expenses</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
                        <Clock className="w-8 h-8 opacity-80 mb-2" />
                        <p className="text-sm opacity-90">Pending Expenses</p>
                        <p className="text-3xl font-bold mt-1">{dashboard.pendingExpenses.length}</p>
                        <p className="text-xs opacity-75 mt-2">Awaiting approval</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                        <AlertCircle className="w-8 h-8 opacity-80 mb-2" />
                        <p className="text-sm opacity-90">Overdue Fees</p>
                        <p className="text-3xl font-bold mt-1">{dashboard.overdueFees}</p>
                        <p className="text-xs opacity-75 mt-2">Students with overdue</p>
                    </div>
                </div>

                {/* Pending Tasks Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Expenses */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                Pending Expense Approvals
                            </h2>
                            <Link href="/admin/finance/expenses" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {dashboard.pendingExpenses.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-4">No pending expenses</p>
                            ) : (
                                dashboard.pendingExpenses.slice(0, 5).map(expense => (
                                    <div key={expense.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white text-sm">{expense.description}</p>
                                            <p className="text-xs text-slate-500">{expense.category}</p>
                                        </div>
                                        <p className="font-bold text-red-600">₹{expense.amount.toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Pending Salaries */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <Clock className="w-5 h-5 text-yellow-600" />
                                Pending Salary Payments
                            </h2>
                            <Link href="/admin/finance/salary" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                View All →
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {dashboard.pendingSalaries.length === 0 ? (
                                <p className="text-slate-500 text-sm text-center py-4">No pending salaries</p>
                            ) : (
                                dashboard.pendingSalaries.slice(0, 5).map(salary => (
                                    <div key={salary.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white text-sm">{salary.teacher?.user?.name || salary.driver?.user?.name || 'Unknown Staff'}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(salary.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <p className="font-bold text-green-600">₹{salary.netSalary.toLocaleString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link href="/admin/finance/fees" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-center">
                        <div className="text-green-600 mb-2">💳</div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Collect Fees</h3>
                        <p className="text-sm text-slate-500 mt-1">Record fee payments</p>
                    </Link>

                    <Link href="/admin/finance/expenses/new" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-center">
                        <div className="text-red-600 mb-2">📝</div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Add Expense</h3>
                        <p className="text-sm text-slate-500 mt-1">Record new expense</p>
                    </Link>

                    <Link href="/admin/finance/income/new" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-center">
                        <div className="text-blue-600 mb-2">💰</div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Add Income</h3>
                        <p className="text-sm text-slate-500 mt-1">Record other income</p>
                    </Link>

                    <Link href="/admin/finance/reports" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-center">
                        <div className="text-indigo-600 mb-2">📊</div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">View Reports</h3>
                        <p className="text-sm text-slate-500 mt-1">Generate reports</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
