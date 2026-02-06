import React from 'react';
import { getPlatformMetrics, getAllSchools } from '@/lib/actions/super-admin';
import { School, Users, CheckCircle, TrendingUp, Calendar, ArrowRight, FileCheck, Activity, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
    const metrics = await getPlatformMetrics();
    const allSchools = await getAllSchools();
    const recentSchools = allSchools.slice(0, 5);

    return (
        <div className="space-y-10 sm:space-y-12 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Intelligence Hub
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                        Global ecosystem monitoring and tenant oversight.
                    </p>
                </div>
                <Link
                    href="/super-admin/schools/new"
                    className="group relative px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3 overflow-hidden w-full sm:w-auto justify-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <School className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span className="relative z-10">Onboard School Unit</span>
                </Link>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8">
                <StatCard
                    title="Active Nodes"
                    value={metrics.totalSchools}
                    icon={<School className="w-6 h-6" />}
                    trend="+12% Expansion"
                    color="indigo"
                />
                <StatCard
                    title="Connected Users"
                    value={metrics.totalUsers}
                    icon={<Users className="w-6 h-6" />}
                    trend="+3.2k Peak"
                    color="blue"
                />
                <StatCard
                    title="Verification"
                    value={metrics.pendingKYC}
                    icon={<FileCheck className="w-6 h-6" />}
                    trend="Priority Action"
                    color="rose"
                    pulse={metrics.pendingKYC > 0}
                />
                <StatCard
                    title="Active Tiers"
                    value={metrics.activeSubscriptions}
                    icon={<CheckCircle className="w-6 h-6" />}
                    trend="99.8% Uptime"
                    color="emerald"
                />
                <StatCard
                    title="Gross Revenue"
                    value="₹12.4M"
                    icon={<TrendingUp className="w-6 h-6" />}
                    trend="+8.5% Growth"
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-12">
                {/* Recent Schools - Modern Sheet */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Ecosystem Directory</h2>
                        </div>
                        <Link href="/super-admin/schools" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 text-sm font-black flex items-center gap-1.5 group">
                            Full Registry <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                        </Link>
                    </div>

                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-200 dark:border-slate-800/50 overflow-hidden group/table">
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left min-w-[600px] border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/50">
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Unit</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subdomain</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Population</th>
                                        <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                    {recentSchools.map((school, i) => (
                                        <tr key={school.id} className="group/row hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-indigo-500 group-hover/row:scale-110 transition-transform">
                                                        {school.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-extrabold text-slate-800 dark:text-white tracking-tight">{school.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <code className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-indigo-500 dark:text-indigo-400 rounded-lg text-xs font-black tracking-tight">
                                                    {school.subdomain}
                                                </code>
                                            </td>
                                            <td className="p-6 hidden sm:table-cell">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-3.5 h-3.5 text-slate-400" />
                                                    <span className="font-bold text-slate-600 dark:text-slate-400">
                                                        {(school._count as any).students + (school._count as any).teachers}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${school.status === 'ACTIVE'
                                                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                    : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${school.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                                    {school.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Operations Pulse */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">Unit Pulse</h2>
                    </div>

                    <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-purple-500/5 border border-slate-200 dark:border-slate-800/50 p-8 h-full">
                        <div className="space-y-8">
                            {[
                                { icon: <Activity />, text: "Core systems operating nominal", time: "2m ago", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                                { icon: <School />, text: "New node 'GHS' data migration complete", time: "15m ago", color: "text-blue-500", bg: "bg-blue-500/10" },
                                { icon: <TrendingUp />, text: "Peak traffic detected in East Zone", time: "1h ago", color: "text-purple-500", bg: "bg-purple-500/10" },
                                { icon: <ShieldCheck />, text: "Global audit completed successfully", time: "3h ago", color: "text-indigo-500", bg: "bg-indigo-500/10" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5 items-start group/pulse-item">
                                    <div className={`mt-1 p-3 rounded-2xl ${item.bg} ${item.color} group-hover/pulse-item:scale-110 transition-transform shadow-lg`}>
                                        {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-800 dark:text-slate-200 font-extrabold leading-snug group-hover/pulse-item:text-indigo-500 transition-colors">
                                            {item.text}
                                        </p>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 block">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-12 pt-8 text-center border-t border-slate-100 dark:border-slate-800/50">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-full">
                                Audit Status: Secure
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend, color, pulse }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend: string;
    color: 'indigo' | 'blue' | 'rose' | 'emerald' | 'amber';
    pulse?: boolean;
}) {
    const colors = {
        indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 shadow-indigo-500/10',
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 shadow-blue-500/10',
        rose: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 shadow-rose-500/10',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20 shadow-emerald-500/10',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400 border-amber-200 dark:border-amber-500/20 shadow-amber-500/10',
    };

    return (
        <div className={`group bg-white/50 dark:bg-slate-900 border ${colors[color]} p-7 rounded-[2.5rem] shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-indigo-500/10 relative overflow-hidden active:scale-95 cursor-pointer`}>
            {/* Background Decorative Element */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-5 bg-current transition-transform duration-700 group-hover:scale-150`} />

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`p-4 rounded-2xl shadow-lg transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110`}>
                    {React.cloneElement(icon as React.ReactElement, { className: 'w-7 h-7' })}
                </div>
                {pulse && <div className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full animate-ping" />}
            </div>

            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                {title}
            </h3>
            <div className="flex items-baseline gap-2 relative z-10 mt-1">
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-all group-hover:text-indigo-500">
                    {value}
                </p>
                <div className="text-[10px] font-black uppercase tracking-tighter opacity-50 group-hover:opacity-80 transition-opacity">
                    {trend}
                </div>
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-full group-hover:translate-x-0 transition-transform duration-1000" />
        </div>
    );
}
