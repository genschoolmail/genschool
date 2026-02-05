'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors print:hidden flex items-center gap-2"
        >
            <Printer className="w-4 h-4" />
            Print Timetable
        </button>
    );
}
