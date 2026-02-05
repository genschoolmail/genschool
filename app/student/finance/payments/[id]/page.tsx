import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { CreditCard, Calendar, IndianRupee, FileText } from 'lucide-react';
import Link from 'next/link';
import PaymentGateway from './PaymentGateway';

export default async function FeePaymentPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    const resolvedParams = params instanceof Promise ? await params : params;
    const { id } = resolvedParams;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            class: true,
            wallet: true
        }
    });

    if (!student) {
        redirect('/student/finance');
    }

    const fee = await prisma.studentFee.findUnique({
        where: { id: id },
        include: {
            feeStructure: true,
            discounts: true
        }
    });

    if (!fee || fee.studentId !== student.id) {
        redirect('/student/finance/payments');
    }

    const payableAmount = fee.amount - fee.paidAmount - fee.discount;
    const isOverdue = new Date() > fee.dueDate;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Make Payment</h1>
                    <p className="text-slate-500">Complete your fee payment securely</p>
                </div>
                <Link href="/student/finance/payments" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100">
                    Back to Payments
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Fee Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Fee Information Card */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="w-5 h-5" />
                                <span className="text-sm font-medium">Fee Details</span>
                            </div>
                            <h2 className="text-2xl font-bold">{fee.feeStructure.name}</h2>
                            <p className="text-sm opacity-90 mt-1">{fee.feeStructure.frequency}</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 dark:text-slate-400">Original Amount</span>
                                <span className="font-semibold text-slate-800 dark:text-white">₹{fee.amount.toLocaleString()}</span>
                            </div>

                            {fee.paidAmount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Already Paid</span>
                                    <span className="font-semibold text-green-600">-₹{fee.paidAmount.toLocaleString()}</span>
                                </div>
                            )}

                            {fee.discount > 0 && (
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600 dark:text-slate-400">Discount Applied</span>
                                    <span className="font-semibold text-green-600">-₹{fee.discount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-slate-800 dark:text-white">Amount to Pay</span>
                                    <span className="text-2xl font-bold text-indigo-600">₹{payableAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <Calendar className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                    Due Date: {fee.dueDate.toLocaleDateString('en-IN')}
                                    {isOverdue && <span className="text-red-600 font-semibold ml-2">(Overdue)</span>}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Applied Discounts */}
                    {fee.discounts.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
                            <h3 className="font-semibold text-green-900 dark:text-green-100 mb-3">Applied Discounts</h3>
                            <div className="space-y-2">
                                {fee.discounts.map(discount => (
                                    <div key={discount.id} className="flex justify-between items-center">
                                        <span className="text-sm text-green-800 dark:text-green-200">{discount.reason}</span>
                                        <span className="font-semibold text-green-600">-₹{discount.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Payment Gateway */}
                <div className="lg:col-span-1">
                    <PaymentGateway
                        feeId={fee.id}
                        studentId={student.id}
                        amount={payableAmount}
                        walletBalance={student.wallet?.balance || 0}
                        userId={session.user.id}
                    />
                </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Mock Payment Gateway</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            This is a demonstration payment system. No real transactions will be processed.
                            In production, integrate with actual payment gateway like Razorpay or PayU.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
