'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Building2, Wallet, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

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
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        if (!scriptLoaded) {
            toast.error("Payment Gateway is still loading. Please wait a moment.");
            return;
        }

        setProcessing(true);
        setFailed(false);
        const loadingToast = toast.loading("Initializing secure payment gateway...");

        try {
            // 1. Initiate order from server
            const res = await fetch('/api/student/payments/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ feeId })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.dismiss(loadingToast);
                toast.error(data.error || "Failed to initiate payment");
                setProcessing(false);
                return;
            }

            // 2. Open Razorpay Widget
            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: data.name,
                description: data.description,
                order_id: data.orderId,
                prefill: data.prefill,
                notes: data.notes,
                handler: function (response: any) {
                    // Payment successful (webhook will handle DB update)
                    toast.dismiss();
                    setSuccess(true);
                    toast.success("Payment Successful! Generating receipt...");
                    setTimeout(() => {
                        onSuccess();
                    }, 3000);
                },
                modal: {
                    ondismiss: function () {
                        toast.dismiss();
                        toast.error("Payment was cancelled.");
                        setProcessing(false);
                    }
                },
                theme: {
                    color: '#4f46e5' // Indigo 600
                }
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                toast.dismiss();
                setFailed(true);
                setProcessing(false);
                toast.error(response.error.description || "Payment failed.");
            });

            rzp.open();
            toast.dismiss(loadingToast);

        } catch (error: any) {
            toast.dismiss(loadingToast);
            toast.error("Could not reach payment gateway.");
            setProcessing(false);
            setFailed(true);
        }
    };

    if (success) {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">Payment Successful!</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Your receipt is being generated securely.</p>
                <p className="text-sm text-slate-500">Redirecting to history...</p>
            </div>
        );
    }

    if (failed) {
        return (
            <div className="text-center py-8">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">Payment Failed / Cancelled</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">Please try again using a different method</p>
                <button onClick={() => setFailed(false)} className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
                    Retry Payment
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Fee Category</span>
                    <span className="font-semibold text-slate-800 dark:text-white px-3 py-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">{feeName}</span>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-slate-700 mt-2">
                    <div className="flex items-center justify-between text-lg">
                        <span className="text-slate-600 dark:text-slate-400 font-medium">Total Amount</span>
                        <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">₹{amount.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Payment Method Selection */}
            <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">
                    Preferred Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => setPaymentMethod('UPI')}
                        className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'UPI'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10 scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <Smartphone className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'UPI' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        <p className={`text-sm font-bold ${paymentMethod === 'UPI' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                            UPI
                        </p>
                    </button>

                    <button
                        onClick={() => setPaymentMethod('CARD')}
                        className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'CARD'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10 scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <CreditCard className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'CARD' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        <p className={`text-sm font-bold ${paymentMethod === 'CARD' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                            Cards
                        </p>
                    </button>

                    <button
                        onClick={() => setPaymentMethod('NETBANKING')}
                        className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'NETBANKING'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10 scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <Building2 className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'NETBANKING' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        <p className={`text-sm font-bold ${paymentMethod === 'NETBANKING' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                            Net Banking
                        </p>
                    </button>

                    <button
                        onClick={() => setPaymentMethod('WALLET')}
                        className={`p-4 border-2 rounded-xl transition-all ${paymentMethod === 'WALLET'
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-md shadow-indigo-500/10 scale-[1.02]'
                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                            }`}
                    >
                        <Wallet className={`w-6 h-6 mx-auto mb-2 ${paymentMethod === 'WALLET' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        <p className={`text-sm font-bold ${paymentMethod === 'WALLET' ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
                            Wallets
                        </p>
                    </button>
                </div>
            </div>

            {/* Pay Button */}
            <button
                onClick={handlePayment}
                disabled={processing || !scriptLoaded}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 disabled:opacity-70 text-white font-black py-4 rounded-xl transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Connecting to Secure Gateway...
                    </>
                ) : (
                    <>
                        <CheckCircle className="w-5 h-5" />
                        Pay ₹{amount.toLocaleString()} Securely
                    </>
                )}
            </button>

            {/* PCI Compliance Notice */}
            <div className="text-center mt-4">
                <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase flex items-center justify-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" /></svg>
                    Secured by Razorpay • PCI DSS Compliant
                </p>
            </div>
        </div>
    );
}
