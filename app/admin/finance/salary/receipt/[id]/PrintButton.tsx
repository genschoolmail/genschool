'use client';

import React from 'react';
import { Download, Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => typeof window !== 'undefined' && window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors no-print"
        >
            <Printer className="w-4 h-4" />
            <span>Print / Download</span>
        </button>
    );
}
