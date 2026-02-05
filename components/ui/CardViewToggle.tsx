'use client';

import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardViewToggleProps {
    view: 'list' | 'card';
    onViewChange: (view: 'list' | 'card') => void;
    className?: string;
}

export default function CardViewToggle({ view, onViewChange, className }: CardViewToggleProps) {
    return (
        <div className={cn("flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1", className)}>
            <button
                onClick={() => onViewChange('list')}
                className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    view === 'list'
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                aria-label="List view"
            >
                <List className="w-4 h-4" />
            </button>
            <button
                onClick={() => onViewChange('card')}
                className={cn(
                    "p-1.5 rounded-md transition-all duration-200",
                    view === 'card'
                        ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                )}
                aria-label="Card view"
            >
                <LayoutGrid className="w-4 h-4" />
            </button>
        </div>
    );
}
