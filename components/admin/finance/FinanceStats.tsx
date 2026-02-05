'use client';

import { useState } from 'react';
import { IndianRupee, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming utils exist, or just use class string

type FinanceSummary = {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    feeCollected: number;
    allTime: {
        totalIncome: number;
        totalExpenses: number;
        netProfit: number;
        feeCollected: number;
    }
};

export default function FinanceStats({ summary }: { summary: FinanceSummary }) {
    const [view, setView] = useState<'MONTH' | 'YEAR'>('YEAR');

    const data = view === 'YEAR' ? summary.allTime : summary;

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg inline-flex">
                    <button
                        onClick={() => setView('MONTH')}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            view === 'MONTH'
                                ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                    >
                        This Month
                    </button>
                    <button
                        onClick={() => setView('YEAR')}
                        className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                            view === 'YEAR'
                                ? "bg-white dark:bg-slate-700 text-indigo-600 shadow-sm"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        )}
                    >
                        This Year
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg gpu-accelerated">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 opacity-80" />
                        <span className="text-xs md:text-sm font-medium opacity-90">
                            {view === 'YEAR' ? 'This Year' : 'This Month'}
                        </span>
                    </div>
                    <p className="text-sm opacity-75 mb-1">Total Income</p>
                    <p className="text-2xl md:text-3xl font-bold">₹{(data.totalIncome || 0).toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg gpu-accelerated">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingDown className="w-8 h-8 opacity-80" />
                        <span className="text-xs md:text-sm font-medium opacity-90">
                            {view === 'YEAR' ? 'This Year' : 'This Month'}
                        </span>
                    </div>
                    <p className="text-sm opacity-75 mb-1">Total Expenses</p>
                    <p className="text-2xl md:text-3xl font-bold">₹{(data.totalExpenses || 0).toLocaleString()}</p>
                </div>

                <div className={cn(
                    "rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg gpu-accelerated bg-gradient-to-br",
                    data.netProfit >= 0 ? "from-blue-500 to-blue-600" : "from-orange-500 to-orange-600"
                )}>
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 opacity-80" />
                        <span className="text-xs md:text-sm font-medium opacity-90">
                            {data.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                        </span>
                    </div>
                    <p className="text-sm opacity-75 mb-1">Total Profit/Loss</p>
                    <p className="text-2xl md:text-3xl font-bold">₹{Math.abs(data.netProfit || 0).toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg gpu-accelerated">
                    <div className="flex items-center justify-between mb-2">
                        <IndianRupee className="w-8 h-8 opacity-80" />
                        <span className="text-xs md:text-sm font-medium opacity-90">
                            {view === 'YEAR' ? 'This Year' : 'This Month'}
                        </span>
                    </div>
                    <p className="text-sm opacity-75 mb-1">Fee Collection</p>
                    <p className="text-2xl md:text-3xl font-bold">₹{(data.feeCollected || 0).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
}
