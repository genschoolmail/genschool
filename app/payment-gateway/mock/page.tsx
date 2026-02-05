'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader2, CreditCard, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function MockGatewayContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [processing, setProcessing] = useState(false);

    const amount = parseFloat(searchParams.get('amount') || '0');
    const transactionId = searchParams.get('transactionId') || 'Unknown';
    const returnUrl = searchParams.get('returnUrl');
    const description = searchParams.get('description') || 'School Fee Payment';
    const receiptNo = searchParams.get('receiptNo');

    const handlePayment = (status: 'SUCCESS' | 'FAILED') => {
        setProcessing(true);
        // Simulate network delay
        setTimeout(() => {
            if (returnUrl) {
                const url = new URL(returnUrl);
                url.searchParams.set('status', status);
                url.searchParams.set('transactionId', transactionId);
                router.push(url.toString());
            } else {
                alert('Configuration Error: No Return URL');
                setProcessing(false);
            }
        }, 2000);
    };

    return (
        <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-blue-600 p-6 text-white text-center">
                <div className="flex justify-center mb-4">
                    <ShieldCheck className="h-12 w-12" />
                </div>
                <h1 className="text-2xl font-bold">Secure Payment Gateway</h1>
                <p className="text-blue-100 mt-1">Mock Environment (Test Mode)</p>
            </div>

            {/* Transaction Details */}
            <div className="p-6 bg-gray-50 border-b">
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Merchant</span>
                    <span className="font-semibold text-gray-700">School Management System</span>
                </div>
                <div className="flex justify-between mb-2">
                    <span className="text-gray-500">Description</span>
                    <span className="font-medium text-gray-700">{description}</span>
                </div>
                <div className="flex justify-between mb-2 text-xs text-gray-400">
                    <span>Transaction ID</span>
                    <span className="font-mono">{transactionId}</span>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(amount)}</span>
                </div>
            </div>

            {/* Payment Actions */}
            <div className="p-6 space-y-4">
                <p className="text-sm text-center text-gray-500 mb-4">
                    Select a payment outcome to simulate:
                </p>

                <button
                    onClick={() => handlePayment('SUCCESS')}
                    disabled={processing}
                    className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                >
                    {processing ? <Loader2 className="animate-spin h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                    Simulate Successful Payment
                </button>

                <button
                    onClick={() => handlePayment('FAILED')}
                    disabled={processing}
                    className="w-full py-3 px-4 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors"
                >
                    Simulate Failed/Cancelled
                </button>
            </div>

            <div className="bg-gray-100 p-4 text-center text-xs text-gray-400">
                This is a mock gateway for testing purposes only. No real money is deducted.
            </div>
        </div>
    );
}

export default function MockGatewayPage() {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <Suspense fallback={<div className="text-center">Loading Gateway...</div>}>
                <MockGatewayContent />
            </Suspense>
        </div>
    );
}
