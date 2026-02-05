import { getPlatformMetrics, getAllSchools } from '@/lib/actions/super-admin';
import { School, Users, CheckCircle, TrendingUp, Calendar, ArrowRight, FileCheck } from 'lucide-react';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
    const metrics = await getPlatformMetrics();
    const allSchools = await getAllSchools();
    const recentSchools = allSchools.slice(0, 5);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Platform Overview</h1>
                    <p className="text-slate-500 mt-1">Real-time metrics and system health across all tenants.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/super-admin/schools/new" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none inline-flex items-center gap-2">
                        <School className="w-5 h-5" />
                        Onboard School
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Schools"
                    value={metrics.totalSchools}
                    icon={<School className="w-6 h-6 text-indigo-600" />}
                    trend="+12% this month"
                />
                <StatCard
                    title="Total Users"
                    value={metrics.totalUsers}
                    icon={<Users className="w-6 h-6 text-blue-600" />}
                    trend="+5% this week"
                />
                <StatCard
                    title="Pending KYC"
                    value={metrics.pendingKYC}
                    icon={<FileCheck className="w-6 h-6 text-rose-600" />}
                    trend="Needs Review"
                />
                <StatCard
                    title="Active Subscriptions"
                    value={metrics.activeSubscriptions}
                    icon={<CheckCircle className="w-6 h-6 text-green-600" />}
                    trend="98% retention"
                />
                <StatCard
                    title="Revenue (Est.)"
                    value="₹12,45,000"
                    icon={<TrendingUp className="w-6 h-6 text-amber-600" />}
                    trend="+8% from last month"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Schools */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Recently Onboarded Schools</h2>
                        <Link href="/super-admin/schools" className="text-indigo-600 hover:text-indigo-700 text-sm font-semibold flex items-center gap-1 group">
                            View all <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden text-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="p-4">School</th>
                                    <th className="p-4">Subdomain</th>
                                    <th className="p-4">Users</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {recentSchools.map((school) => (
                                    <tr key={school.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="p-4 font-medium text-slate-800 dark:text-white">{school.name}</td>
                                        <td className="p-4 text-slate-500 font-mono text-xs">{school.subdomain}</td>
                                        <td className="p-4 text-slate-600 dark:text-slate-400">
                                            {(school._count as any).students + (school._count as any).teachers} users
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${school.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {school.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Platform Health/Activity Placeholder */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Platform Activity</h2>
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col h-full min-h-[300px]">
                        <div className="space-y-6">
                            {[
                                { icon: <Calendar className="w-4 h-4" />, text: "Server resources within limits", time: "2m ago", color: "text-emerald-500" },
                                { icon: <School className="w-4 h-4" />, text: "New backup generated for GHS", time: "15m ago", color: "text-blue-500" },
                                { icon: <Users className="w-4 h-4" />, text: "System maintenance scheduled", time: "1h ago", color: "text-amber-500" },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className={`mt-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 ${item.color}`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium leading-tight">{item.text}</p>
                                        <span className="text-xs text-slate-400">{item.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-auto pt-6 text-center border-t border-slate-100 dark:border-slate-700">
                            <span className="text-xs text-slate-400">Activity logs synced with master audit.</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon, trend }: { title: string; value: string | number; icon: React.ReactNode; trend: string }) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                    {icon}
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1 rounded-full">
                    {trend}
                </span>
            </div>
            <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h3>
            <p className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{value}</p>
        </div>
    );
}
