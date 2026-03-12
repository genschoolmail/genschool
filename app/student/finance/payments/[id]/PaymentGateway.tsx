'use client';

import React, { useState } from 'react';
import { initiateStudentPayment } from '@/lib/payment-actions';
import { ShieldCheck, Loader2, Lock, CreditCard } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

interface PaymentGatewayProps {
    feeId: string;
    studentId: string;
    amount: number;
    walletBalance: number;
    userId: string;
}

type PaymentState = 'idle' | 'loading' | 'success' | 'failed';

export default function PaymentGateway({ feeId, studentId, amount, walletBalance, userId }: PaymentGatewayProps) {
    const router = useRouter();
    const [state, setState] = useState<PaymentState>('idle');
    const [errorMsg, setErrorMsg] = useState('');

    const handlePayment = async () => {
        setState('loading');
        setErrorMsg('');

        try {
            const result = await initiateStudentPayment(feeId, amount);

            if (!result.success) {
                setErrorMsg(result.error || 'Payment initiation failed. Please try again.');
                setState('failed');
                return;
            }

            if (result.checkoutData) {
                const options = {
                    key: result.checkoutData.key,
                    amount: result.checkoutData.amount,
                    currency: result.checkoutData.currency,
                    name: "School Fee Payment",
                    description: "Secure Online Fee Payment",
                    image: "/logo.png",
                    order_id: result.checkoutData.orderId,
                    handler: async function (response: any) {
                        setState('loading');
                        window.location.href = `/student/finance/payment/callback/${result.checkoutData?.paymentId}?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}&status=SUCCESS`;
                    },
                    modal: {
                        ondismiss: function () {
                            setState('idle');
                        },
                        confirm_close: true,
                        escape: false
                    },
                    prefill: { name: "", email: "", contact: "" },
                    theme: { color: "#6366f1" },
                    retry: { enabled: true, max_count: 3 }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    setErrorMsg(response.error?.description || 'Payment failed. Please try again.');
                    setState('failed');
                });
                rzp.open();
            } else {
                setErrorMsg('Payment gateway unavailable. Please try again later.');
                setState('failed');
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Unexpected error. Please contact support.');
            setState('failed');
        }
    };

    if (state === 'success') {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-emerald-200 p-8 text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-9 h-9 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">Payment Successful!</h3>
                <p className="text-slate-500 text-sm">Redirecting to your receipt...</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white">
                <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4 opacity-80" />
                    <span className="text-sm font-semibold opacity-90">Secure Payment</span>
                </div>
                <p className="text-2xl font-bold">₹{amount.toLocaleString('en-IN')}</p>
                <p className="text-xs opacity-75 mt-1">Amount payable</p>
            </div>

            <div className="p-5 space-y-4">
                {/* Error State */}
                {state === 'failed' && errorMsg && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
                        <span className="text-lg leading-none">⚠️</span>
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Accepted methods info - purely informational */}
                <div className="space-y-2">
                    <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Accepted via Razorpay</p>
                    <div className="flex flex-wrap gap-2">
                        {['UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Wallet'].map(m => (
                            <span key={m} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-xs font-medium">
                                {m}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Pay Button */}
                <button
                    onClick={handlePayment}
                    disabled={state === 'loading'}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                >
                    {state === 'loading' ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Opening Payment Portal...
                        </>
                    ) : (
                        <>
                            <CreditCard className="w-5 h-5" />
                            Pay ₹{amount.toLocaleString('en-IN')} via Razorpay
                        </>
                    )}
                </button>

                {/* Security Footer */}
                <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                        256-bit SSL encrypted · Powered by <span className="font-semibold text-slate-500">Razorpay</span>
                    </p>
                </div>
            </div>

            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        </div>
    );
}
