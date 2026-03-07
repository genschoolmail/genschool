'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, CreditCard, ChevronRight, Loader2 } from 'lucide-react';
import { SubscriptionStatus } from '@/lib/actions/subscription-actions';
import { toast } from 'sonner';

interface Plan {
    id: string;
    name: string;
    description: string | null;
    price: number;
    billingCycle: string;
    features: string | null;
}

interface SubscriptionClientProps {
    initialStatus: SubscriptionStatus | null;
    plans: Plan[];
    schoolInfo: any;
}

export default function SubscriptionClient({ initialStatus, plans, schoolInfo }: SubscriptionClientProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleRenew = async (planId: string) => {
        if (!scriptLoaded) {
            toast.error("Payment Gateway is loading. Please wait.");
            return;
        }

        setLoading(planId);
        const loadingToastId = toast.loading("Initializing secure payment...");

        try {
            const res = await fetch('/api/subscriptions/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId })
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to initiate renewal');

            toast.dismiss(loadingToastId);

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: data.name,
                description: data.description,
                order_id: data.orderId,
                prefill: data.prefill,
                notes: data.notes,
                theme: { color: '#6366f1' },
                handler: async (response: any) => {
                    // Payment succeeded, verify and update subscription
                    const verifyToast = toast.loading("Confirming subscription renewal...");
                    try {
                        const verifyRes = await fetch('/api/subscriptions/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                planId,
                            })
                        });
                        const verifyData = await verifyRes.json();
                        toast.dismiss(verifyToast);

                        if (verifyRes.ok && verifyData.success) {
                            toast.success("Subscription renewed successfully! Refreshing...");
                            setTimeout(() => window.location.reload(), 1500);
                        } else {
                            toast.error(verifyData.error || "Verification failed. Contact support.");
                        }
                    } catch {
                        toast.dismiss(verifyToast);
                        toast.error("Could not verify payment. Contact support with your payment ID.");
                    }
                },
                modal: {
                    ondismiss: () => {
                        toast.error("Payment cancelled.");
                        setLoading(null);
                    }
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (response: any) => {
                toast.error(`Payment failed: ${response.error.description}`);
                setLoading(null);
            });
            rzp.open();

        } catch (error: any) {
            toast.dismiss(loadingToastId);
            toast.error(error.message);
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="space-y-8">
            {/* Current Status Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Current Subscription</h2>

                {initialStatus ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500 mb-1">Active Plan</p>
                            <p className="text-xl font-bold text-slate-900 dark:text-white">{initialStatus.planName}</p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold mt-2 ${initialStatus.status === 'ACTIVE' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                initialStatus.status === 'EXPIRING_SOON' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                {initialStatus.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500 mb-1">Expiry Date</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">
                                {new Date(initialStatus.endDate).toLocaleDateString()}
                            </p>
                            <p className={`text-xs mt-1 font-medium ${initialStatus.isExpired ? 'text-red-500' : initialStatus.isExpiringSoon ? 'text-amber-500' : 'text-slate-500'
                                }`}>
                                {initialStatus.isExpired ? 'Expired' : `${initialStatus.daysLeft} days remaining`}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-500 mb-1">Billing Details</p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-white">₹{initialStatus.price}/month</p>
                            <p className="text-xs text-slate-500 mt-1">Auto-renew: {initialStatus.autoRenew ? 'Enabled' : 'Disabled'}</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 flex items-center gap-3">
                        <AlertTriangle className="text-red-500 w-6 h-6" />
                        <div>
                            <p className="font-semibold text-red-800 dark:text-red-300">No Active Subscription</p>
                            <p className="text-sm text-red-600 dark:text-red-400">Please select a plan to activate your account features.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Available Plans */}
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
                    Available Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => {
                        const isCurrentActive = initialStatus?.planId === plan.id;
                        const featuresObj = plan.features ? JSON.parse(plan.features) : {};

                        return (
                            <div key={plan.id} className={`bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 transition-all relative ${isCurrentActive ? 'border-indigo-500 shadow-md shadow-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-900/50'
                                }`}>
                                {isCurrentActive && (
                                    <div className="absolute top-0 right-0 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
                                        CURRENT
                                    </div>
                                )}
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                                <div className="mt-2 mb-4">
                                    <span className="text-3xl font-black text-slate-900 dark:text-white">₹{plan.price}</span>
                                    <span className="text-slate-500 font-medium">/{plan.billingCycle.toLowerCase()}</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 h-10 line-clamp-2">
                                    {plan.description}
                                </p>

                                <ul className="space-y-3 mb-8 text-sm text-slate-700 dark:text-slate-300">
                                    {Object.entries(featuresObj).filter(([_, val]) => val !== false).map(([key, val]) => (
                                        <li key={key} className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                            <span>
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                                {typeof val === 'number' && val !== 999999 ? `: ${val}` : ''}
                                                {val === 999999 ? ': Unlimited' : ''}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleRenew(plan.id)}
                                    disabled={loading === plan.id}
                                    className={`w-full py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${isCurrentActive && !initialStatus?.isExpired && !initialStatus?.isExpiringSoon
                                        ? 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 cursor-not-allowed'
                                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                                        }`}
                                >
                                    {loading === plan.id ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                                    ) : (
                                        isCurrentActive && !initialStatus?.isExpired && !initialStatus?.isExpiringSoon
                                            ? 'Active' : 'Renew Plan'
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
