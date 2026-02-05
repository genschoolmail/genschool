'use client';

import React from 'react';
import { Download } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors print:hidden"
        >
            <Download className="w-4 h-4" />
            Download PDF
        </button>
    );
}
