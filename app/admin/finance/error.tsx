'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinanceError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Finance Module Error:', error);
    }, [error]);

    return (
        <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 bg-background p-4 text-center">
            <div className="rounded-full bg-red-100 p-6 dark:bg-red-900/20">
                <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                    Something went wrong!
                </h2>
                <p className="max-w-[500px] text-muted-foreground">
                    We encountered an error in the Finance Module. This might be due to a network issue, missing data, or a temporary system glitch.
                </p>
                <div className="rounded-md bg-slate-100 p-4 text-left text-xs font-mono text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {error.message || "Unknown Runtime Error"}
                </div>
            </div>
            <div className="flex gap-4">
                <Button onClick={() => window.location.reload()} variant="outline">
                    Refresh Page
                </Button>
                <Button onClick={() => reset()} className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                    <RefreshCcw className="h-4 w-4" />
                    Try Again
                </Button>
            </div>
        </div>
    );
}
