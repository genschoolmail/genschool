'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle, Download } from 'lucide-react';

interface Payment {
    id: string;
    receiptNo: string | null;
    consolidatedReceiptNo?: string | null; // Added optional field
    date: Date;
    amount: number;
    method: string;
    status: string;
    studentFee: {
        student: {
            admissionNo: string;
            user: {
                name: string | null;
            };
        };
        feeStructure: {
            name: string;
        };
    };
}

export default function TransactionTable({ payments }: { payments: Payment[] }) {
    const router = useRouter();

    const handleRowClick = (receiptNo: string | null, id: string, consolidatedNo?: string | null) => {
        // Prefer consolidatedNo/receiptNo, fallback to ID
        const identifier = consolidatedNo || receiptNo || id;
        router.push(`/admin/finance/fees/receipt/${identifier}`);
    };

    return (
        <div>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-semibold text-sm">
                        <tr>
                            <th className="px-6 py-4">Receipt No</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Student</th>
                            <th className="px-6 py-4">Fee Type</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Method</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {payments.map((payment) => (
                            <tr
                                key={payment.id}
                                className="hover:bg-indigo-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                                onClick={() => handleRowClick(payment.receiptNo, payment.id, payment.consolidatedReceiptNo)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600">
                                            {payment.consolidatedReceiptNo || payment.receiptNo || 'N/A'}
                                        </span>
                                        <span className="text-[10px] text-slate-400">
                                            ID: {payment.id.slice(0, 8)}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                    {new Date(payment.date).toLocaleString('en-IN')}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-slate-800 dark:text-white">
                                        {payment.studentFee?.student?.user?.name || 'Unknown Student'}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {payment.studentFee?.student?.admissionNo || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-slate-700 dark:text-slate-200">
                                    {payment.studentFee?.feeStructure?.name || 'Unknown Fee'}
                                </td>
                                <td className="px-6 py-4 font-bold text-green-600">
                                    ₹{payment.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                                        {payment.method}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                        <CheckCircle className="w-3 h-3" />
                                        {payment.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRowClick(payment.receiptNo, payment.id, payment.consolidatedReceiptNo);
                                        }}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                        title="Download Receipt"
                                    >
                                        <Download className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards - Premium Redesign */}
            <div className="lg:hidden space-y-4 px-4 pb-4 bg-slate-50 dark:bg-slate-900/50">
                {payments.map((payment) => (
                    <div
                        key={payment.id}
                        className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300"
                        onClick={() => handleRowClick(payment.receiptNo, payment.id, payment.consolidatedReceiptNo)}
                    >
                        {/* Card Header */}
                        <div className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700/50 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                        RCPT: {payment.consolidatedReceiptNo || payment.receiptNo || payment.id.slice(0, 8)}
                                    </p>
                                    <p className="font-bold text-base text-slate-800 dark:text-white leading-tight mt-0.5">
                                        {payment.studentFee?.student?.user?.name || 'Unknown Student'}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${payment.status === 'COMPLETED' || payment.status === 'SUCCESS'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                {payment.status}
                            </span>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 grid grid-cols-2 gap-y-4 gap-x-2">
                            <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wide mb-1">Fee Amount</p>
                                <p className="text-xl font-bold text-slate-800 dark:text-white">
                                    ₹{payment.amount.toLocaleString()}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wide mb-1">Date</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                                </p>
                            </div>

                            <div className="col-span-2 pt-2 border-t border-dashed border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wide">Fee Type</p>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate max-w-[150px]">
                                        {payment.studentFee?.feeStructure?.name || 'General Fee'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase text-slate-400 font-bold tracking-wide">Method</p>
                                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300 capitalize">
                                        {payment.method.toLowerCase()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Card Footer / Action */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(payment.receiptNo, payment.id, payment.consolidatedReceiptNo);
                                }}
                                className="w-full py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 shadow-sm rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-600 active:scale-[0.98] transition-all"
                            >
                                <Download className="w-4 h-4" />
                                View Receipt
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
