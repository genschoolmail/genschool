import { prisma } from '@/lib/prisma';
import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { Activity, ShieldCheck, Database, Zap, Server, HardDrive, Cpu, RefreshCw } from 'lucide-react';

export default async function HealthPage() {
    await ensureSuperAdmin();

    // Mock real metrics for UI demonstration
    const stats = [
        { label: 'Platform Status', value: 'Operational', icon: <ShieldCheck />, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'DB Connections', value: '47 Active', icon: <Database />, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Redis Cache', value: '98.2% Hit Rate', icon: <Zap />, color: 'text-amber-500', bg: 'bg-amber-50' },
        { label: 'S3 Storage', value: '1.2 TB / 5 TB', icon: <HardDrive />, color: 'text-purple-500', bg: 'bg-indigo-50' }
    ];

    const logs = [
        { time: '2 mins ago', service: 'AUTH', status: 'OK', latency: '42ms' },
        { time: '15 mins ago', service: 'PAYMENT', status: 'OK', latency: '128ms' },
        { time: '45 mins ago', service: 'DATABASE', status: 'LOAD', latency: '210ms' },
        { time: '1 hour ago', service: 'S3_BACKUP', status: 'OK', latency: 'N/A' },
        { time: '3 hours ago', service: 'REDIS', status: 'OK', latency: '2ms' }
    ];

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Activity className="text-indigo-600" />
                        System Health
                    </h1>
                    <p className="text-slate-500 mt-2">Real-time infrastructure performance and security monitoring.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95">
                    <RefreshCw className="w-4 h-4" />
                    Refresh Stats
                </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-slate-100 dark:border-slate-700 shadow-sm space-y-4">
                        <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Live Logs */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-[40px] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-8 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Service Pings</h2>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-tighter">Live Monitor</span>
                    </div>
                    <div className="divide-y divide-slate-50 dark:divide-slate-700">
                        {logs.map((log, i) => (
                            <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                <div className="flex items-center gap-6">
                                    <div className="text-xs font-bold text-slate-400 min-w-[80px]">{log.time}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                        <div className="font-bold text-sm text-slate-700 dark:text-slate-200">{log.service}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="font-mono text-xs text-slate-500">{log.latency}</div>
                                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">SUCCESS</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Resource Usage */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white space-y-8 relative overflow-hidden group">
                    <div className="relative z-10 space-y-6">
                        <h2 className="text-xl font-bold">Hardware Load</h2>

                        <LoadMeter label="CPU Usage" percent={64} />
                        <LoadMeter label="Memory (RAM)" percent={42} />
                        <LoadMeter label="Disk I/O" percent={18} />
                        <LoadMeter label="Network bandwidth" percent={29} />
                    </div>

                    <div className="pt-4 relative z-10 pb-4">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-sm">
                            <p className="text-xs text-slate-400 font-bold leading-relaxed">
                                Infrastructure is scaling automatically based on traffic peaks. All regions functional.
                            </p>
                        </div>
                    </div>

                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] group-hover:scale-150 transition-transform duration-700" />
                </div>
            </div>
        </div>
    );
}

function LoadMeter({ label, percent }: { label: string, percent: number }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>{label}</span>
                <span className="text-white">{percent}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}
