'use client';

import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { generateIncomeReport, generateExpenseReport, ReportData } from '@/lib/report-actions';
import { toast } from 'sonner';

export function PrintButton() {
    return (
        <div className="flex gap-2">
            <ExportButton />
            <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 font-medium flex items-center gap-2"
            >
                <FileText className="w-4 h-4" />
                Print View
            </button>
        </div>
    );
}

function ExportButton() {
    const [loading, setLoading] = useState(false);

    const handleExport = async (type: 'INCOME' | 'EXPENSE') => {
        setLoading(true);
        try {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            // Fetch data
            let data: ReportData[] = [];
            if (type === 'INCOME') {
                data = await generateIncomeReport(startOfMonth, endOfMonth);
            } else {
                data = await generateExpenseReport(startOfMonth, endOfMonth);
            }

            if (data.length === 0) {
                toast.error("No data found for this month");
                setLoading(false);
                return;
            }

            // Convert to CSV
            const headers = ['Date', 'Category', 'Description', 'Amount', 'Status', 'Reference', 'Payment Method'];
            const csvContent = [
                headers.join(','),
                ...data.map(row => [
                    new Date(row.date).toLocaleDateString('en-IN'),
                    `"${row.category}"`,
                    `"${row.description.replace(/"/g, '""')}"`,
                    row.amount,
                    row.status,
                    row.reference || '',
                    row.paymentMethod || ''
                ].join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${type}_REPORT_${now.toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success(`${type} Report downloaded!`);
        } catch (error) {
            console.error(error);
            toast.error("Export failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleExport('INCOME')}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 font-medium disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export Income
            </button>
            <button
                onClick={() => handleExport('EXPENSE')}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium disabled:opacity-50"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Export Expenses
            </button>
        </div>
    );
}
