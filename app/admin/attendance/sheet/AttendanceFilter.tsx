'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AttendanceFilter({
    classes,
    selectedClassId,
    selectedMonth
}: {
    classes: any[],
    selectedClassId: string,
    selectedMonth: Date
}) {
    const router = useRouter();

    return (
        <form className="flex gap-4">
            <select
                name="classId"
                defaultValue={selectedClassId}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                onChange={(e) => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('classId', e.target.value);
                    router.push(`?${params.toString()}`);
                }}
            >
                {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                ))}
            </select>
            <input
                type="month"
                name="month"
                defaultValue={selectedMonth.toISOString().slice(0, 7)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700"
                onChange={(e) => {
                    const params = new URLSearchParams(window.location.search);
                    params.set('month', e.target.value);
                    router.push(`?${params.toString()}`);
                }}
            />
            <button type="button" onClick={() => window.print()} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 print:hidden">Print Sheet</button>
        </form>
    );
}
