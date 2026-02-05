import React from 'react';
import { cn } from '@/lib/utils';

interface DataCardProps {
    title: string;
    subtitle?: string;
    status?: React.ReactNode;
    actions?: React.ReactNode;
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export function DataCard({
    title,
    subtitle,
    status,
    actions,
    children,
    className,
    onClick
}: DataCardProps) {
    return (
        <div
            className={cn(
                "bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden transition-all duration-200",
                onClick && "active:scale-[0.98] touch-target cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white truncate text-base">
                        {title}
                    </h3>
                    {subtitle && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {subtitle}
                        </p>
                    )}
                </div>
                {status && (
                    <div className="shrink-0">
                        {status}
                    </div>
                )}
            </div>

            {children && (
                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {children}
                </div>
            )}

            {actions && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-end gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

export function DataCardRow({ label, value, icon, className }: { label: string; value: React.ReactNode; icon?: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex justify-between items-center py-1", className)}>
            <div className="flex items-center gap-1.5">
                {icon && <span className="text-slate-400 dark:text-slate-500 flex-shrink-0">{icon}</span>}
                <span className="text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide font-medium">{label}</span>
            </div>
            <span className="font-medium text-slate-900 dark:text-slate-200 text-right truncate pl-2">{value}</span>
        </div>
    );
}
