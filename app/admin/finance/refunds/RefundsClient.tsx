'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { processRefund } from '@/lib/refund-actions';
import { toast } from 'sonner';
import { Check, X, Clock, User, FileText } from 'lucide-react';

interface RefundRequest {
    id: string;
    amount: number;
    reason: string;
    status: string;
    createdAt: Date;
    student: {
        user: { name: string | null };
        class: { name: string; section: string } | null;
    };
}

export default function RefundsClient({
    initialRefunds,
    completedRefunds = [] // Default to empty array if not passed
}: {
    initialRefunds: RefundRequest[],
    completedRefunds?: any[]
}) {
    const [refunds, setRefunds] = useState(initialRefunds);
    const [loading, setLoading] = useState(false);

    const handleProcess = async (id: string, action: 'APPROVE' | 'REJECT') => {
        if (!confirm(`Are you sure you want to ${action} this request?`)) return;
        setLoading(true);
        const res = await processRefund(id, action, 'ADMIN');
        if (res.success) {
            toast.success(`Request ${action}D`);
            setRefunds(prev => prev.map(r => r.id === id ? { ...r, status: action === 'APPROVE' ? 'APPROVED' : 'REJECTED' } : r));
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-800 rounded-full text-blue-600 dark:text-blue-200">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-blue-600 dark:text-blue-300">Pending Requests</p>
                            <h3 className="text-2xl font-bold text-blue-800 dark:text-blue-100">
                                {refunds.filter(r => r.status === 'PENDING').length}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-900">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-800 rounded-full text-purple-600 dark:text-purple-200">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-purple-600 dark:text-purple-300">Total Refunded</p>
                            <h3 className="text-2xl font-bold text-purple-800 dark:text-purple-100">
                                {completedRefunds.length}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Refund Requests (Student Initiated)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 pb-4">
                                <tr>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Reason</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {refunds.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            No refund requests found.
                                        </td>
                                    </tr>
                                )}
                                {refunds.map((refund) => (
                                    <tr key={refund.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800 dark:text-slate-200">
                                                {refund.student.user.name}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Class {refund.student.class?.name || 'N/A'}-{refund.student.class?.section}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                                            ₹{refund.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={refund.reason}>
                                                {refund.reason}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {new Date(refund.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={refund.status === 'PENDING' ? 'outline' : refund.status === 'APPROVED' ? 'default' : 'destructive'}>
                                                {refund.status}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {refund.status === 'PENDING' && (
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200" onClick={() => handleProcess(refund.id, 'APPROVE')} disabled={loading}>
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={() => handleProcess(refund.id, 'REJECT')} disabled={loading}>
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                    <CardTitle>Processed Refunds (All History)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-900 dark:text-indigo-200 pb-4">
                                <tr>
                                    <th className="px-4 py-3">Receipt No</th>
                                    <th className="px-4 py-3">Student</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Remarks</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {completedRefunds.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                            No refund history found.
                                        </td>
                                    </tr>
                                )}
                                {completedRefunds.map((refund) => (
                                    <tr key={refund.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-4 py-3 font-mono text-xs">
                                            {refund.receiptNo || refund.id.slice(0, 8)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-slate-800 dark:text-slate-200">
                                                {refund.studentFee?.student?.user?.name || 'Unknown'}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                Class {refund.studentFee?.student?.class?.name || 'N/A'}-{refund.studentFee?.student?.class?.section}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-red-600">
                                            -₹{refund.amount.toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="max-w-[200px] truncate text-slate-600 dark:text-slate-400" title={refund.remarks}>
                                                {refund.remarks || '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">
                                            {new Date(refund.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant="destructive">
                                                REFUNDED
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
