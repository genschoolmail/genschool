import React from 'react';
import { getStudentFeesWithDiscount } from '@/lib/discount-actions';
import DiscountClient from './DiscountClient';
import { Percent, Search } from 'lucide-react';

export default async function DiscountPage({
    searchParams
}: {
    searchParams: { search?: string }
}) {
    const search = searchParams.search || '';
    const students = await getStudentFeesWithDiscount(search);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Percent className="w-8 h-8 text-indigo-600" />
                        Fee Discounts
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Manage and track student fee discounts
                    </p>
                </div>
            </div>

            <DiscountClient students={students} initialSearch={search} />
        </div>
    );
}
