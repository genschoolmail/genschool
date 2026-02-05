import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { FileText, AlertCircle, CheckCircle2, Clock, Tag } from 'lucide-react';
import Link from 'next/link';

export default async function StudentFeesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div>Please log in</div>;
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            class: true,
            studentFees: {
                include: {
                    feeStructure: true,
                    discounts: true
                },
                orderBy: { dueDate: 'asc' }
            },
            wallet: true
        }
    });

    if (!student) {
        return <div>Student record not found</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-100 text-green-800';
            case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
            case 'PENDING': return 'bg-orange-100 text-orange-800';
            case 'OVERDUE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PAID': return <CheckCircle2 className="w-5 h-5" />;
            case 'OVERDUE': return <AlertCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Fees</h1>
                    <p className="text-slate-500">{student.user.name} - {student.class?.name}</p>
                </div>
                <Link href="/student/finance" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100">
                    Back to Finance
                </Link>
            </div>

            {/* Fee Breakdown Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Fee Breakdown</h2>
                    <p className="text-sm text-slate-500">Academic Year 2024-25</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Fee Type</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Total Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Discount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Payable</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Due Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {student.studentFees.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No fee records found
                                    </td>
                                </tr>
                            ) : (
                                student.studentFees.map(fee => {
                                    const payableAmount = fee.amount - fee.discount;
                                    const isOverdue = new Date() > fee.dueDate && fee.status !== 'PAID';

                                    return (
                                        <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white">
                                                        {fee.feeStructure.name}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {fee.feeStructure.frequency}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                ₹{fee.amount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {fee.discount > 0 ? (
                                                    <div className="flex items-center gap-1">
                                                        <Tag className="w-4 h-4 text-green-600" />
                                                        <span className="text-sm font-semibold text-green-600">
                                                            ₹{fee.discount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                                                ₹{payableAmount.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {fee.dueDate.toLocaleDateString('en-IN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(isOverdue ? 'OVERDUE' : fee.status)}`}>
                                                        {isOverdue ? 'OVERDUE' : fee.status}
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Applied Discounts */}
            {student.studentFees.some(fee => fee.discounts.length > 0) && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                    <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                        <Tag className="w-5 h-5" />
                        Applied Discounts & Waivers
                    </h3>
                    <div className="space-y-2">
                        {student.studentFees.map(fee =>
                            fee.discounts.map(discount => (
                                <div key={discount.id} className="bg-white dark:bg-slate-800 rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">
                                                {fee.feeStructure.name}
                                            </p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Reason: {discount.reason}
                                            </p>
                                        </div>
                                        <p className="text-lg font-bold text-green-600">
                                            -₹{discount.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
                <h3 className="text-lg font-semibold mb-4">Fee Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm opacity-90">Total Original Amount</p>
                        <p className="text-2xl font-bold">
                            ₹{student.studentFees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm opacity-90">Total Discounts</p>
                        <p className="text-2xl font-bold">
                            -₹{student.studentFees.reduce((sum, fee) => sum + fee.discount, 0).toLocaleString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm opacity-90">Net Payable</p>
                        <p className="text-2xl font-bold">
                            ₹{student.studentFees.reduce((sum, fee) => sum + (fee.amount - fee.discount), 0).toLocaleString()}
                        </p>
                    </div>
                    {student.wallet && student.wallet.balance > 0 && (
                        <div className="md:col-span-3 mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                            <div>
                                <p className="text-sm opacity-90">Advance Balance (Wallet)</p>
                                <p className="text-2xl font-bold">₹{student.wallet.balance.toLocaleString()}</p>
                            </div>
                            <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                                Available for future payments
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <Link href="/student/finance/payments" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl p-4 text-center transition-colors font-semibold">
                    Pay Fees Now
                </Link>
                <Link href="/student/finance/receipts" className="flex-1 bg-slate-600 hover:bg-slate-700 text-white rounded-xl p-4 text-center transition-colors font-semibold">
                    View Receipts
                </Link>
            </div>
        </div>
    );
}
