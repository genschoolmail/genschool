import React from 'react';
import Link from 'next/link';
import { Plus, DollarSign, Users, CreditCard, Receipt, BarChart3, ArrowRight, Calendar, Wallet } from 'lucide-react';
import { getFeeStructures, deleteFeeStructure } from '@/lib/fee-master-actions';
import BackButton from '@/components/ui/BackButton';

export default async function FeesPage() {
    const feeStructures = await getFeeStructures();

    const totalFeeAmount = feeStructures.reduce((sum, fee) => sum + fee.amount, 0);

    const quickActions = [
        {
            icon: Wallet,
            title: 'Collect Fees',
            description: 'Record student payments',
            href: '/admin/finance/fees/collect',
            color: 'from-green-500 to-emerald-600',
            iconBg: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-400'
        },
        {
            icon: Users,
            title: 'Assign Fees',
            description: 'Assign fee to students',
            href: '/admin/finance/fees/assign',
            color: 'from-blue-500 to-indigo-600',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            icon: Receipt,
            title: 'Fee History',
            description: 'View all transactions',
            href: '/admin/finance/fees/history',
            color: 'from-purple-500 to-purple-600',
            iconBg: 'bg-purple-100 dark:bg-purple-900/30',
            iconColor: 'text-purple-600 dark:text-purple-400'
        },
        {
            icon: BarChart3,
            title: 'Fee Reports',
            description: 'Analytics & insights',
            href: '/admin/finance/fees/reports',
            color: 'from-orange-500 to-orange-600',
            iconBg: 'bg-orange-100 dark:bg-orange-900/30',
            iconColor: 'text-orange-600 dark:text-orange-400'
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <BackButton href="/admin/finance" />
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <DollarSign className="w-7 h-7 md:w-8 md:h-8 text-green-600" />
                            Fee Management
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Manage fee structures and student payments
                        </p>
                    </div>
                </div>
                <Link
                    href="/admin/finance/fees/new"
                    className="flex items-center px-4 md:px-6 py-2 md:py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all touch-target font-medium"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    New Fee Structure
                </Link>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                    <Link
                        key={action.href}
                        href={action.href}
                        className="group bg-white dark:bg-slate-800 p-5 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 hover:shadow-medium hover:-translate-y-1 transition-all gpu-accelerated"
                    >
                        <div className={`inline-flex p-3 rounded-lg ${action.iconBg} mb-3`}>
                            <action.icon className={`w-6 h-6 ${action.iconColor}`} />
                        </div>
                        <h3 className="font-semibold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {action.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {action.description}
                        </p>
                        <ArrowRight className="w-4 h-4 text-slate-400 mt-2 group-hover:translate-x-1 group-hover:text-indigo-600 transition-all" />
                    </Link>
                ))}
            </div>

            {/* Stats Banner */}
            {feeStructures.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <p className="text-sm opacity-90 mb-1">Total Fee Structures</p>
                            <p className="text-3xl md:text-4xl font-bold">{feeStructures.length}</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-90 mb-1">Combined Fee Amount</p>
                            <p className="text-3xl md:text-4xl font-bold">₹{totalFeeAmount.toLocaleString()}</p>
                        </div>
                        <Link
                            href="/admin/finance/fees/assign"
                            className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Assign Fees →
                        </Link>
                    </div>
                </div>
            )}

            {/* Fee Structures Grid */}
            <div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Fee Structures</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {feeStructures.length === 0 ? (
                        <div className="col-span-full">
                            <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <DollarSign className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Fee Structures Yet</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first fee structure to get started.</p>
                                <Link
                                    href="/admin/finance/fees/new"
                                    className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                                >
                                    <Plus className="w-5 h-5 mr-2" />
                                    Create Fee Structure
                                </Link>
                            </div>
                        </div>
                    ) : (
                        feeStructures.map((fee) => (
                            <div key={fee.id} className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700 hover:shadow-medium hover:-translate-y-1 transition-all gpu-accelerated">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl group-hover:scale-110 transition-transform">
                                        <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    {fee.class && (
                                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-xs font-bold">
                                            Class {fee.class?.name}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{fee.name}</h3>
                                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                                    ₹{fee.amount.toLocaleString()}
                                </p>

                                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                                    <CreditCard className="w-4 h-4" />
                                    <span>{(fee as any).frequency || 'Annual'}</span>
                                </div>

                                {fee.feeHead?.description && (
                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 line-clamp-2">
                                        {fee.feeHead.description}
                                    </p>
                                )}

                                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <Link
                                        href={`/admin/finance/fees/assign?feeStructureId=${fee.id}`}
                                        className="flex-1 text-center px-3 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-lg hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium"
                                    >
                                        Assign
                                    </Link>
                                    <form action={async () => {
                                        'use server';
                                        await deleteFeeStructure(fee.id);
                                    }} className="flex-1">
                                        <button
                                            type="submit"
                                            className="w-full px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Related Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href="/admin/finance/fees/collect"
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <Wallet className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Collect Student Payments</span>
                    </Link>
                    <Link
                        href="/admin/students"
                        className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <Users className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View All Students</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
