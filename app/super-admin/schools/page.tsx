import Link from 'next/link';
import { getAllSchools } from '@/lib/actions/super-admin';
import { Plus, Search, ExternalLink, School, Users, Settings, Activity } from 'lucide-react';
import SchoolActions from './SchoolActions';
import { headers } from 'next/headers';

export default async function SuperAdminSchoolsPage() {
    const schools = await getAllSchools();
    const headersList = headers();
    const host = headersList.get('host') || '';
    const isLocalhost = host.includes('localhost');
    const protocol = isLocalhost ? 'http' : 'https';
    const baseDomain = host; // The middleware ensures host is the root domain for super-admin

    return (
        <div className="space-y-10 sm:space-y-12 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        School Ecosystem
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                        Deployment oversight and tenant authentication management.
                    </p>
                </div>
                <Link
                    href="/super-admin/schools/new"
                    className="group relative px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black transition-all shadow-2xl shadow-indigo-500/20 active:scale-95 flex items-center gap-3 overflow-hidden w-full sm:w-auto justify-center"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                    <span className="relative z-10">Provision New Node</span>
                </Link>
            </div>

            {/* Premium Control Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-3xl shadow-xl shadow-indigo-500/5 border border-slate-200 dark:border-slate-800/50">
                    <div className="relative flex-1 group/search">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify node by identity or access-point..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200/50 dark:border-slate-800 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium text-slate-700 dark:text-slate-300 transition-all"
                        />
                    </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-3xl shadow-2xl shadow-indigo-500/20 flex items-center justify-between border border-white/10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">Active Tenants</span>
                        <span className="text-2xl font-black text-white tracking-tight">{schools.filter(s => s.status === 'ACTIVE').length} Units</span>
                    </div>
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                        <Activity className="text-white w-6 h-6 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Registry Registry - Modern Sheet */}
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-200 dark:border-slate-800/50 overflow-hidden group/table">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/50">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Registry ID</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Core</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Access Vector</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden xl:table-cell">Service Tier</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden xl:table-cell">Node Density</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Command</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {schools.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center text-slate-500 font-bold italic tracking-tight">
                                        No operational nodes detected in current ecosystem.
                                    </td>
                                </tr>
                            ) : (
                                schools.map((school) => (
                                    <tr key={school.id} className="group/row hover:bg-indigo-50/30 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="p-6 hidden lg:table-cell">
                                            <code className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black tracking-widest">
                                                {school.schoolId?.substring(0, 12) || 'AUTH_PENDING'}
                                            </code>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-indigo-500 group-hover/row:scale-110 transition-transform shadow-sm">
                                                    <School className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">{school.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{school.contactEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 hidden md:table-cell">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-black text-indigo-500 dark:text-indigo-400 text-xs bg-indigo-500/5 border border-indigo-500/10 px-3 py-1 rounded-lg">
                                                        {school.subdomain}
                                                    </span>
                                                    <a
                                                        href={`${protocol}://${school.subdomain}.${baseDomain}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-indigo-500"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </div>
                                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em]">Joined {new Date(school.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 hidden xl:table-cell">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                                <span className="font-black text-slate-700 dark:text-slate-300 text-xs tracking-widest uppercase">
                                                    {school.subscription?.plan?.name || 'TRIAL_CORE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6 hidden xl:table-cell">
                                            <div className="flex items-center gap-5">
                                                <div className="flex items-center gap-2 group/stat">
                                                    <Users className="w-4 h-4 text-slate-400 group-hover/stat:text-blue-500 transition-colors" />
                                                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs">{(school._count as any)?.students || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-2 group/stat">
                                                    <Settings className="w-4 h-4 text-slate-400 group-hover/stat:text-purple-500 transition-colors" />
                                                    <span className="font-bold text-slate-600 dark:text-slate-400 text-xs">{(school._count as any)?.teachers || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <StatusBadge status={school.status} />
                                        </td>
                                        <td className="p-6 text-right">
                                            <SchoolActions
                                                schoolId={school.id}
                                                subdomain={school.subdomain}
                                                currentStatus={school.status}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        ACTIVE: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        SUSPENDED: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
        EXPIRED: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    } as any;

    const accentColor = {
        ACTIVE: 'bg-emerald-500',
        SUSPENDED: 'bg-rose-500',
        EXPIRED: 'bg-amber-500',
    } as any;

    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.ACTIVE}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${accentColor[status] || accentColor.ACTIVE} ${status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
            {status}
        </span>
    );
}
