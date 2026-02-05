import React from 'react';
import Link from 'next/link';
import { Plus, Check, Clock } from 'lucide-react';
import { getSalaries, markSalaryPaid } from '@/lib/finance-actions';
export default async function SalaryManagementPage() {
    const salaries = await getSalaries();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Salary Management</h2>
                <Link
                    href="/admin/finance/salary/new"
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <Plus className="w-4 h-4" />
                    Add Salary Record
                </Link>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Staff Name</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Month</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Basic</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Allowances</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Deductions</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Net Salary</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {salaries.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-500">
                                    No salary records found.
                                </td>
                            </tr>
                        ) : (
                            salaries.map((salary) => (
                                <tr key={salary.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-800 dark:text-white">
                                            {salary.teacher ? (
                                                <Link href={`/admin/finance/salary?teacherId=${salary.teacher.id}`} className="hover:text-indigo-600 hover:underline">
                                                    {salary.teacher?.user?.name}
                                                </Link>
                                            ) : salary.driver ? (
                                                <Link href={`/admin/finance/salary?driverId=${salary.driver.id}`} className="hover:text-indigo-600 hover:underline">
                                                    {salary.driver?.user?.name}
                                                </Link>
                                            ) : 'Unknown'}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {salary.teacher ? salary.teacher.designation : 'Driver'}
                                        </p>
                                    </td>
                                    <td className="p-4 text-slate-700 dark:text-slate-300">
                                        {new Date(salary.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="p-4 text-slate-700 dark:text-slate-300">₹{salary.basicSalary.toLocaleString()}</td>
                                    <td className="p-4 text-green-600">+₹{salary.allowances.toLocaleString()}</td>
                                    <td className="p-4 text-red-600">-₹{salary.deductions.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className="font-bold text-slate-800 dark:text-white">₹{salary.netSalary.toLocaleString()}</span>
                                    </td>
                                    <td className="p-4">
                                        {salary.status === 'PAID' ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                <Check className="w-3 h-3" />
                                                Paid
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                                <Clock className="w-3 h-3" />
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 flex items-center gap-3">
                                        {salary.status === 'PENDING' && (
                                            <form action={async () => {
                                                'use server';
                                                await markSalaryPaid(salary.id);
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                                >
                                                    Mark Paid
                                                </button>
                                            </form>
                                        )}
                                        {salary.status === 'PAID' && (
                                            <Link
                                                href={`/admin/finance/salary/receipt/${salary.id}`}
                                                className="text-sm text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1"
                                            >
                                                View Slip
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {salaries.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200">
                        No salary records found.
                    </div>
                ) : (
                    salaries.map((salary) => (
                        <div key={salary.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-5">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">
                                        {salary.teacher ? salary.teacher.user.name : salary.driver ? salary.driver.user.name : 'Unknown'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {salary.teacher ? salary.teacher.designation : 'Driver'} • {new Date(salary.month).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                                {salary.status === 'PAID' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                        <Check className="w-3 h-3" />
                                        Paid
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                        <Clock className="w-3 h-3" />
                                        Pending
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2 text-sm mb-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Basic Salary</span>
                                    <span className="font-medium text-slate-900 dark:text-white">₹{salary.basicSalary.toLocaleString()}</span>
                                </div>
                                {(salary.allowances > 0 || salary.deductions > 0) && (
                                    <div className="flex justify-between text-xs">
                                        <span className="text-slate-500">Adjustment (Allw - Ded)</span>
                                        <span className="font-medium text-slate-700">
                                            <span className="text-green-600">+₹{salary.allowances}</span> / <span className="text-red-600">-₹{salary.deductions}</span>
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-700">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">Net Salary</span>
                                    <span className="font-bold text-indigo-600">₹{salary.netSalary.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                {salary.status === 'PENDING' && (
                                    <form action={async () => {
                                        'use server';
                                        await markSalaryPaid(salary.id);
                                    }} className="w-full">
                                        <button
                                            type="submit"
                                            className="w-full py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                                        >
                                            Mark Paid
                                        </button>
                                    </form>
                                )}
                                {salary.status === 'PAID' && (
                                    <Link
                                        href={`/admin/finance/salary/receipt/${salary.id}`}
                                        className="w-full py-2 flex items-center justify-center gap-2 border border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50"
                                    >
                                        View Slip
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
