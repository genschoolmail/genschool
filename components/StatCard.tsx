import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: string; // Expecting tailwind color classes like 'text-indigo-600'
    trend?: string;
}

export default function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
    // Extract base color name for background opacity (simplified approach)
    // Assuming color format like "text-blue-600"
    const baseColorClass = color.split(' ')[0].replace('text-', 'bg-').replace('600', '100');

    return (
        <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-soft border border-slate-100 dark:border-slate-700/50 hover:shadow-medium hover:-translate-y-1 transition-all duration-300 group gpu-accelerated">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white mt-1 md:mt-2 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{value}</h3>
                    {trend && (
                        <div className="flex items-center mt-1 md:mt-2 flex-wrap gap-1">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-full flex items-center">
                                {trend}
                            </span>
                            <span className="text-xs text-slate-400 hidden sm:inline">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`p-2.5 md:p-3 rounded-lg md:rounded-xl ${baseColorClass} dark:bg-opacity-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shrink-0`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${color}`} />
                </div>
            </div>
        </div>
    );
}
