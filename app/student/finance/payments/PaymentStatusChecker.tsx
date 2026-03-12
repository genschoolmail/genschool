'use client';

import React, { useState } from 'react';
import { reVerifyPayment } from '@/lib/payment-actions';
import { RotateCw, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PaymentStatusChecker({ paymentId, status }: { paymentId: string, status: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCheck = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const result = await reVerifyPayment(paymentId);
            if (result.success) {
                // If success, refresh the page to show PAID status
                router.refresh();
            } else {
                alert(result.error || 'Payment still pending or failed.');
            }
        } catch (error) {
            alert('Failed to check status. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (status !== 'PENDING' && status !== 'PROCESSING') {
        return null;
    }

    return (
        <button
            onClick={handleCheck}
            disabled={loading}
            className="ml-2 p-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-md inline-flex items-center gap-1 transition-colors border border-slate-200"
            title="Refresh status from gateway"
        >
            <RotateCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Checking...' : 'Check Status'}
        </button>
    );
}
