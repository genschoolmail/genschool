'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createRefundRequest } from '@/lib/refund-actions';
import { toast } from 'sonner';
import { Clock, CheckCircle, XCircle, Send, AlertCircle } from 'lucide-react';

interface RefundRequest {
    id: string;
    amount: number;
    reason: string;
    status: string;
    createdAt: Date;
}

export default function StudentRefundClient({
    userId,
    initialRefunds
}: {
    userId: string;
    initialRefunds: RefundRequest[];
}) {
    const [refunds, setRefunds] = useState(initialRefunds);
    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    const handleSubmit = async () => {
        if (!amount || !reason) {
            return toast.error('Please fill all fields');
        }
        if (parseFloat(amount) <= 0) {
            return toast.error('Amount must be greater than 0');
        }

        setLoading(true);
        const res = await createRefundRequest({
            userId,
            amount: parseFloat(amount),
            reason
        });

        if (res.success) {
            toast.success('Refund request submitted successfully!');
            setAmount('');
            setReason('');
            // Ideally refresh data, for now reload
            window.location.reload();
        } else {
            toast.error(res.error || 'Failed to submit request');
        }
        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PENDING': return <Clock className="w-4 h-4 text-yellow-500" />;
            case 'APPROVED': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'REJECTED': return <XCircle className="w-4 h-4 text-red-500" />;
            default: return <AlertCircle className="w-4 h-4 text-slate-500" />;
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2">
            {/* Request Form */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle className="text-xl">Request a Refund</CardTitle>
                    <CardDescription>
                        Submit a refund request for any eligible fee payment
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Refund Amount (₹)</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder="e.g., 5000"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Refund</Label>
                        <Textarea
                            id="reason"
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            placeholder="Please explain why you need a refund..."
                            rows={4}
                        />
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
                    >
                        <Send className="w-4 h-4" />
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </CardContent>
            </Card>

            {/* Request History */}
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle className="text-xl">Your Requests</CardTitle>
                    <CardDescription>
                        Track the status of your refund requests
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {refunds.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No refund requests yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {refunds.map((refund) => (
                                <div
                                    key={refund.id}
                                    className="p-4 border border-slate-100 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-slate-200">
                                                ₹{refund.amount.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                                {refund.reason}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-2">
                                                {new Date(refund.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={refund.status === 'APPROVED' ? 'default' : refund.status === 'REJECTED' ? 'destructive' : 'outline'}
                                            className="flex items-center gap-1"
                                        >
                                            {getStatusIcon(refund.status)}
                                            {refund.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
