import { prisma } from '@/lib/prisma';
import { Clock, CreditCard, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';

async function getSubscriptions() {
    return await prisma.subscription.findMany({
        include: {
            school: true,
            plan: true
        },
        orderBy: { startDate: 'desc' }
    });
}

export default async function SubscriptionsPage() {
    const subscriptions = await getSubscriptions();

    return (
        <div className="space-y-10 sm:space-y-12 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Financial Stream
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                        Monetary oversight and subscription lifecycle tracking.
                    </p>
                </div>
                <Link
                    href="/super-admin/subscriptions/plans"
                    className="group relative px-6 py-3.5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black transition-all shadow-2xl active:scale-95 flex items-center gap-3 overflow-hidden w-full sm:w-auto justify-center border border-slate-700 hover:border-indigo-500/50"
                >
                    <Settings className="w-5 h-5 transition-transform group-hover:rotate-45 text-indigo-400" />
                    <span className="relative z-10">Configure Service Tiers</span>
                </Link>
            </div>

            {/* Registry Table - Modern Sheet */}
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-200 dark:border-slate-800/50 overflow-hidden group/table">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/50">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Payer</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Assigned Tier</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Asset Status</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Initiation</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Expiration</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-slate-500 font-bold italic tracking-tight">
                                        No active financial streams detected in current cycle.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="group/row hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-indigo-500 group-hover/row:scale-110 group-hover/row:rotate-3 transition-transform shadow-sm">
                                                    <CreditCard className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">{sub.school.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                                                        {sub.school.subdomain}.{process.env.BASE_DOMAIN}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col gap-2">
                                                <span className="inline-flex items-center px-4 py-2 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-widest w-fit shadow-sm group-hover/row:scale-105 transition-transform">
                                                    {sub.plan?.name || 'LEGACY_TIER'}
                                                </span>
                                                {sub.priceOverride !== null && sub.priceOverride !== undefined && (
                                                    <span className="text-[9px] text-amber-500 font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ml-2">
                                                        <div className="w-1 h-1 bg-amber-500 rounded-full animate-pulse" />
                                                        Custom Pricing Level
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-6 hidden sm:table-cell">
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td className="p-6 text-sm text-slate-500 hidden md:table-cell font-black tracking-tighter">
                                            {new Date(sub.startDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 text-sm text-slate-500 hidden lg:table-cell font-black tracking-tighter">
                                            {new Date(sub.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 text-right">
                                            <Link
                                                href={`/super-admin/subscriptions/${sub.id}/edit`}
                                                className="inline-flex items-center px-5 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-indigo-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest group-hover/row:shadow-lg active:scale-95"
                                            >
                                                Adjust Agent
                                            </Link>
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
        TRIAL: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        EXPIRED: 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    } as any;

    const Icon = {
        ACTIVE: CheckCircle,
        TRIAL: Clock,
        EXPIRED: AlertTriangle,
    } as any;

    const ActiveIcon = Icon[status] || AlertTriangle;

    return (
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status] || styles.EXPIRED}`}>
            <ActiveIcon className={`w-3.5 h-3.5 ${status === 'ACTIVE' ? 'animate-pulse' : ''}`} />
            {status}
        </span>
    );
}
