'use client';
import { Printer } from 'lucide-react';

export default function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-sm transition-all active:scale-95"
        >
            <Printer className="w-4 h-4" />
            Print Receipt
        </button>
    );
}
