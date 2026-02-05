import React from 'react';
import Link from 'next/link';
import {
    IndianRupee, TrendingUp, TrendingDown, DollarSign,
    Users, Receipt, Wallet, ArrowRight, CreditCard, Calendar,
    PieChart, BarChart3, TrendingDown as Expense, RefreshCw, Landmark
} from 'lucide-react';
import { getFinancialSummary } from '@/lib/finance-actions';

export default async function FinanceDashboard() {
    const summary = await getFinancialSummary();

    const quickLinks = [
        {
            title: 'Fee Management',
            description: 'Manage fee structures and assignments',
            icon: Receipt,
            href: '/admin/finance/fees',
            color: 'from-blue-500 to-blue-600',
            iconColor: 'text-blue-600'
        },
        {
            title: 'Assign Fees',
            description: 'Bulk assign fees to students',
            icon: Users,
            href: '/admin/finance/fees/assign',
            color: 'from-cyan-500 to-cyan-600',
            iconColor: 'text-cyan-600'
        },
        {
            title: 'Collect Fees',
            description: 'Record student fee payments',
            icon: Wallet,
            href: '/admin/finance/fees/collect',
            color: 'from-green-500 to-green-600',
            iconColor: 'text-green-600'
        },
        {
            title: 'Transactions',
            description: 'Verify payments & manage refunds',
            icon: RefreshCw,
            href: '/admin/finance/transactions',
            color: 'from-teal-500 to-teal-600',
            iconColor: 'text-teal-600'
        },
        {
            title: 'Salary Management',
            description: 'Manage teacher salaries',
            icon: CreditCard,
            href: '/admin/finance/salary',
            color: 'from-purple-500 to-purple-600',
            iconColor: 'text-purple-600'
        },
        {
            title: 'Expense Tracking',
            description: 'Record and approve expenses',
            icon: Expense,
            href: '/admin/finance/expenses',
            color: 'from-red-500 to-red-600',
            iconColor: 'text-red-600'
        },
        {
            title: 'Vendor Management',
            description: 'Manage suppliers and payables',
            icon: Users,
            href: '/admin/finance/vendors',
            color: 'from-amber-500 to-amber-600',
            iconColor: 'text-amber-600'
        },
        {
            title: 'Income Management',
            description: 'Record other income sources',
            icon: TrendingUp,
            href: '/admin/finance/income',
            color: 'from-emerald-500 to-emerald-600',
            iconColor: 'text-emerald-600'
        },
        {
            title: 'Financial Ledger',
            description: 'View financial overview',
            icon: PieChart,
            href: '/admin/finance/ledger',
            color: 'from-slate-600 to-slate-700',
            iconColor: 'text-slate-600'
        },
        {
            title: 'Fee Discounts',
            description: 'Manage student discounts',
            icon: Receipt,
            href: '/admin/finance/discounts',
            color: 'from-pink-500 to-pink-600',
            iconColor: 'text-pink-600'
        },
        {
            title: 'Fee Configuration',
            description: 'Setup fee heads and structures',
            icon: BarChart3,
            href: '/admin/finance/setup',
            color: 'from-indigo-500 to-indigo-600',
            iconColor: 'text-indigo-600'
        },
        {
            title: 'Refund Requests',
            description: 'Process refund requests',
            icon: Receipt,
            href: '/admin/finance/refunds',
            color: 'from-orange-500 to-orange-600',
            iconColor: 'text-orange-600'
        },

        {
            title: 'Settlement Reports',
            description: 'Track funds transferred to bank',
            icon: Landmark,
            href: '/admin/finance/settlements',
            color: 'from-emerald-500 to-emerald-600',
            iconColor: 'text-emerald-600'
        },
        {
            title: 'Debt Management',
            description: 'Track and collect overdue fees',
            icon: Users,
            href: '/admin/finance/debt',
            color: 'from-rose-500 to-rose-600',
            iconColor: 'text-rose-600'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-600" />
                        Finance Dashboard
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Complete financial overview and management
                    </p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Income</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{summary.totalIncome.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{summary.totalExpenses.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Net Balance</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{(summary.totalIncome - summary.totalExpenses).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions - Mobile Optimized Grid */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="group bg-white dark:bg-slate-800 p-5 md:p-6 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 hover:shadow-medium hover:-translate-y-1 transition-all gpu-accelerated"
                        >
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${link.color} shrink-0`}>
                                    <link.icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {link.title}
                                    </h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                                        {link.description}
                                    </p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all shrink-0" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-green-600" />
                        Income Breakdown
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Receipt className="w-5 h-5 text-green-600" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Fee Collection</span>
                            </div>
                            <span className="font-bold text-green-600">₹{summary.feeCollected.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="w-5 h-5 text-emerald-600" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Other Income</span>
                            </div>
                            <span className="font-bold text-emerald-600">₹{summary.otherIncome.toLocaleString()}</span>
                        </div>
                        <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 dark:text-white text-lg">Total Income</span>
                                <span className="font-bold text-green-600 text-2xl">₹{summary.totalIncome.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-red-600" />
                        Expense Breakdown
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Users className="w-5 h-5 text-red-600" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Salaries Paid</span>
                            </div>
                            <span className="font-bold text-red-600">₹{summary.salariesPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CreditCard className="w-5 h-5 text-orange-600" />
                                <span className="text-slate-700 dark:text-slate-300 font-medium">Other Expenses</span>
                            </div>
                            <span className="font-bold text-orange-600">₹{summary.otherExpenses.toLocaleString()}</span>
                        </div>
                        <div className="border-t-2 border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-slate-800 dark:text-white text-lg">Total Expenses</span>
                                <span className="font-bold text-red-600 text-2xl">₹{summary.totalExpenses.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
