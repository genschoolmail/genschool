'use client';

import React from 'react';
import { Download } from 'lucide-react';

interface DownloadButtonProps {
    paymentId: string;
    receiptNumber: string;
}

export default function DownloadButton({ paymentId, receiptNumber }: DownloadButtonProps) {
    const handleDownload = () => {
        // Use browser's print-to-PDF functionality
        window.print();

        // Alternative: If you want to generate PDF programmatically, you'd need a library like jsPDF
        // For now, we're using the print dialog which allows saving as PDF
    };

    return (
        <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
        >
            <Download className="w-4 h-4" />
            Download PDF
        </button>
    );
}
