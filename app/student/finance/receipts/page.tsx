import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { Receipt, Download, Mail, Printer } from 'lucide-react';
import Link from 'next/link';

export default async function StudentReceiptsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div>Please log in</div>;
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            class: true
        }
    });

    if (!student) {
        return <div>Student record not found</div>;
    }

    // Fetch payments separately
    const payments = await prisma.feePayment.findMany({
        where: {
            studentFee: {
                studentId: student.id
            },
            status: 'SUCCESS'
        },
        orderBy: { date: 'desc' },
        include: {
            studentFee: {
                include: {
                    feeStructure: true
                }
            }
        }
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Payment Receipts</h1>
                    <p className="text-slate-500">Download and manage your receipts</p>
                </div>
                <Link href="/student/finance" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100">
                    Back to Finance
                </Link>
            </div>

            {/* Receipt Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {payments.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                        <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">No receipts available yet</p>
                        <p className="text-sm text-slate-400 mt-1">Receipts will appear here after successful payments</p>
                    </div>
                ) : (
                    payments.map(payment => (
                        <div key={payment.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-shadow">
                            {/* Receipt Header */}
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <Receipt className="w-5 h-5" />
                                    <span className="text-sm font-medium">Payment Receipt</span>
                                </div>
                                <p className="text-2xl font-bold">₹{payment.amount.toLocaleString()}</p>
                            </div>

                            {/* Receipt Details */}
                            <div className="p-4 space-y-3">
                                <div>
                                    <p className="text-xs text-slate-500">Receipt Number</p>
                                    <p className="font-mono text-sm font-semibold text-slate-800 dark:text-white">
                                        {payment.receiptNo || `REC-${payment.id.slice(0, 8).toUpperCase()}`}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Transaction ID</p>
                                    <p className="font-mono text-sm font-semibold text-slate-800 dark:text-white">
                                        {payment.reference}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Date</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                        {payment.date.toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Payment Method</p>
                                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                                        {payment.method}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500">Status</p>
                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 mt-1">
                                        {payment.status}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                <Link
                                    href={`/student/finance/receipts/${payment.id}`}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </Link>

                                <div className="grid grid-cols-2 gap-2">
                                    <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </button>
                                    <button className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors">
                                        <Printer className="w-4 h-4" />
                                        Print
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Info Box */}
            {payments.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Receipt Information</h3>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• All receipts are digitally signed and verified</li>
                        <li>• Download receipts as PDF for your records</li>
                        <li>• Email receipts to parents or for reimbursement</li>
                        <li>• Receipts are valid proof of payment</li>
                    </ul>
                </div>
            )}
        </div>
    );
}
