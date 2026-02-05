'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function TeacherFinanceError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Teacher Finance Error:', error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full">
                <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Unable to load finance data
            </h2>
            <p className="text-slate-500 max-w-sm">
                We encountered an error while loading your salary or loan details.
            </p>
            <div className="text-xs font-mono bg-slate-100 dark:bg-slate-800 p-2 rounded text-red-500 max-w-sm break-all">
                {error.message || "Unknown error"}
            </div>
            <div className="flex gap-3 pt-4">
                <Button onClick={() => reset()} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <RefreshCcw className="w-4 h-4" />
                    Try Again
                </Button>
                <Link href="/teacher">
                    <Button variant="outline" className="gap-2">
                        <Home className="w-4 h-4" />
                        Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}
