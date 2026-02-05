'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function AdminError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Admin Error:', error);
    }, [error]);

    return (
        <div className="flex items-center justify-center p-4 min-h-[60vh]">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                    Error Loading Page
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                    {error.message || 'Unable to load this page. Please try again.'}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                    <button
                        onClick={() => window.location.href = '/admin'}
                        className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
