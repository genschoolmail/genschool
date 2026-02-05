import { prisma } from '@/lib/prisma';
import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { Shield, Search, Filter, Eye, Globe, User, Clock, Activity } from 'lucide-react';

export default async function AuditLogPage() {
    await ensureSuperAdmin();

    const logs = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            user: true,
            school: true
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Shield className="text-indigo-600" />
                        Platform Audit Logs
                    </h1>
                    <p className="text-slate-500 mt-2">Security monitoring and activity tracking across all tenants.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search by user or action..."
                            className="pl-11 pr-4 py-3 bg-white dark:bg-slate-800 border-none rounded-2xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
                        <Filter className="w-4 h-4" />
                        Filter
                    </button>
                </div>
            </div>

            {/* Audit Table */}
            <div className="bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">User / School</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Entity Type</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Activity className="w-12 h-12 text-slate-200" />
                                            <p className="text-slate-500 font-medium">No activity logs found yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-slate-300" />
                                                <div className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                                    {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 font-black text-xs">
                                                    {log.user.name?.charAt(0) || 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">{log.user.name}</div>
                                                    <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {log.school.name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${log.action.includes('DELETE') ? 'bg-red-50 text-red-600' :
                                                    log.action.includes('UPDATE') ? 'bg-amber-50 text-amber-600' :
                                                        'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-sm font-bold text-slate-500 uppercase tracking-tight">{log.entityType}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">SUCCESS</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right text-slate-400 hover:text-indigo-600 cursor-help translate-x-3 opacity-0 group-hover:opacity-100 transition-all">
                                            <Eye className="w-5 h-5 ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {logs.length > 0 && (
                    <div className="p-8 border-t border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="text-xs font-bold text-slate-400">Showing last 50 activities</div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold disabled:opacity-50">Previous</button>
                            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
