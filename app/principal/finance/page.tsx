import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getPrincipalDashboard } from '@/lib/finance-phase2-actions';
import { TrendingUp, TrendingDown, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default async function PrincipalFinanceDashboard() {
    const session = await auth();

    if (!session?.user || (session.user.role !== 'PRINCIPAL' && session.user.role !== 'ADMIN')) {
        redirect('/');
    }

    const dashboard = await getPrincipalDashboard();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Overview - Principal Dashboard</h1>
                    <p className="text-slate-500 mt-1">Comprehensive financial summary and approvals</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                        <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
                        <p className="text-sm opacity-90">Total Income</p>
                        <p className="text-3xl font-bold mt-1">₹{dashboard.totalIncome.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-2">This Month</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                        <TrendingDown className="w-8 h-8 opacity-80 mb-2" />
                        <p className="text-sm opacity-90">Total Expenses</p>
                        <p className="text-3xl font-bold mt-1">₹{dashboard.totalExpenses.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-2">This Month</p>
                    </div>

                    <div className={`bg-gradient-to-br ${dashboard.netProfit >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg`}>
                        <DollarSign className="w-8 h-8 opacity-80 mb-2" />
                        <p className="text-sm opacity-90">Net Profit/Loss</p>
                        <p className="text-3xl font-bold mt-1">₹{dashboard.netProfit.toLocaleString()}</p>
                        <p className="text-xs opacity-75 mt-2">{dashboard.netProfit >= 0 ? 'Profit' : 'Loss'}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                        <Users className="w-8 h-8 opacity-80 mb-2" />
                        <p className="text-sm opacity-90">School Size</p>
                        <p className="text-3xl font-bold mt-1">{dashboard.totalStudents + dashboard.totalTeachers}</p>
                        <p className="text-xs opacity-75 mt-2">{dashboard.totalStudents} Students, {dashboard.totalTeachers} Teachers</p>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Link href="/admin/finance/expenses" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                Pending Expense Approvals
                            </h2>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                                {dashboard.pendingExpenses}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm">Click to review and approve pending expenses</p>
                    </Link>

                    <Link href="/admin/finance/salary" className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-yellow-600" />
                                Pending Salary Payments
                            </h2>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-bold">
                                {dashboard.pendingSalaries}
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm">Click to process pending salary payments</p>
                    </Link>
                </div>

                {/* Fee Collection Stats */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Fee Collection Status
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-sm text-slate-500 mb-2">Total Fees</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{dashboard.totalFees.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-2">Collected</p>
                            <p className="text-2xl font-bold text-green-600">₹{dashboard.collectedFees.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 mb-2">Collection Rate</p>
                            <div className="flex items-center gap-3">
                                <p className="text-2xl font-bold text-indigo-600">{dashboard.feeCollectionPercent.toFixed(1)}%</p>
                                <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                    <div
                                        className="bg-indigo-600 h-3 rounded-full transition-all"
                                        style={{ width: `${Math.min(dashboard.feeCollectionPercent, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/admin/finance/reports" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-center">
                        <div className="text-indigo-600 mb-2">📊</div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Financial Reports</h3>
                        <p className="text-sm text-slate-500 mt-1">View detailed reports</p>
                    </Link>

                    <Link href="/admin/finance/expenses" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-center">
                        <div className="text-red-600 mb-2">💳</div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Manage Expenses</h3>
                        <p className="text-sm text-slate-500 mt-1">Review & approve expenses</p>
                    </Link>

                    <Link href="/admin/finance/salary" className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow text-center">
                        <div className="text-green-600 mb-2">💰</div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Salary Management</h3>
                        <p className="text-sm text-slate-500 mt-1">Process salaries</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
