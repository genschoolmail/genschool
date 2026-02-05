"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    CreditCard,
    ArrowLeftRight,
    Settings,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Zap,
    ExternalLink
} from "lucide-react";
import { format } from "date-fns";

interface Transaction {
    id: string;
    amount: number;
    method: string;
    date: Date | string;
    status: string;
    reference: string | null;
    platformFee: number;
    schoolShare: number;
    splitStatus: string;
    transferId: string | null;
    studentFee: {
        student: {
            user: {
                name: string | null;
            }
        }
    }
}

interface PayoutsClientProps {
    initialTransactions: any[];
    gateways: any[];
    schoolInfo: any;
}

export default function PayoutsClient({ initialTransactions, gateways, schoolInfo }: PayoutsClientProps) {
    const [transactions] = useState<Transaction[]>(initialTransactions || []);

    let bankDetails = null;
    if (schoolInfo?.bankDetails) {
        try {
            bankDetails = JSON.parse(schoolInfo.bankDetails);
        } catch (e) {
            bankDetails = null;
        }
    }

    return (
        <Tabs defaultValue="transactions" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
                <TabsTrigger value="transactions" className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Transactions
                </TabsTrigger>
                <TabsTrigger value="payouts" className="flex items-center gap-2">
                    <ArrowLeftRight className="w-4 h-4" />
                    Settlements
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configuration
                </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Online Transactions</CardTitle>
                        <CardDescription>Recent student payments through online gateways</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-sm">Student</th>
                                        <th className="p-4 text-left font-semibold text-sm">Amount</th>
                                        <th className="p-4 text-left font-semibold text-sm">Date</th>
                                        <th className="p-4 text-left font-semibold text-sm">Status</th>
                                        <th className="p-4 text-left font-semibold text-sm">Reference</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {transactions.length > 0 ? (
                                        transactions.map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <span className="font-medium text-slate-800 dark:text-white">
                                                        {tx.studentFee?.student?.user?.name || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="font-bold text-indigo-600">
                                                        ₹{tx.amount.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-slate-500">
                                                    {format(new Date(tx.date), 'MMM dd, yyyy HH:mm')}
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5">
                                                        {tx.status === 'SUCCESS' ? (
                                                            <span className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Success
                                                            </span>
                                                        ) : tx.status === 'FAILED' ? (
                                                            <span className="flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                                                                <XCircle className="w-3 h-3" />
                                                                Failed
                                                            </span>
                                                        ) : (
                                                            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                                                                <Clock className="w-3 h-3" />
                                                                Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs font-mono text-slate-400 truncate max-w-[150px]">
                                                    {tx.reference || '-'}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                                                No online transactions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Bank Settlements</CardTitle>
                        <CardDescription>Status of fund transfers to your verified bank account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-800/50">
                                    <tr>
                                        <th className="p-4 text-left font-semibold text-sm">Transfer ID</th>
                                        <th className="p-4 text-left font-semibold text-sm">School Share</th>
                                        <th className="p-4 text-left font-semibold text-sm">Plat. Fee</th>
                                        <th className="p-4 text-left font-semibold text-sm">Split Status</th>
                                        <th className="p-4 text-left font-semibold text-sm">Payment Ref</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {transactions.filter(tx => tx.status === 'SUCCESS').length > 0 ? (
                                        transactions.filter(tx => tx.status === 'SUCCESS').map((tx) => (
                                            <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4 text-sm font-mono text-indigo-600">
                                                    {tx.transferId || 'Processing...'}
                                                </td>
                                                <td className="p-4 font-semibold text-green-600">
                                                    ₹{tx.schoolShare.toLocaleString()}
                                                </td>
                                                <td className="p-4 text-sm text-slate-500">
                                                    ₹{tx.platformFee.toLocaleString()}
                                                </td>
                                                <td className="p-4">
                                                    {tx.splitStatus === 'SUCCESS' ? (
                                                        <span className="flex items-center gap-1 text-green-600 text-xs font-bold">
                                                            <CheckCircle className="w-3 h-3" />
                                                            SETTLED
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-yellow-600 text-xs font-bold animate-pulse">
                                                            <Clock className="w-3 h-3" />
                                                            IN PROGRESS
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-xs font-mono text-slate-400 truncate max-w-[120px]">
                                                    {tx.reference}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="p-12 text-center text-slate-500 italic">
                                                No settlements to show yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Gateway Config */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-500" />
                                Active Gateways
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {gateways.length > 0 ? (
                                gateways.map(g => (
                                    <div key={g.id} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold">{g.provider}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${g.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                                {g.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 font-mono">MID: {g.merchantId}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 italic">No gateways configured.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Settlement Config */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-green-600" />
                                Settlement Account
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {bankDetails ? (
                                <div className="space-y-3">
                                    <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30">
                                        <p className="text-sm text-slate-500 mb-1">Bank Name</p>
                                        <p className="font-bold text-slate-800 dark:text-white">{bankDetails.bankName}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <CheckCircle className="w-4 h-4 text-green-600" />
                                            <span className="text-xs font-semibold text-green-700">KYC Verified</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <p className="text-[10px] text-slate-500 uppercase">Comm. Share</p>
                                            <p className="text-lg font-bold text-indigo-600">{schoolInfo?.commissionPercentage || 2.5}%</p>
                                        </div>
                                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                            <p className="text-[10px] text-slate-500 uppercase">Settlement</p>
                                            <p className="text-lg font-bold text-green-600">T+2 Days</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-6 border-2 border-dashed rounded-xl">
                                    <p className="text-sm text-slate-500 mb-4">No bank account details verified yet.</p>
                                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                                        Complete KYC
                                    </button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                    <CardContent className="p-4 flex gap-4 items-start text-blue-800 dark:text-blue-300">
                        <ArrowLeftRight className="w-6 h-6 shrink-0 mt-1" />
                        <div>
                            <p className="font-semibold mb-1">How Settlements Work</p>
                            <p className="text-sm">
                                Student payments are instantly split between the school and the platform.
                                Your share is directly transferred to your verified bank account via <strong>{gateways[0]?.provider || 'Razorpay'} Route</strong>.
                                Settlement typicaly takes 2-3 business days.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
