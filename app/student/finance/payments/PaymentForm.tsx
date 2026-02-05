'use client';

import React, { useState } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle, XCircle } from 'lucide-react';

interface PaymentFormProps {
    feeId: string;
    amount: number;
    feeName: string;
    onSuccess: () => void;
}

export default function PaymentForm({ feeId, amount, feeName, onSuccess }: PaymentFormProps) {
    const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'WALLET'>('UPI');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [failed, setFailed] = useState(false);

    const handlePayment = async () => {
        setProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock: 95% success rate
        const isSuccessful = Math.random() > 0.05;

        setProcessing(false);

        if (isSuccessful) {
            setSuccess(true);
            setTimeout(() => {
                onSuccess();
            }, 2000);
        } else {
            setFailed(true);
            setTimeout(() => {
                setFailed(false);
            }, 3000);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h3>
                <p className="text-slate-600 mb-4">Transaction ID: TXN-{Date.now()}</p>
                <p className="text-sm text-slate-500">Redirecting to payment history...</p>
            </div>
        );
    }

    if (failed) {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-12 h-12 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-red-600 mb-2">Payment Failed</h3>
                <p className="text-slate-600 mb-4">Please try again</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-600 dark:text-slate-400">Fee Type:</span>
                    <span className="font-semibold text-slate-800 dark:text-white">{feeName}</span>
                </div>
                <div className="flex items-center justify-between text-lg">
                    <span className="text-slate-600 dark:text-slate-400">Amount to Pay:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">₹{amount.toLocaleString()}</span>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                    Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'UPI'
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <Smartphone className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'UPI' ? 'text-indigo-600' : 'text-slate-600'}`} />
                        <p className={`text-sm font-semibold ${paymentMethod === 'UPI' ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            UPI
                        </p>
                    </button>

                    <button
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'CARD'
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'CARD' ? 'text-indigo-600' : 'text-slate-600'}`} />
                        <p className={`text-sm font-semibold ${paymentMethod === 'CARD' ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            Card
                        </p>
                    </button>

                    <button
                        onClick={() => setPaymentMethod('NETBANKING')}
                        className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'NETBANKING'
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <Building2 className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'NETBANKING' ? 'text-indigo-600' : 'text-slate-600'}`} />
                        <p className={`text-sm font-semibold ${paymentMethod === 'NETBANKING' ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            Net Banking
                        </p>
                    </button>

                    <button
                        onClick={() => setPaymentMethod('WALLET')}
                        className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'WALLET'
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                    >
                        <Wallet className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'WALLET' ? 'text-indigo-600' : 'text-slate-600'}`} />
                        <p className={`text-sm font-semibold ${paymentMethod === 'WALLET' ? 'text-indigo-600' : 'text-slate-700 dark:text-slate-300'}`}>
                            Wallet
                        </p>
                    </button>
                </div>
            </div>

            {/* Pay Button */}
            <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold py-4 rounded-xl transition-colors"
            >
                {processing ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                    </span>
                ) : (
                    `Pay ₹${amount.toLocaleString()} via ${paymentMethod}`
                )}
            </button>

            {/* Mock Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                    🔒 This is a mock payment gateway for demonstration. No real money will be charged.
                </p>
            </div>
        </div>
    );
}
