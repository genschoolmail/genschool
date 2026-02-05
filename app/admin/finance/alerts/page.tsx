import React from 'react';
import { getPendingAlerts } from '@/lib/alert-utils';
import { sendFeeReminder, sendLowBalanceWarning } from '@/lib/alert-utils';
import { Bell, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function AlertsPage() {
    const alertStats = await getPendingAlerts();

    // Get students with pending fees
    const studentsWithPendingFees = await prisma.student.findMany({
        where: {
            studentFees: {
                some: {
                    status: { in: ['PENDING', 'PARTIAL'] }
                }
            }
        },
        include: {
            user: true,
            class: true,
            studentFees: {
                where: {
                    status: { in: ['PENDING', 'PARTIAL'] }
                }
            }
        },
        take: 20
    });

    // Get students with low wallet balance
    const studentsWithLowBalance = await prisma.student.findMany({
        where: {
            wallet: {
                balance: { lt: 100 }
            }
        },
        include: {
            user: true,
            class: true,
            wallet: true
        },
        take: 20
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Alerts & Notifications</h1>
                    <p className="text-slate-500">Manage automated alerts and reminders</p>
                </div>
                <Link href="/admin/finance" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100">
                    Back to Finance
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                    <Bell className="w-8 h-8 opacity-80 mb-2" />
                    <p className="text-sm opacity-90">Pending Fee Reminders</p>
                    <p className="text-3xl font-bold mt-1">{alertStats.pendingFeeReminders}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                    <AlertTriangle className="w-8 h-8 opacity-80 mb-2" />
                    <p className="text-sm opacity-90">Low Balance Alerts</p>
                    <p className="text-3xl font-bold mt-1">{alertStats.lowBalanceAlerts}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                    <CheckCircle2 className="w-8 h-8 opacity-80 mb-2" />
                    <p className="text-sm opacity-90">Total Alerts</p>
                    <p className="text-3xl font-bold mt-1">{alertStats.totalAlerts}</p>
                </div>
            </div>

            {/* Fee Reminders Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Fee Payment Reminders</h2>
                    <p className="text-sm text-slate-500">Students with pending or overdue fees</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Student</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Class</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Pending Fees</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {studentsWithPendingFees.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        No students with pending fees! 🎉
                                    </td>
                                </tr>
                            ) : (
                                studentsWithPendingFees.map(student => {
                                    const totalDue = student.studentFees.reduce((sum, fee) =>
                                        sum + ((fee.amount || 0) - (fee.paidAmount || 0) - (fee.discount || 0)), 0
                                    );

                                    return (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-800 dark:text-white">{student.user.name}</p>
                                                    <p className="text-sm text-slate-500">{student.admissionNo}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                                {student.class?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                                                ₹{totalDue.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <form action={async () => {
                                                    'use server';
                                                    await sendFeeReminder(student.id);
                                                }}>
                                                    <button type="submit" className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm">
                                                        <Send className="w-4 h-4" />
                                                        Send Reminder
                                                    </button>
                                                </form>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Low Balance Alerts Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Low Wallet Balance Alerts</h2>
                    <p className="text-sm text-slate-500">Students with wallet balance below ₹100</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Student</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Class</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Balance</th>
                                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {studentsWithLowBalance.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                                        All wallets have sufficient balance! ✅
                                    </td>
                                </tr>
                            ) : (
                                studentsWithLowBalance.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-medium text-slate-800 dark:text-white">{student.user.name}</p>
                                                <p className="text-sm text-slate-500">{student.admissionNo}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                            {student.class?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm font-semibold text-red-600">
                                            ₹{student.wallet?.balance.toLocaleString() || 0}
                                        </td>
                                        <td className="px-6 py-4">
                                            <form action={async () => {
                                                'use server';
                                                await sendLowBalanceWarning(student.id);
                                            }}>
                                                <button type="submit" className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                                                    <Send className="w-4 h-4" />
                                                    Send Alert
                                                </button>
                                            </form>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
                <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Mock Notification System</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            This is a demonstration system. SMS and email alerts are logged to the console.
                            In production, integrate with actual SMS gateway (Twilio) and email service (SendGrid).
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
