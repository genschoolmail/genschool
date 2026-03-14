import React from 'react';
import { getSettlementStats, getSettlementTransactions } from '@/lib/actions/settlement-actions';
import { 
    Landmark, IndianRupee, TrendingUp, Clock, 
    CheckCircle2, AlertCircle, RefreshCw, FileText 
} from 'lucide-react';

export default async function SettlementsPage({
    searchParams
}: {
    searchParams: { page?: string }
}) {
    const page = Number(searchParams.page) || 1;
    
    // Fetch stats and table data
    const [{ stats }, { transactions, pagination }] = await Promise.all([
        getSettlementStats(),
        getSettlementTransactions(page)
    ]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Landmark className="w-8 h-8 text-emerald-600" />
                        Settlements Dashboard
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Track online fee collections and bank transfers
                    </p>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Volume */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Online Volume</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-white">
                                ₹{stats?.totalVolume.toLocaleString('en-IN') || 0}
                            </p>
                        </div>
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl">
                            <IndianRupee className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Gateway Charges */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gateway Charges</p>
                            <p className="text-2xl font-black text-rose-600">
                                -₹{stats?.totalGatewayCharges.toLocaleString('en-IN') || 0}
                            </p>
                        </div>
                        <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-xl">
                            <TrendingUp className="w-5 h-5 rotate-180" />
                        </div>
                    </div>
                </div>

                {/* Processing (Waiting for Bank) */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Processing / Pending</p>
                            <p className="text-2xl font-black text-amber-600">
                                ₹{stats?.processingAmount.toLocaleString('en-IN') || 0}
                            </p>
                        </div>
                        <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 rounded-xl">
                            <Clock className="w-5 h-5" />
                        </div>
                    </div>
                </div>

                {/* Settled / Transferred */}
                <div className="bg-emerald-600 p-5 rounded-2xl shadow-emerald-500/30 shadow-lg relative overflow-hidden text-white">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                        <Landmark className="w-16 h-16" />
                    </div>
                    <div className="relative z-10 flex items-start justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider mb-1">Settled Net Amount</p>
                            <p className="text-2xl font-black">
                                ₹{stats?.settledAmount.toLocaleString('en-IN') || 0}
                            </p>
                            <p className="text-xs text-emerald-200 mt-1">Transferred to Linked Acc</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Transactions Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Settlement Details
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 font-bold">
                                <th className="px-6 py-4">Date & Receipt</th>
                                <th className="px-6 py-4">Student & Fee</th>
                                <th className="px-6 py-4 text-right">Gross Amount</th>
                                <th className="px-6 py-4 text-right">Charges</th>
                                <th className="px-6 py-4 text-right">Net Received</th>
                                <th className="px-6 py-4 text-center">Settlement Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {transactions?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                        <RefreshCw className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                                        <p className="text-base font-semibold">No transactions found</p>
                                        <p className="text-sm mt-1">Online payments will appear here.</p>
                                    </td>
                                </tr>
                            ) : (
                                transactions?.map((txn: any) => {
                                    const feeName = txn.studentFee?.feeStructure?.name || 'Fee';
                                    const studentName = txn.studentFee?.student?.user?.name || 'Unknown Student';
                                    
                                    const isFailed = txn.status === 'FAILED';
                                    const isProcessing = txn.splitStatus === 'PENDING' && !isFailed;
                                    const isSettled = txn.splitStatus === 'SUCCESS';

                                    return (
                                        <tr key={txn.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            {/* Date & Receipt */}
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                                                    {new Date(txn.date).toLocaleDateString('en-IN', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-xs text-slate-500 font-mono mt-0.5">{txn.receiptNo || txn.reference}</p>
                                            </td>

                                            {/* Student & Fee */}
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm truncate max-w-[200px]">
                                                    {studentName}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate max-w-[200px]">{feeName}</p>
                                            </td>

                                            {/* Amounts */}
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-bold text-slate-800 dark:text-slate-200">
                                                    ₹{txn.amount.toLocaleString('en-IN')}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-semibold text-rose-600 text-sm">
                                                    -₹{(txn.platformFee || 0).toLocaleString('en-IN')}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <p className="font-black text-emerald-600">
                                                    ₹{(txn.schoolShare || txn.amount).toLocaleString('en-IN')}
                                                </p>
                                            </td>

                                            {/* Settlement Status */}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {isFailed ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                                                            <AlertCircle className="w-3.5 h-3.5" /> Failed
                                                        </span>
                                                    ) : isSettled ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> Transferred
                                                        </span>
                                                    ) : isProcessing ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                            <Clock className="w-3.5 h-3.5" /> Processing T+2
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                                                            Pending
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-sm text-slate-500">
                        <p>Showing page {pagination.page} of {pagination.totalPages}</p>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-md cursor-not-allowed">Prevs</span>
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md font-medium cursor-pointer">Next</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
