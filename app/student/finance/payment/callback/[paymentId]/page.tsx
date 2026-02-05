import React from 'react';
import { verifyTransaction } from '@/lib/payment-actions';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function PaymentCallbackPage({
    params,
    searchParams
}: {
    params: Promise<{ paymentId: string }>,
    searchParams: Promise<{ status?: string, transactionId?: string }>
}) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { paymentId } = resolvedParams;
    const { status, transactionId, razorpay_payment_id } = resolvedSearchParams;

    // Treat 'undefined' status as suspicious or failed
    const txnStatus = status || 'FAILED';
    const txnId = razorpay_payment_id || transactionId || '';

    if (!paymentId) return <div>Invalid Request</div>;

    const result = await verifyTransaction(paymentId, txnId, txnStatus);

    if (result.success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                    <p className="text-gray-600 mb-6">Your transaction has been verified and recorded.</p>

                    <div className="space-y-3">
                        <Link
                            href={`/student/finance/receipts/${result.payment?.id}`}
                            className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            View Receipt
                        </Link>
                        <Link
                            href="/student/finance"
                            className="block w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                        >
                            Back to Finance
                        </Link>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h1>
                    <p className="text-gray-600 mb-6">{result.error || 'Transaction could not be verified.'}</p>

                    <Link
                        href="/student/finance"
                        className="block w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
                    >
                        Return to Finance
                    </Link>
                </div>
            </div>
        )
    }
}
