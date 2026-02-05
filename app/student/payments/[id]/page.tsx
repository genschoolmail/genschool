import React from 'react';
import { prisma } from '@/lib/prisma';
import { CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function StudentPaymentsPage({ params }: { params: { id: string } }) {
    const student = await prisma.student.findUnique({
        where: { id: params.id },
        include: {
            user: true,
            class: true
        }
    });

    if (!student) {
        return <div>Student not found</div>;
    }

    const pendingFees = await prisma.studentFee.findMany({
        where: {
            studentId: params.id,
            status: { in: ['PENDING', 'PARTIAL'] }
        },
        include: {
            feeStructure: true
        }
    });

    const payments = await prisma.feePayment.findMany({
        where: {
            studentFee: {
                studentId: params.id
            }
        },
        orderBy: { date: 'desc' },
        take: 10,
        include: {
            studentFee: {
                include: {
                    feeStructure: true
                }
            }
        }
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SUCCESS': return 'text-green-600';
            case 'PENDING': return 'text-yellow-600';
            case 'FAILED': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'SUCCESS': return <CheckCircle className="w-5 h-5" />;
            case 'PENDING': return <Clock className="w-5 h-5" />;
            case 'FAILED': return <XCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Payment Portal</h1>
                <p className="text-slate-500">Student: {student.user.name} - {student.class?.name}</p>
            </div>

            {/* Pending Fees */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Pending Fees</h2>
                {pendingFees.length === 0 ? (
                    <p className="text-slate-500 text-center py-8">No pending fees! All paid up! 🎉</p>
                ) : (
                    <div className="space-y-3">
                        {pendingFees.map(fee => {
                            const outstanding = fee.amount - (fee.paidAmount || 0) - fee.discount;
                            return (
                                <div key={fee.id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{fee.feeStructure.name}</p>
                                        <p className="text-sm text-slate-500">
                                            Due: {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-bold text-slate-800 dark:text-white">₹{outstanding.toLocaleString()}</p>
                                        <button className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                                            Pay Now (Mock)
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Payment History</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Date</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Transaction ID</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Amount</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Method</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                                        No payment history available
                                    </td>
                                </tr>
                            ) : (
                                payments.map(payment => (
                                    <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(payment.date).toLocaleDateString('en-IN')}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-mono text-slate-600 dark:text-slate-400">
                                            {payment.reference}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-white">
                                            ₹{payment.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {payment.method}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`flex items-center gap-2 ${getStatusColor(payment.status)}`}>
                                                {getStatusIcon(payment.status)}
                                                <span className="text-sm font-medium">{payment.status}</span>
                                            </div>
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
