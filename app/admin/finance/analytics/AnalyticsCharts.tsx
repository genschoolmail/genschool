'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

type MonthlyData = {
    month: string;
    feeCollection: number;
    otherIncome: number;
    totalIncome: number;
    expenses: number;
    salaries: number;
    totalExpenses: number;
    profit: number;
};

type CategoryData = {
    category: string;
    amount: number;
    count: number;
};

type IncomeSourceData = {
    source: string;
    amount: number;
    count: number;
};

export default function AnalyticsCharts({
    monthlyTrends,
    categoryExpenses,
    incomeBySource
}: {
    monthlyTrends: MonthlyData[],
    categoryExpenses: CategoryData[],
    incomeBySource: IncomeSourceData[]
}) {
    const [activeTab, setActiveTab] = useState('trends');

    // Calculate summary stats
    const totalIncome = monthlyTrends.reduce((sum, m) => sum + m.totalIncome, 0);
    const totalExpenses = monthlyTrends.reduce((sum, m) => sum + m.totalExpenses, 0);
    const netProfit = totalIncome - totalExpenses;
    const profitMargin = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                    <DollarSign className="w-8 h-8 opacity-80 mb-2" />
                    <p className="text-sm opacity-90">Total Income (6M)</p>
                    <p className="text-3xl font-bold mt-1">₹{totalIncome.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
                    <TrendingDown className="w-8 h-8 opacity-80 mb-2" />
                    <p className="text-sm opacity-90">Total Expenses (6M)</p>
                    <p className="text-3xl font-bold mt-1">₹{totalExpenses.toLocaleString()}</p>
                </div>

                <div className={`bg-gradient-to-br ${netProfit >= 0 ? 'from-green-500 to-green-600' : 'from-orange-500 to-orange-600'} rounded-xl p-6 text-white shadow-lg`}>
                    <TrendingUp className="w-8 h-8 opacity-80 mb-2" />
                    <p className="text-sm opacity-90">Net Profit (6M)</p>
                    <p className="text-3xl font-bold mt-1">₹{netProfit.toLocaleString()}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                    <Calendar className="w-8 h-8 opacity-80 mb-2" />
                    <p className="text-sm opacity-90">Profit Margin</p>
                    <p className="text-3xl font-bold mt-1">{profitMargin.toFixed(1)}%</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex border-b border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'trends'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Monthly Trends
                    </button>
                    <button
                        onClick={() => setActiveTab('comparison')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'comparison'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Income vs Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('breakdown')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'breakdown'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Category Breakdown
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'trends' && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">6-Month Revenue Trend</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <LineChart data={monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                    <Line type="monotone" dataKey="totalIncome" stroke="#3b82f6" name="Total Income" strokeWidth={2} />
                                    <Line type="monotone" dataKey="feeCollection" stroke="#10b981" name="Fee Collection" strokeWidth={2} />
                                    <Line type="monotone" dataKey="profit" stroke="#8b5cf6" name="Profit" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'comparison' && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Income vs Expenses Comparison</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={monthlyTrends}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                    <Legend />
                                    <Bar dataKey="totalIncome" fill="#10b981" name="Total Income" />
                                    <Bar dataKey="totalExpenses" fill="#ef4444" name="Total Expenses" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {activeTab === 'breakdown' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Expenses by Category</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={categoryExpenses}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry: any) => `${entry.category}: ₹${entry.amount.toLocaleString()}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="amount"
                                        >
                                            {categoryExpenses.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Income by Source</h3>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={incomeBySource}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={(entry: any) => `${entry.source}: ₹${entry.amount.toLocaleString()}`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="amount"
                                        >
                                            {incomeBySource.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
