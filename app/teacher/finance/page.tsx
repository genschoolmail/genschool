import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getTeacherFinancialSummary } from '@/lib/finance-phase2-actions';
import { DollarSign, TrendingUp, Clock, Calendar } from 'lucide-react';

export default async function TeacherFinanceDashboard() {
    const session = await auth();

    if (!session?.user || session.user.role !== 'TEACHER') {
        redirect('/');
    }

    // Get teacher record
    const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: { user: true }
    });

    if (!teacher) {
        redirect('/');
    }

    const summary = await getTeacherFinancialSummary(teacher.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-slate-100 dark:border-slate-700">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1">My Salary & Earnings</h1>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">Welcome, {teacher.user.name}</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 md:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow">
                        <TrendingUp className="w-7 h-7 md:w-8 md:h-8 opacity-80 mb-2" />
                        <p className="text-xs md:text-sm opacity-90 font-medium">Total Earned (Paid)</p>
                        <p className="text-2xl md:text-3xl font-black mt-1">₹{summary.totalEarned.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-5 md:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow">
                        <Clock className="w-7 h-7 md:w-8 md:h-8 opacity-80 mb-2" />
                        <p className="text-xs md:text-sm opacity-90 font-medium">Pending Salary</p>
                        <p className="text-2xl md:text-3xl font-black mt-1">₹{summary.pendingSalary.toLocaleString()}</p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 md:p-6 text-white shadow-lg hover:shadow-2xl transition-shadow sm:col-span-2 lg:col-span-1">
                        <DollarSign className="w-7 h-7 md:w-8 md:h-8 opacity-80 mb-2" />
                        <p className="text-xs md:text-sm opacity-90 font-medium">Current Month</p>
                        <p className="text-2xl md:text-3xl font-black mt-1">
                            ₹{summary.currentMonth?.netSalary.toLocaleString() || '0'}
                        </p>
                    </div>
                </div>

                {/* Current Month Details */}
                {summary.currentMonth && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-4 md:p-6">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Current Month Breakdown
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                            <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Basic Salary</p>
                                <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mt-1">
                                    ₹{summary.currentMonth.basicSalary.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-green-600 dark:text-green-400">Allowances</p>
                                <p className="text-lg md:text-xl font-bold text-green-700 dark:text-green-300 mt-1">
                                    +₹{summary.currentMonth.allowances.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-red-600 dark:text-red-400">Deductions</p>
                                <p className="text-lg md:text-xl font-bold text-red-700 dark:text-red-300 mt-1">
                                    -₹{summary.currentMonth.deductions.toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
                                <p className="text-xs md:text-sm text-indigo-600 dark:text-indigo-400">Net Salary</p>
                                <p className="text-lg md:text-xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                                    ₹{summary.currentMonth.netSalary.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="mt-4">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs md:text-sm font-semibold ${summary.currentMonth.status === 'PAID'
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                {summary.currentMonth.status === 'PAID' ? '✓ Paid' : '⏳ Pending'}
                            </span>
                            {summary.currentMonth.paidDate && (
                                <span className="ml-3 text-xs md:text-sm text-slate-500">
                                    Paid on: {new Date(summary.currentMonth.paidDate).toLocaleDateString('en-IN')}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Salary History */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 p-4 md:p-6">
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4">Salary History (Last 6 Months)</h2>
                    <div className="space-y-3">
                        {summary.salaryHistory.map(salary => (
                            <div key={salary.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                                <div className="flex-1">
                                    <p className="font-semibold text-slate-800 dark:text-white text-sm md:text-base">
                                        {new Date(salary.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-xs md:text-sm text-slate-500 mt-1">
                                        Basic: ₹{salary.basicSalary.toLocaleString()} |
                                        Allowances: +₹{salary.allowances.toLocaleString()} |
                                        Deductions: -₹{salary.deductions.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                                    <p className="font-bold text-slate-800 dark:text-white text-lg md:text-xl">
                                        ₹{salary.netSalary.toLocaleString()}
                                    </p>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${salary.status === 'PAID'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                        }`}>
                                        {salary.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
