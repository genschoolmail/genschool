import React from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Receipt } from 'lucide-react';
import { getFinancialSummary, getExpenses, getIncome, getSalaries } from '@/lib/finance-actions';
import { PrintButton } from './FinanceReportClient';

export default async function FinancialReportsPage() {
    const summary = await getFinancialSummary();
    const currentMonth = new Date();

    // Get current month data
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const expenses = await getExpenses(startDate, endDate);
    const income = await getIncome(startDate, endDate);
    const salaries = await getSalaries(undefined, startDate.toISOString());

    // Category-wise expense breakdown
    const expenseByCategory = expenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
    }, {} as Record<string, number>);

    // Source-wise income breakdown
    const incomeBySource = income.reduce((acc, inc) => {
        acc[inc.source] = (acc[inc.source] || 0) + inc.amount;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Reports</h2>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {currentMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>

            {/* Quick Report Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/finance/reports/defaulters" className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center gap-3">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                    <div>
                        <p className="font-semibold text-red-800 dark:text-red-200">Fee Defaulters Report</p>
                        <p className="text-sm text-red-600 dark:text-red-300">View students with overdue fees</p>
                    </div>
                </Link>
                <Link href="/admin/finance/reports/collection" className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors flex items-center gap-3">
                    <Receipt className="w-6 h-6 text-green-600" />
                    <div>
                        <p className="font-semibold text-green-800 dark:text-green-200">Daily Collection Report</p>
                        <p className="text-sm text-green-600 dark:text-green-300">View fee payments by date</p>
                    </div>
                </Link>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Total Income</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        ₹{summary.totalIncome.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Total Expenses</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        ₹{summary.totalExpenses.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className={`w-8 h-8 ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Net Profit/Loss</p>
                    <p className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{summary.netProfit.toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                            <span className="text-indigo-600 dark:text-indigo-400 font-bold">%</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 mb-1">Profit Margin</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">
                        {summary.totalIncome > 0 ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1) : 0}%
                    </p>
                </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Income Breakdown</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-slate-600 dark:text-slate-400">Fee Collection</span>
                            <span className="font-semibold text-green-600">₹{summary.feeCollected.toLocaleString()}</span>
                        </div>
                        {Object.entries(incomeBySource).map(([source, amount]) => (
                            <div key={source} className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {source.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="font-semibold text-green-600">₹{amount.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-semibold text-slate-800 dark:text-white">Total Income</span>
                            <span className="font-bold text-green-600 text-lg">₹{summary.totalIncome.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Expense Breakdown</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-slate-600 dark:text-slate-400">Salaries Paid</span>
                            <span className="font-semibold text-red-600">₹{summary.salariesPaid.toLocaleString()}</span>
                        </div>
                        {Object.entries(expenseByCategory).map(([category, amount]) => (
                            <div key={category} className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {category.toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                </span>
                                <span className="font-semibold text-red-600">₹{amount.toLocaleString()}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-semibold text-slate-800 dark:text-white">Total Expenses</span>
                            <span className="font-bold text-red-600 text-lg">₹{summary.totalExpenses.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Pending Salaries</h3>
                    <p className="text-3xl font-bold text-yellow-600">
                        {salaries.filter(s => s.status === 'PENDING').length}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        ₹{salaries.filter(s => s.status === 'PENDING').reduce((sum, s) => sum + s.netSalary, 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Approved Expenses</h3>
                    <p className="text-3xl font-bold text-green-600">
                        {expenses.filter(e => e.status === 'APPROVED').length}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        ₹{expenses.filter(e => e.status === 'APPROVED').reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Income Records</h3>
                    <p className="text-3xl font-bold text-blue-600">
                        {income.length}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                        This Month
                    </p>
                </div>
            </div>

            {/* Print Section */}
            <div className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white">Export Financial Report</h3>
                        <p className="text-sm text-slate-500">Generate comprehensive financial statement</p>
                    </div>
                    <PrintButton />
                </div>
            </div>
        </div>
    );
}
