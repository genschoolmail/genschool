import React from 'react';
import { BarChart3, TrendingUp, Users, Award } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';

export default function AcademicReportsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <BackButton href="/admin/academics" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <BarChart3 className="w-8 h-8 text-indigo-600" />
                        Academic Reports & Analytics
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Performance insights and data analysis
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link
                    href="/admin/reports/academic/class-performance"
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Class Performance</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Comparative analysis</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/admin/reports/academic/subject-analysis"
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                            <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Subject Analysis</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Subject-wise stats</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/admin/reports/academic/rankings"
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                            <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Student Rankings</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Ranks & percentiles</p>
                        </div>
                    </div>
                </Link>

                <Link
                    href="/admin/reports/academic/toppers"
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                            <Award className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Toppers List</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Top 10 performers</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
}
