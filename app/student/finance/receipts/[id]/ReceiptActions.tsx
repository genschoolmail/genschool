'use client';

import React from 'react';
import { Download, Printer, Mail } from 'lucide-react';

interface ReceiptActionsProps {
    paymentId: string;
    receiptNumber: string;
}

export default function ReceiptActions({ paymentId, receiptNumber }: ReceiptActionsProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex gap-3 print:hidden">
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
                <Download className="w-4 h-4" />
                Download PDF
            </button>
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
                <Printer className="w-4 h-4" />
                Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
                <Mail className="w-4 h-4" />
                Email
            </button>
        </div>
    );
}
