import React from 'react';
import { prisma } from '@/lib/prisma';
import BackButton from '@/components/ui/BackButton';
import DownloadReportButton from '@/components/ui/DownloadReportButton';
import {
    Calendar, DollarSign, User, FileText, Download,
    Filter, TrendingUp, CheckCircle, Clock, Search
} from 'lucide-react';
import Link from 'next/link';
import TransactionTable from '@/components/finance/TransactionTable';

export default async function FeeHistoryPage({
    searchParams
}: {
    searchParams: Promise<{
        studentId?: string;
        month?: string;
        year?: string;
        status?: string;
    }> | {
        studentId?: string;
        month?: string;
        year?: string;
        status?: string;
    }
}) {
    const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
    const { studentId, month, year, status } = resolvedParams;

    // Build where clause for feePayment
    const paymentWhere: any = {};

    if (studentId) {
        paymentWhere.studentFee = { studentId };
    }

    if (status && status !== 'ALL') {
        paymentWhere.status = status;
    } else {
        // Default: Show COMPLETED or SUCCESS for summary stats
        // But for list, maybe show all?
        // Let's say if 'ALL' is chosen, show everything except maybe internal PENDING
    }

    // Fetch all payments with related data
    const payments = await prisma.feePayment.findMany({
        where: paymentWhere,
        include: {
            studentFee: {
                include: {
                    student: {
                        include: {
                            user: true,
                            class: true
                        }
                    },
                    feeStructure: true
                }
            }
        },
        orderBy: { date: 'desc' },
        take: 100 // Limit to last 100 transactions
    });

    // Get all students for filter
    const students = await prisma.student.findMany({
        include: {
            user: true,
            class: true
        },
        orderBy: {
            user: {
                name: 'asc'
            }
        }
    });

    // Calculate stats - Only successful ones
    const successfulPayments = payments.filter(p => ['COMPLETED', 'SUCCESS', 'Paid'].includes(p.status));
    const totalAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = successfulPayments.length;
    const uniqueStudents = new Set(successfulPayments.map(p => p.studentFee?.studentId)).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                    <BackButton href="/admin/finance/fees" />
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <FileText className="w-7 h-7 text-purple-600" />
                            Fee Payment History
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Complete transaction history and payment records
                        </p>
                    </div>
                </div>
                <DownloadReportButton />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Total Collected</p>
                            <p className="text-2xl font-bold">₹{totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Total Transactions</p>
                            <p className="text-2xl font-bold">{totalTransactions}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm opacity-90">Students Paid</p>
                            <p className="text-2xl font-bold">{uniqueStudents}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-4">
                <form className="flex flex-col md:flex-row gap-3">
                    <select
                        name="studentId"
                        defaultValue={studentId || ''}
                        className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    >
                        <option value="">All Students</option>
                        {students.map(s => (
                            <option key={s.id} value={s.id}>
                                {s.user.name} ({s.admissionNo}) - Class {s.class?.name}
                            </option>
                        ))}
                    </select>
                    <select
                        name="status"
                        defaultValue={status || 'ALL'}
                        className="w-full md:w-48 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    >
                        <option value="ALL">All Status</option>
                        <option value="COMPLETED">Completed (Admin)</option>
                        <option value="SUCCESS">Success (Online)</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="hidden sm:inline">Apply</span>
                    </button>
                </form>
            </div>

            {/* Transaction History */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Recent Transactions</h3>
                </div>

                {payments.length === 0 ? (
                    <div className="text-center py-16">
                        <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Transactions Found</h3>
                        <p className="text-slate-500 dark:text-slate-400">No payment records match your filters</p>
                    </div>
                ) : (
                    <TransactionTable payments={JSON.parse(JSON.stringify(payments))} />
                )}
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href="/admin/finance/fees/collect"
                        className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Collect More Fees</span>
                    </Link>
                    <Link
                        href="/admin/finance/fees/reports"
                        className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View Analytics & Reports</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
