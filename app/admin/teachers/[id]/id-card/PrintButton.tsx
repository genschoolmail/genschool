'use client';

import React from 'react';
import { Printer, Download, Share2 } from 'lucide-react';

export function PrintButton() {
    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        // Use browser's print dialog with suggestion to save as PDF
        window.print();
    };

    const handleShare = async () => {
        // Check if Web Share API is available
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Teacher ID Card',
                    text: 'Teacher ID Card from School Management System',
                    url: window.location.href
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            // Fallback: Copy URL to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
            >
                <Printer className="w-4 h-4" />
                Print
            </button>
            <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
                <Download className="w-4 h-4" />
                Download PDF
            </button>
            <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
            >
                <Share2 className="w-4 h-4" />
                Share
            </button>
        </div>
    );
}
