import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { CreditCard, History, CheckCircle2, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function StudentPaymentsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div>Please log in</div>;
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            studentFees: {
                include: {
                    feeStructure: true,
                    payments: true
                }
            }
        }
    });

    if (!student) {
        return <div>Student record not found</div>;
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'PENDING': return <Clock className="w-5 h-5 text-yellow-600" />;
            case 'FAILED': return <XCircle className="w-5 h-5 text-red-600" />;
            default: return <Clock className="w-5 h-5 text-gray-600" />;
        }
    };

    // Filter pending fees
    const pendingFees = student.studentFees.filter(fee => ['PENDING', 'PARTIAL'].includes(fee.status));

    // Get all payments flattened
    const allPayments = student.studentFees
        .flatMap(fee => fee.payments)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Payments</h1>
                    <p className="text-slate-500">Make payments and view history</p>
                </div>
                <Link href="/student/finance" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100">
                    Back to Finance
                </Link>
            </div>

            {/* Pending Payments */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Pending Payments</h2>
                    </div>
                </div>
                <div className="p-6">
                    {pendingFees.length === 0 ? (
                        <div className="text-center py-8">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">All fees paid! 🎉</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {pendingFees.map(fee => {
                                const payableAmount = fee.amount - fee.discount - fee.paidAmount;
                                const isOverdue = new Date() > fee.dueDate;

                                return (
                                    <div key={fee.id} className={`p-4 border-2 rounded-xl ${isOverdue ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="font-semibold text-slate-800 dark:text-white">{fee.feeStructure.name}</h3>
                                                <p className="text-sm text-slate-500">
                                                    Due: {fee.dueDate.toLocaleDateString('en-IN')}
                                                    {isOverdue && <span className="text-red-600 font-semibold ml-2">(Overdue)</span>}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-indigo-600">₹{payableAmount.toLocaleString()}</p>
                                                {fee.discount > 0 && (
                                                    <p className="text-sm text-green-600">Discount: -₹{fee.discount.toLocaleString()}</p>
                                                )}
                                                {fee.paidAmount > 0 && (
                                                    <p className="text-sm text-blue-600">Paid: ₹{fee.paidAmount.toLocaleString()}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/student/finance/payments/${fee.id}`}
                                            className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg text-center transition-colors"
                                        >
                                            Pay Now (Mock)
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Payment History */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <History className="w-5 h-5 text-slate-600" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Payment History</h2>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Receipt No</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Method</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {allPayments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                                        No payment history yet
                                    </td>
                                </tr>
                            ) : (
                                allPayments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400" suppressHydrationWarning>
                                            {payment.date.toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                                            {payment.receiptNo || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                                            ₹{payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {payment.method}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(payment.status)}
                                                <span className="text-sm font-medium">{payment.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                href={`/student/finance/receipts/${payment.id}`}
                                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                            >
                                                View →
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
