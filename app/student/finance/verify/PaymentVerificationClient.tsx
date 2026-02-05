'use client';

import React, { useState } from 'react';
import { Search, Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface Payment {
    id: string;
    amount: number;
    date: Date | string;
    status: string;
    receiptNo: string | null;
    method: string;
    gatewayName?: string | null;
    transactionId?: string | null;
    studentFee: {
        feeStructure: {
            name: string;
        };
    };
}

export default function PaymentVerificationClient({ initialPayments }: { initialPayments: any[] }) {
    const [payments, setPayments] = useState<Payment[]>(initialPayments);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<Payment | null>(null);
    const [error, setError] = useState('');

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) return;

        setLoading(true);
        setError('');
        setSearchResult(null);

        try {
            // We would need an API to search specific payment by transaction ID
            // For now, filter locally or mock
            const found = payments.find(p =>
                (p.transactionId && p.transactionId.includes(searchTerm)) ||
                (p.receiptNo && p.receiptNo.includes(searchTerm))
            );

            if (found) {
                setSearchResult(found);
            } else {
                setError('Payment not found with this ID');
            }
        } catch (err) {
            setError('Error searching for payment');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'text-green-600 bg-green-50';
            case 'SUCCESS': return 'text-green-600 bg-green-50';
            case 'PENDING': return 'text-yellow-600 bg-yellow-50';
            case 'FAILED': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Check Payment Status</h2>
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter Transaction ID or Receipt No"
                            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify'}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                {searchResult && (
                    <div className="mt-4 p-4 border rounded-md bg-gray-50">
                        <h3 className="font-medium mb-2">Search Result</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500">Date:</span>
                                <p>{format(new Date(searchResult.date), 'dd MMM yyyy, hh:mm a')}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Amount:</span>
                                <p className="font-medium">{formatCurrency(searchResult.amount)}</p>
                            </div>
                            <div>
                                <span className="text-gray-500">Status:</span>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(searchResult.status)}`}>
                                    {searchResult.status}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-500">Receipt No:</span>
                                <p>{searchResult.receiptNo || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Treatments List */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-semibold text-gray-800">Recent Online Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Transaction ID</th>
                                <th className="px-4 py-3">Fee Type</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                        No recent online transactions found.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            {format(new Date(payment.date), 'dd MMM yyyy')}
                                            <div className="text-xs text-gray-400">{format(new Date(payment.date), 'hh:mm a')}</div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-gray-600">
                                            {payment.transactionId || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {payment.studentFee?.feeStructure?.name || 'Fee Payment'}
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                                                {payment.status === 'COMPLETED' || payment.status === 'SUCCESS' ? (
                                                    <CheckCircle className="h-3 w-3" />
                                                ) : payment.status === 'FAILED' ? (
                                                    <XCircle className="h-3 w-3" />
                                                ) : (
                                                    <Clock className="h-3 w-3" />
                                                )}
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {payment.receiptNo || '-'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
