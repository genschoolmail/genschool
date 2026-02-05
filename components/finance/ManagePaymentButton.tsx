'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, RefreshCw, Wallet, AlertTriangle } from 'lucide-react';
import { refundPayment, movePaymentToAdvance } from '@/lib/transaction-actions';

interface ManagePaymentButtonProps {
    paymentId: string;
    studentName: string;
    amount: number;
    status: string;
}

export default function ManagePaymentButton({ paymentId, studentName, amount, status }: ManagePaymentButtonProps) {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleRefund = async () => {
        const reason = prompt("Enter reason for refund:");
        if (!reason) return;

        setLoading(true);
        const res = await refundPayment(paymentId, reason);
        setLoading(false);
        if (res.success) {
            router.refresh();
            setIsOpen(false);
            alert("Payment marked as REFUNDED");
        } else {
            alert("Error: " + (res as any).error);
        }
    };

    const handleMoveToAdvance = async () => {
        if (!confirm(`Move ₹${amount} to ${studentName}'s Advance Balance? This will revert the fee payment.`)) return;
        setLoading(true);
        const res = await movePaymentToAdvance(paymentId, "Admin");
        setLoading(false);
        if (res.success) {
            router.refresh();
            setIsOpen(false);
            alert("Payment moved to Advance successfully");
        } else {
            alert("Error: " + (res as any).error);
        }
    };

    if (status !== 'SUCCESS') return null;

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors text-sm font-medium"
            >
                <MoreHorizontal size={16} />
                Manage
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 z-20 py-1 overflow-hidden">
                        <div className="px-3 py-2 border-b border-slate-100 bg-slate-50">
                            <p className="text-xs font-semibold text-slate-500 uppercase">Payment Actions</p>
                        </div>

                        <button
                            onClick={handleMoveToAdvance}
                            disabled={loading}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-3 transition-colors"
                        >
                            <Wallet size={16} />
                            <div>
                                <p className="font-medium">Move to Advance</p>
                                <p className="text-xs text-slate-500">Credit to Wallet</p>
                            </div>
                        </button>

                        <button
                            onClick={handleRefund}
                            disabled={loading}
                            className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-3 transition-colors border-t border-slate-100"
                        >
                            <RefreshCw size={16} className="rotate-180" />
                            <div>
                                <p className="font-medium">Refund Payment</p>
                                <p className="text-xs text-slate-500">Revert transaction</p>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
