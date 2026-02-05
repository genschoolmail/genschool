"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, IndianRupee, CreditCard, Banknote, Receipt, Download, FileSpreadsheet, Printer } from "lucide-react";
import { getDailyCollection } from "@/lib/report-actions";
import { exportToCSV, exportToExcel, printContent } from "@/lib/export-utils";

interface CollectionClientProps {
    initialData: any;
    initialDate: string;
}

export default function CollectionClient({ initialData, initialDate }: CollectionClientProps) {
    const [data, setData] = useState(initialData);
    const [date, setDate] = useState(initialDate);
    const [loading, setLoading] = useState(false);

    const handleDateChange = async (newDate: string) => {
        setDate(newDate);
        setLoading(true);
        const result = await getDailyCollection(new Date(newDate));
        setData(result);
        setLoading(false);
    };

    const handleExport = (type: 'csv' | 'excel') => {
        const exportData = data.payments.map((p: any) => ({
            receiptNo: p.receiptNo || '-',
            student: p.studentFee?.student?.user?.name || '',
            class: `${p.studentFee?.student?.class?.name || ''}-${p.studentFee?.student?.class?.section || ''}`,
            feeType: p.studentFee?.feeStructure?.feeHead?.name || '',
            mode: p.paymentMode,
            amount: p.amount
        }));

        const columns = [
            { key: 'receiptNo', label: 'Receipt #' },
            { key: 'student', label: 'Student' },
            { key: 'class', label: 'Class' },
            { key: 'feeType', label: 'Fee Type' },
            { key: 'mode', label: 'Payment Mode' },
            { key: 'amount', label: 'Amount (₹)' }
        ];

        if (type === 'csv') {
            exportToCSV(exportData, `collection_${date}`, columns);
        } else {
            exportToExcel(exportData, `collection_${date}`, columns);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Receipt className="h-8 w-8 text-green-600" />
                        Daily Collection Report
                    </h1>
                    <p className="text-muted-foreground">Fee payments collected on a specific date</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="gap-2">
                        <Download className="h-4 w-4" /> CSV
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="gap-2">
                        <FileSpreadsheet className="h-4 w-4" /> Excel
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => printContent('collection-table', `Daily Collection - ${date}`)} className="gap-2">
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                    <div className="flex items-center gap-2 ml-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <Input
                            type="date"
                            value={date}
                            onChange={e => handleDateChange(e.target.value)}
                            className="w-auto"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <IndianRupee className="h-4 w-4" />
                            Total Collected
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{data.summary.totalCollected.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Banknote className="h-4 w-4" />
                            Cash
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{data.summary.totalCash.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Online
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{data.summary.totalOnline.toLocaleString()}</p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-slate-800">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Receipt className="h-4 w-4 text-slate-600" />
                            Transactions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{data.summary.transactionCount}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Transaction Table */}
            <Card className="bg-white dark:bg-slate-800" id="collection-table">
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-muted-foreground">Loading...</div>
                    ) : data.payments.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No payments on this date</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="p-3 font-semibold">Receipt #</th>
                                        <th className="p-3 font-semibold">Student</th>
                                        <th className="p-3 font-semibold">Class</th>
                                        <th className="p-3 font-semibold">Fee Type</th>
                                        <th className="p-3 font-semibold">Mode</th>
                                        <th className="p-3 font-semibold text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.payments.map((payment: any) => (
                                        <tr key={payment.id} className="border-b border-slate-100 dark:border-slate-700">
                                            <td className="p-3 font-mono text-sm">{payment.receiptNo || '-'}</td>
                                            <td className="p-3">{payment.studentFee?.student?.user?.name}</td>
                                            <td className="p-3">{payment.studentFee?.student?.class?.name}-{payment.studentFee?.student?.class?.section}</td>
                                            <td className="p-3">{payment.studentFee?.feeStructure?.feeHead?.name}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${payment.paymentMode === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {payment.paymentMode}
                                                </span>
                                            </td>
                                            <td className="p-3 text-right font-bold text-green-600">₹{payment.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
