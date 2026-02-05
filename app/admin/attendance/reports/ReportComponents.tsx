'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download } from 'lucide-react';

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 print:hidden"
        >
            <Download className="w-4 h-4" />
            Print Report
        </button>
    );
}

export function ReportFilters({ classes }: { classes: { id: string; name: string; section: string }[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedClassId = searchParams.get('classId') || '';
    const reportType = searchParams.get('reportType') || 'weekly';

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams);
        if (e.target.value) {
            params.set('classId', e.target.value);
        } else {
            params.delete('classId');
        }
        router.push(`?${params.toString()}`);
    };

    const handleReportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams);
        params.set('reportType', e.target.value);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 print:hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Select Class</label>
                    <select
                        value={selectedClassId}
                        onChange={handleClassChange}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                    >
                        <option value="">Choose a class...</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>
                                Class {cls.name}-{cls.section}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Report Type</label>
                    <select
                        value={reportType}
                        onChange={handleReportTypeChange}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"
                    >
                        <option value="weekly">Weekly (Last 7 days)</option>
                        <option value="monthly">Monthly (Last 30 days)</option>
                        <option value="yearly">Yearly (Last 365 days)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
