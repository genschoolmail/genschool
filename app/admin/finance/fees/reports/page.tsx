import React from 'react';
import { prisma } from '@/lib/prisma';
import BackButton from '@/components/ui/BackButton';
import DownloadReportButton from '@/components/ui/DownloadReportButton';
import {
    BarChart3, DollarSign, TrendingUp, TrendingDown,
    Download, Calendar, Users, PieChart, FileText,
    ArrowUp, ArrowDown, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default async function FeeReportsPage({
    searchParams
}: {
    searchParams: Promise<{
        period?: string;
        classId?: string;
    }> | {
        period?: string;
        classId?: string;
    }
}) {
    const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
    const { period = 'thisMonth', classId } = resolvedParams;

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date, endDate: Date;

    switch (period) {
        case 'today':
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            break;
        case 'thisWeek':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startDate = new Date(startOfWeek.setHours(0, 0, 0, 0));
            endDate = new Date();
            break;
        case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date();
            break;
        case 'thisYear':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date();
            break;
        case 'lastMonth':
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date();
    }

    // Fetch data
    const classes = await prisma.class.findMany({
        orderBy: { name: 'asc' }
    });

    // Get all student fees with filters
    const studentFeesWhere: any = {};

    if (classId) {
        studentFeesWhere.student = { classId };
    }

    const studentFees = await prisma.studentFee.findMany({
        where: studentFeesWhere,
        include: {
            student: {
                include: {
                    user: true,
                    class: true
                }
            },
            feeStructure: true,
            payments: true
        }
    });

    // Calculate analytics
    const totalExpected = studentFees.reduce((sum, f) => sum + f.amount, 0);
    const totalCollected = studentFees.reduce((sum, f) =>
        sum + f.payments.reduce((pSum, p) => pSum + p.amount, 0), 0
    );
    const totalPending = totalExpected - totalCollected;
    const collectionRate = totalExpected > 0 ? (totalCollected / totalExpected) * 100 : 0;

    const paidCount = studentFees.filter(f => f.status === 'PAID').length;
    const pendingCount = studentFees.filter(f => f.status === 'PENDING').length;
    const overdueCount = studentFees.filter(f => f.status === 'OVERDUE').length;
    const partialCount = studentFees.filter(f => f.status === 'PARTIAL').length;

    // Fee structure breakdown
    const feesByStructure = studentFees.reduce((acc: any, f) => {
        const name = f.feeStructure.name;
        if (!acc[name]) {
            acc[name] = { expected: 0, collected: 0, count: 0 };
        }
        acc[name].expected += f.amount;
        acc[name].collected += f.payments.reduce((sum, p) => sum + p.amount, 0);
        acc[name].count += 1;
        return acc;
    }, {});

    // Class-wise breakdown
    const feesByClass = studentFees.reduce((acc: any, f) => {
        const className = f.student.class ? `${f.student.class.name}-${f.student.class.section}` : 'N/A';
        if (!acc[className]) {
            acc[className] = { expected: 0, collected: 0, count: 0 };
        }
        acc[className].expected += f.amount;
        acc[className].collected += f.payments.reduce((sum, p) => sum + p.amount, 0);
        acc[className].count += 1;
        return acc;
    }, {});

    const periodLabels: Record<string, string> = {
        today: 'Today',
        thisWeek: 'This Week',
        thisMonth: 'This Month',
        thisYear: 'This Year',
        lastMonth: 'Last Month'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                    <BackButton href="/admin/finance/fees" />
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <BarChart3 className="w-7 h-7 text-indigo-600" />
                            Fee Reports & Analytics
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Comprehensive fee collection analysis and insights
                        </p>
                    </div>
                </div>
                <DownloadReportButton />
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-4">
                <form className="flex flex-col md:flex-row gap-3">
                    <select
                        name="period"
                        defaultValue={period}
                        className="flex-1 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    >
                        <option value="today">Today</option>
                        <option value="thisWeek">This Week</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                        <option value="thisYear">This Year</option>
                    </select>
                    <select
                        name="classId"
                        defaultValue={classId || ''}
                        className="w-full md:w-64 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500"
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
                    >
                        Apply Filters
                    </button>
                </form>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <DollarSign className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Expected</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{totalExpected.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Amount Due</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-green-200 dark:border-green-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Collected</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{totalCollected.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{collectionRate.toFixed(1)}% Collection Rate</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-red-200 dark:border-red-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">₹{totalPending.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{pendingCount + overdueCount} Students</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-purple-200 dark:border-purple-700 p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{studentFees.length}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Fee Assignments</p>
                </div>
            </div>

            {/* Status Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-600" />
                        Payment Status Distribution
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">Paid</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-green-600">{paidCount}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {((paidCount / studentFees.length) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <ArrowUp className="w-5 h-5 text-yellow-600" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">Partial</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-yellow-600">{partialCount}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {((partialCount / studentFees.length) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-orange-600" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">Pending</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-orange-600">{pendingCount}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {((pendingCount / studentFees.length) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <div className="flex items-center gap-3">
                                <ArrowDown className="w-5 h-5 text-red-600" />
                                <span className="font-medium text-slate-700 dark:text-slate-300">Overdue</span>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-red-600">{overdueCount}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {((overdueCount / studentFees.length) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fee Structure Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        Fee Type Breakdown
                    </h3>
                    <div className="space-y-3">
                        {Object.entries(feesByStructure).map(([name, data]: [string, any]) => (
                            <div key={name} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{name}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{data.count} students</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-600 font-semibold">
                                        ₹{data.collected.toLocaleString()}
                                    </span>
                                    <span className="text-slate-500 dark:text-slate-400">
                                        / ₹{data.expected.toLocaleString()}
                                    </span>
                                </div>
                                <div className="mt-2 h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 rounded-full transition-all"
                                        style={{ width: `${(data.collected / data.expected) * 100}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Class-wise Analysis */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Class-wise Collection Report
                </h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold">
                            <tr>
                                <th className="px-4 py-3">Class</th>
                                <th className="px-4 py-3">Students</th>
                                <th className="px-4 py-3">Expected</th>
                                <th className="px-4 py-3">Collected</th>
                                <th className="px-4 py-3">Pending</th>
                                <th className="px-4 py-3">Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {Object.entries(feesByClass).map(([className, data]: [string, any]) => (
                                <tr key={className} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{className}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{data.count}</td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">₹{data.expected.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-semibold text-green-600">₹{data.collected.toLocaleString()}</td>
                                    <td className="px-4 py-3 font-semibold text-red-600">₹{(data.expected - data.collected).toLocaleString()}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${(data.collected / data.expected) * 100 >= 80
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : (data.collected / data.expected) * 100 >= 50
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {((data.collected / data.expected) * 100).toFixed(1)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                        href="/admin/finance/fees/collect"
                        className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Collect Fees</span>
                    </Link>
                    <Link
                        href="/admin/finance/fees/history"
                        className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View History</span>
                    </Link>
                    <Link
                        href="/admin/finance/fees"
                        className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-slate-200 dark:border-slate-700"
                    >
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fee Management</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
