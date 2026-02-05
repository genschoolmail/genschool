
import React from 'react';
import { getStudentFees, getClasses } from '@/lib/actions';
import { auth } from '@/auth';
import BackButton from '@/components/ui/BackButton';
import { Search, Filter, Wallet, User, DollarSign, CheckCircle, AlertCircle, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import CollectButton from '@/components/admin/finance/CollectButton';

export default async function CollectFeePage({
    searchParams
}: {
    searchParams: Promise<{ q?: string; class?: string; status?: string; studentId?: string }> | { q?: string; class?: string; status?: string; studentId?: string }
}) {
    const resolvedParams = searchParams instanceof Promise ? await searchParams : searchParams;
    const query = resolvedParams.q || '';
    const classId = resolvedParams.class || '';
    const status = resolvedParams.status || '';
    const preselectedStudent = resolvedParams.studentId || '';

    const session = await auth();

    const fees = await getStudentFees(preselectedStudent || undefined, query, classId, status);
    const classes = await getClasses();

    // Map fees to include computed properties and handle potential undefined values
    let displayFees = fees.map((f: any) => ({
        ...f,
        totalAmount: f.amount || 0,
        pendingAmount: (f.amount || 0) - (f.paidAmount || 0) - (f.discount || 0)
    }));

    if (!status) {
        displayFees = displayFees.filter((f: any) => f.status !== 'PAID');
    }

    const totalPending = displayFees.reduce((sum: number, f: any) => sum + (f.pendingAmount || 0), 0);
    const pendingCount = displayFees.filter((f: any) => f.status !== 'PAID').length;

    const getStatusBadge = (feeStatus: string) => {
        const badges = {
            PAID: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', icon: CheckCircle },
            PARTIAL: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', icon: Clock },
            PENDING: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', icon: AlertCircle },
            OVERDUE: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', icon: AlertCircle }
        };
        return badges[feeStatus as keyof typeof badges] || badges.PENDING;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-start gap-4">
                    <BackButton href="/admin/finance/fees" />
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Wallet className="w-7 h-7 text-green-600" />
                            Collect Fees
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Record student fee payments
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Banner */}
            {displayFees.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-90">Pending Payments</p>
                                <p className="text-2xl font-bold">{pendingCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-90">Total Pending</p>
                                <p className="text-2xl font-bold">₹{totalPending.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <User className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-90">Total Students</p>
                                <p className="text-2xl font-bold">{displayFees.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-4">
                <form className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Search by student name or admission number..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 transition-all"
                        />
                    </div>
                    <select
                        name="class"
                        defaultValue={classId}
                        className="w-full md:w-48 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
                    >
                        <option value="">All Classes</option>
                        {classes.map((c: any) => (
                            <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                        ))}
                    </select>
                    <select
                        name="status"
                        defaultValue={status}
                        className="w-full md:w-48 px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
                    >
                        <option value="">Pending Only</option>
                        <option value="ALL">All Status</option>
                        <option value="OVERDUE">Overdue</option>
                        <option value="PARTIAL">Partial</option>
                        <option value="PAID">Paid</option>
                    </select>
                    <button
                        type="submit"
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                </form>
            </div>

            {/* Fee Records */}
            {displayFees.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Wallet className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Fee Records Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        {query || classId || status ? 'Try adjusting your filters' : 'No pending fees to collect'}
                    </p>
                    <Link
                        href="/admin/finance/fees/assign"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Assign Fees to Students
                    </Link>
                </div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                                    <tr>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Class</th>
                                        <th className="px-6 py-4">Fee Type</th>
                                        <th className="px-6 py-4">Total Amount</th>
                                        <th className="px-6 py-4">Paid</th>
                                        <th className="px-6 py-4">Pending</th>
                                        <th className="px-6 py-4">Due Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {displayFees.map((fee: any) => {
                                        const badge = getStatusBadge(fee.status);
                                        const StatusIcon = badge.icon;

                                        return (
                                            <tr key={fee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-slate-800 dark:text-white">{fee.student.user.name}</div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">{fee.student.admissionNo}</div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                                                    {fee.student.class.name} - {fee.student.class.section}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-200">
                                                    {fee.feeStructure.name}
                                                </td>
                                                <td className="px-6 py-4 font-bold text-slate-800 dark:text-white">
                                                    ₹{(fee.totalAmount || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-green-600 font-semibold">
                                                    ₹{(fee.paidAmount || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-red-600 font-semibold">
                                                    ₹{(fee.pendingAmount || 0).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                    {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                        <StatusIcon className="w-3 h-3" />
                                                        {fee.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {fee.status !== 'PAID' && (
                                                        <CollectButton fee={fee} currentUser={session?.user} />
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden space-y-4">
                        {displayFees.map((fee: any) => {
                            const badge = getStatusBadge(fee.status);
                            const StatusIcon = badge.icon;

                            return (
                                <div key={fee.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">
                                                {fee.student.user.name}
                                            </h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {fee.student.admissionNo} • Class {fee.student.class.name}-{fee.student.class.section}
                                            </p>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {fee.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Fee Type:</span>
                                            <span className="text-sm font-semibold text-slate-800 dark:text-white">{fee.feeStructure.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Total Amount:</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-white">₹{fee.totalAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Paid:</span>
                                            <span className="text-sm font-semibold text-green-600">₹{fee.paidAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Pending:</span>
                                            <span className="text-sm font-semibold text-red-600">₹{fee.pendingAmount.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Due Date:</span>
                                            <span className="text-xs text-slate-500 dark:text-slate-400">
                                                {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                                            </span>
                                        </div>
                                    </div>

                                    {fee.status !== 'PAID' && (
                                        <div className="mt-4">
                                            <CollectButton fee={fee} currentUser={session?.user} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Quick Links */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Related Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                        href="/admin/finance/fees/assign"
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors border border-slate-200 dark:border-slate-700 group"
                    >
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-5 h-5 text-indigo-600" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign More Fees</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="/admin/students"
                        className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border border-slate-200 dark:border-slate-700 group"
                    >
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">View All Students</span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
