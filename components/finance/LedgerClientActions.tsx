'use client';

import React from 'react';
import { Download, Printer, FileSpreadsheet, FileText } from 'lucide-react';
// import * as XLSX from 'xlsx'; // Temporarily disabled due to build error

interface Transaction {
    id: string;
    date: Date | string; // serialized from server
    description: string;
    category: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    mode?: string;
    reference?: string | null;
}

interface LedgerClientActionsProps {
    transactions: Transaction[];
    startDate?: string;
    endDate?: string;
}

export default function LedgerClientActions({ transactions, startDate, endDate }: LedgerClientActionsProps) {

    const handleExportCSV = () => {
        // Prepare CSV headers
        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Mode', 'Reference'];

        // Prepare CSV rows
        const rows = transactions.map(t => [
            new Date(t.date).toLocaleDateString('en-IN'),
            t.description,
            t.category,
            t.type,
            t.amount.toString(),
            t.mode || '',
            t.reference || ''
        ]);

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', `Ledger_${startDate || 'All'}_to_${endDate || 'All'}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        // Build query string
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        // Open print page in new window
        window.open(`/print/ledger?${params.toString()}`, '_blank');
    };

    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                title="Download as CSV"
            >
                <FileSpreadsheet className="w-4 h-4" />
                Export CSV
            </button>

            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                title="Print / Save as PDF"
            >
                <Printer className="w-4 h-4" />
                Print / PDF
            </button>
        </div>
    );
}
