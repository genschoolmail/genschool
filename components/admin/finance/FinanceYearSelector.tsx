'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

type AcademicYear = {
    id: string;
    name: string;
    isCurrent: boolean;
};

export function FinanceYearSelector({ years }: { years: AcademicYear[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [selectedYear, setSelectedYear] = useState<string>("");

    useEffect(() => {
        // If query param exists, use it
        const paramYear = searchParams.get('year');
        if (paramYear) {
            setSelectedYear(paramYear);
        } else {
            // Else default to current
            const current = years.find(y => y.isCurrent);
            if (current) setSelectedYear(current.id);
        }
    }, [searchParams, years]);

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set('year', value);
        } else {
            params.delete('year');
        }
        router.push(`?${params.toString()}`);
    };

    if (years.length === 0) return null;

    return (
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-slate-500 ml-2" />
            <Select value={selectedYear} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px] h-8 border-0 bg-transparent focus:ring-0 text-sm font-medium">
                    <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.isCurrent && "(Current)"}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
