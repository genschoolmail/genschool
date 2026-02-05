import React from 'react';

export function Skeleton({ className = '', variant = 'default' }: { className?: string; variant?: 'default' | 'circle' | 'text' }) {
    const baseClass = 'animate-pulse bg-slate-200 dark:bg-slate-700';
    const variantClass = variant === 'circle' ? 'rounded-full' : variant === 'text' ? 'rounded' : 'rounded-lg';

    return <div className={`${baseClass} ${variantClass} ${className}`} />;
}

export function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-3">
                    <Skeleton className="h-4 w-24" variant="text" />
                    <Skeleton className="h-8 w-32" />
                    <Skeleton className="h-4 w-20" variant="text" />
                </div>
                <Skeleton className="h-12 w-12" variant="circle" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                <Skeleton className="h-6 w-48" />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                            {[1, 2, 3, 4].map((i) => (
                                <th key={i} className="p-4">
                                    <Skeleton className="h-4 w-full" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, i) => (
                            <tr key={i} className="border-b border-slate-100 dark:border-slate-700">
                                {[1, 2, 3, 4].map((j) => (
                                    <td key={j} className="p-4">
                                        <Skeleton className="h-4 w-full" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function SkeletonList({ items = 5 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12" variant="circle" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-3 w-3/4" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
