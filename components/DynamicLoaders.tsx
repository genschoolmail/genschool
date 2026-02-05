import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Dynamically import heavy components to reduce initial bundle size
export const DynamicChart = dynamic(() => import('./Chart'), {
    loading: () => <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-64 rounded-lg" />,
    ssr: false,
});

export const DynamicDataTable = dynamic(() => import('./DataTable'), {
    loading: () => <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-96 rounded-lg" />,
});

// Helper function to create lazy-loaded components
export function createLazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: React.ReactNode
) {
    return dynamic(importFn, {
        loading: () => (fallback || <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-32 rounded-lg" />) as JSX.Element,
    });
}

// Preload critical components
export function preloadComponent(importFn: () => Promise<any>) {
    if (typeof window !== 'undefined') {
        importFn();
    }
}
