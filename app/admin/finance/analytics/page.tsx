import React from 'react';
import { getMonthlyTrends, getCategoryWiseExpenses, getIncomeBySource } from '@/lib/analytics-actions';
import AnalyticsCharts from './AnalyticsCharts';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AnalyticsPage() {
    const monthlyTrends = await getMonthlyTrends(6);
    const categoryExpenses = await getCategoryWiseExpenses();
    const incomeBySource = await getIncomeBySource();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/admin/finance" className="text-slate-500 hover:text-slate-700">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Analytics</h1>
                    </div>
                    <p className="text-slate-500">Visual insights and trends for financial data</p>
                </div>
            </div>

            {/* Charts */}
            <AnalyticsCharts
                monthlyTrends={monthlyTrends}
                categoryExpenses={categoryExpenses}
                incomeBySource={incomeBySource}
            />
        </div>
    );
}
