"use client";

import { useRouter } from 'next/navigation';
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
    TrendingUp, Clock, AlertCircle, CheckCircle2,
    IndianRupee, Receipt, FileText, Download, Calendar, History,
    ShieldCheck, Loader2
} from 'lucide-react';
import Link from 'next/link';

interface StudentFinanceClientProps {
    student: any;
    stats: {
        totalFees: number;
        totalPaid: number;
        totalPending: number;
        walletBalance: number;
    };
    payments: any[];
    studentFees: any[];
}

export default function StudentFinanceClient({ student, stats, payments, studentFees }: StudentFinanceClientProps) {
    const router = useRouter();

    // Filter fees
    const pendingFees = studentFees.filter((f: any) => f.status !== 'PAID');
    const paidFees = studentFees.filter((f: any) => f.status === 'PAID' || f.status === 'PARTIAL');

    // Get next due
    const nextDue = pendingFees.length > 0
        ? pendingFees.sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
        : null;

    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleDownloadReceipt = (paymentId: string) => {
        router.push(`/student/finance/receipts/${paymentId}`);
    };

    const handlePay = async (feeId: string, amount: number) => {
        try {
            setProcessingId(feeId);
            // Dynamic import to avoid build errors if actions not perfectly linked yet
            const { initiateStudentPayment } = await import('@/lib/payment-actions');

            const result = await initiateStudentPayment(feeId, amount);

            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                alert(result.error || 'Payment initiation failed');
                setProcessingId(null);
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Finance Portal</h1>
                    <p className="text-muted-foreground">Manage your fees, view history, and download receipts.</p>
                </div>
                <Link href="/student/finance/verify" className="w-full sm:w-auto">
                    <Button className="gap-2 w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 border-0 transition-all duration-300 transform hover:scale-105">
                        <ShieldCheck className="h-4 w-4" />
                        Verify Payment
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Stats Cards (Unchanged - simplified for brevity in this replace, keeping visually same) */}
                <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <IndianRupee className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium opacity-90">Total Fees</p>
                                <h3 className="text-2xl font-bold">₹{stats.totalFees.toLocaleString()}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-600 to-emerald-700 text-white border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <CheckCircle2 className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium opacity-90">Paid Amount</p>
                                <h3 className="text-2xl font-bold">₹{stats.totalPaid.toLocaleString()}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-none shadow-md">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <AlertCircle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium opacity-90">Pending Dues</p>
                                <h3 className="text-2xl font-bold">₹{stats.totalPending.toLocaleString()}</h3>
                            </div>
                        </div>
                    </CardContent>
                </Card>


            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4 lg:w-[400px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="fees">All Fees</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                    {nextDue && (
                        <div className="flex items-center justify-between p-4 mb-4 text-sm text-yellow-800 border border-yellow-300 rounded-lg bg-yellow-50 dark:bg-gray-800 dark:text-yellow-300 dark:border-yellow-800" role="alert">
                            <div className="flex items-center">
                                <Clock className="flex-shrink-0 inline w-5 h-5 mr-3" />
                                <div>
                                    <span className="font-medium">Upcoming Due:</span> {nextDue.feeStructure.name} - ₹{(nextDue.amount + nextDue.taxAmount - nextDue.discount - nextDue.paidAmount).toLocaleString()} is due on {new Date(nextDue.dueDate).toLocaleDateString()}.
                                </div>
                            </div>
                            <Button size="sm" onClick={() => handlePay(nextDue.id, nextDue.amount + nextDue.taxAmount - nextDue.discount - nextDue.paidAmount)} disabled={!!processingId}>
                                {processingId === nextDue.id ? <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" /> : 'Pay Now'}
                            </Button>
                        </div>
                    )}

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Payments</CardTitle>
                                <CardDescription>Your last 5 transactions</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {payments.slice(0, 5).map((payment) => (
                                        <div key={payment.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded transition-colors" onClick={() => handleDownloadReceipt(payment.id)}>
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600 dark:text-green-400">
                                                    <Receipt className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">
                                                        {payment.receiptNo || 'Processing...'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(payment.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-bold text-slate-900 dark:text-white block">
                                                    ₹{payment.amount.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-muted-foreground capitalize">{payment.method.toLowerCase()}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {payments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No payments found</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Fee Breakdown</CardTitle>
                                <CardDescription>Distribution of your fees</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {studentFees.slice(0, 5).map((fee: any) => (
                                        <div key={fee.id} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${fee.status === 'PAID' ? 'bg-green-500' : fee.status === 'PARTIAL' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                                <span className="text-sm font-medium">{fee.feeStructure.name}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">₹{fee.amount.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* PENDING TAB */}
                <TabsContent value="pending" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Dues</CardTitle>
                            <CardDescription>Fees that require your attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Fee Name</th>
                                            <th className="p-4 font-medium">Due Date</th>
                                            <th className="p-4 font-medium">Amount</th>
                                            <th className="p-4 font-medium">Due</th>
                                            <th className="p-4 font-medium">Status</th>
                                            <th className="p-4 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {pendingFees.map((fee: any) => {
                                            const dueAmount = fee.amount + (fee.taxAmount || 0) - fee.discount - fee.paidAmount;
                                            return (
                                                <tr key={fee.id} className="hover:bg-muted/50">
                                                    <td className="p-4 font-medium">{fee.feeStructure.name}</td>
                                                    <td className="p-4">{new Date(fee.dueDate).toLocaleDateString()}</td>
                                                    <td className="p-4">₹{fee.amount.toLocaleString()}</td>
                                                    <td className="p-4 font-bold text-red-600">
                                                        ₹{dueAmount.toLocaleString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge variant={fee.status === 'PARTIAL' ? 'secondary' : 'destructive'}>
                                                            {fee.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <Button size="sm" onClick={() => handlePay(fee.id, dueAmount)} disabled={!!processingId}>
                                                            {processingId === fee.id ? <Loader2 className="animate-spin h-4 w-4" /> : 'Pay Now'}
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                        {pendingFees.length === 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                                    No pending dues! Great job.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ALL FEES TAB */}
                <TabsContent value="fees" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Fee Records</CardTitle>
                            <CardDescription>Comprehensive list of all assigned fees</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Fee Name</th>
                                            <th className="p-4 font-medium">Date Assigned</th>
                                            <th className="p-4 font-medium">Total Amount</th>
                                            <th className="p-4 font-medium">Paid</th>
                                            <th className="p-4 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {studentFees.map((fee: any) => (
                                            <tr key={fee.id} className="hover:bg-muted/50">
                                                <td className="p-4 font-medium">{fee.feeStructure.name}</td>
                                                <td className="p-4">{new Date(fee.createdAt).toLocaleDateString()}</td>
                                                <td className="p-4">₹{(fee.amount + (fee.taxAmount || 0)).toLocaleString()}</td>
                                                <td className="p-4 text-green-600">₹{fee.paidAmount.toLocaleString()}</td>
                                                <td className="p-4">
                                                    <Badge variant={fee.status === 'PAID' ? 'default' : fee.status === 'PARTIAL' ? 'secondary' : 'outline'}>
                                                        {fee.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* HISTORY TAB */}
                <TabsContent value="history" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment History</CardTitle>
                            <CardDescription>View and download receipts for past payments</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Desktop Table (Unchanged) */}
                            <div className="hidden md:block rounded-md border overflow-x-auto">
                                <table className="w-full text-sm text-left whitespace-nowrap">
                                    <thead className="bg-muted/50 text-muted-foreground">
                                        <tr>
                                            <th className="p-4 font-medium">Receipt No</th>
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium">Method</th>
                                            <th className="p-4 font-medium">Amount</th>
                                            <th className="p-4 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {payments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => handleDownloadReceipt(payment.id)}>
                                                <td className="p-4 font-mono">{payment.receiptNo}</td>
                                                <td className="p-4">{new Date(payment.date).toLocaleDateString()}</td>
                                                <td className="p-4 capitalize">{payment.method.toLowerCase()}</td>
                                                <td className="p-4 font-bold">₹{payment.amount.toLocaleString()}</td>
                                                <td className="p-4 text-right">
                                                    <Button variant="ghost" size="sm" className="gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(payment.id); }}>
                                                        <Download className="h-4 w-4" />
                                                        Receipt
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {payments.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                                    No payment history found.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards (Unchanged) */}
                            <div className="md:hidden space-y-4">
                                {payments.map((payment) => (
                                    <div key={payment.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3 cursor-pointer" onClick={() => handleDownloadReceipt(payment.id)}>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-mono text-sm font-semibold text-slate-800 dark:text-white">
                                                    {payment.receiptNo || 'Processing...'}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {new Date(payment.date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Badge variant={payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                                {payment.status}
                                            </Badge>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
                                            <span className="font-bold text-slate-900 dark:text-white">₹{payment.amount.toLocaleString()}</span>
                                        </div>
                                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                            <Button size="sm" variant="outline" className="gap-2 w-full sm:w-auto" onClick={(e) => { e.stopPropagation(); handleDownloadReceipt(payment.id); }}>
                                                <Download className="h-4 w-4" />
                                                Download Receipt
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

