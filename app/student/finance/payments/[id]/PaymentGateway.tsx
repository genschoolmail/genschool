'use client';

import React, { useState } from 'react';
import { initiateStudentPayment } from '@/lib/payment-actions';
import { CreditCard, Smartphone, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';

interface PaymentGatewayProps {
    feeId: string;
    studentId: string;
    amount: number;
    walletBalance: number;
    userId: string;
}

type PaymentMethod = 'UPI' | 'CARD' | 'NET_BANKING';

export default function PaymentGateway({ feeId, studentId, amount, walletBalance, userId }: PaymentGatewayProps) {
    const router = useRouter();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('UPI');
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    const paymentMethods = [
        { id: 'UPI' as PaymentMethod, name: 'UPI', icon: Smartphone, description: 'Pay via UPI apps' },
        { id: 'CARD' as PaymentMethod, name: 'Card', icon: CreditCard, description: 'Debit/Credit Card' },
        { id: 'NET_BANKING' as PaymentMethod, name: 'Net Banking', icon: Building2, description: 'Online Banking' },

    ];

    const handlePayment = async () => {
        setProcessing(true);

        try {
            const result = await initiateStudentPayment(
                feeId,
                amount
            );

            if (!result.success) {
                throw new Error(result.error || 'Payment initiation failed');
            }

            // 1. Handle Redirect (Mock or Link Gateway)
            if (result.url) {
                router.push(result.url);
                return;
            }

            // 2. Handle Razorpay Modal (Order Gateway)
            if (result.checkoutData) {
                const options = {
                    key: result.checkoutData.key,
                    amount: result.checkoutData.amount,
                    currency: result.checkoutData.currency,
                    name: "Gen School Mail",
                    description: "Fee Payment",
                    order_id: result.checkoutData.orderId,
                    handler: async function (response: any) {
                        setProcessing(true);
                        // Send payment ID to verification endpoint
                        window.location.href = `/student/finance/payment/callback/${result.checkoutData?.paymentId}?razorpay_payment_id=${response.razorpay_payment_id}&razorpay_order_id=${response.razorpay_order_id}&razorpay_signature=${response.razorpay_signature}&status=SUCCESS`;
                    },
                    modal: {
                        ondismiss: function () {
                            setProcessing(false);
                        }
                    },
                    prefill: {
                        name: "",
                        email: "",
                        contact: ""
                    },
                    theme: {
                        color: "#6366f1"
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            } else {
                throw new Error('No payment method available');
            }
        } catch (error: any) {
            console.error('Payment failed:', error);
            alert(error.message || 'Payment failed! Please try again.');
            setProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
                <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Payment Successful!</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                        Your payment of ₹{amount.toLocaleString()} has been processed.
                    </p>
                    <p className="text-sm text-slate-500">Redirecting to receipt...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden sticky top-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                <h3 className="font-semibold">Payment Gateway</h3>
                <p className="text-sm opacity-90">Select payment method</p>
            </div>

            <div className="p-6 space-y-4">
                {/* Payment Methods */}
                <div className="space-y-2">
                    {paymentMethods.map(method => {
                        const Icon = method.icon;
                        return (
                            <button
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                disabled={processing}
                                className={`w-full p-4 border-2 rounded-lg text-left transition-all ${selectedMethod === method.id
                                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                    } cursor-pointer`}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-indigo-600' : 'text-slate-600'}`} />
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800 dark:text-white">{method.name}</p>
                                        <p className="text-xs text-slate-500">{method.description}</p>
                                    </div>
                                    {selectedMethod === method.id && (
                                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Amount Summary */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-600 dark:text-slate-400">Total Amount</span>
                        <span className="text-2xl font-bold text-indigo-600">₹{amount.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-5 h-5" />
                                Pay Now
                            </>
                        )}
                    </button>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-3 text-xs text-slate-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Secure Payment
                </div>
            </div>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="lazyOnload"
            />
        </div>
    );
}
