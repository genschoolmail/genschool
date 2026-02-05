import Link from 'next/link';
import { getAllSchools, backfillSchoolIds } from '@/lib/actions/super-admin';
import { Plus, Search, ExternalLink, School, Users, Settings } from 'lucide-react';
import SchoolActions from './SchoolActions';

export default async function SuperAdminSchoolsPage() {
    const schools = await getAllSchools();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Schools Management</h1>
                    <p className="text-slate-500 mt-1">Manage tenant schools, subscriptions, and platform access.</p>
                </div>
                <Link
                    href="/super-admin/schools/new"
                    className="flex items-center px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 transition-all font-semibold"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Onboard New School
                </Link>
            </div>

            {/* Filters & Stats Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 flex gap-4 bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search schools by name or subdomain..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        />
                    </div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                    <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Active Tenants</span>
                    <span className="text-xl font-bold text-indigo-800 dark:text-indigo-200">{schools.filter(s => s.status === 'ACTIVE').length}</span>
                </div>
            </div>

            {/* Schools Grid/Table */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">School ID</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Institution Details</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Access & URL</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Plan</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Utilization</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-sm">Status</th>
                                <th className="p-4 text-right font-semibold text-slate-600 dark:text-slate-300 text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {schools.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-slate-500 italic">
                                        No schools found. Onboard a new school to get started.
                                    </td>
                                </tr>
                            ) : (
                                schools.map((school) => (
                                    <tr key={school.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                                        <td className="p-4 font-mono text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                            {school.schoolId || 'N/A'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <School className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 dark:text-white">{school.name}</div>
                                                    <div className="text-xs text-slate-500">{school.contactEmail}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-slate-600 dark:text-slate-400 font-mono text-xs bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded">
                                                        {school.subdomain}
                                                    </span>
                                                    <a href={`http://${school.subdomain}.localhost:3000`} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-600 p-1 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors">
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Joined {new Date(school.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                {school.subscription?.plan?.name || 'TRIAL'}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-4 text-xs">
                                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                    <Users className="w-3.5 h-3.5" />
                                                    <span>{(school._count as any)?.students || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                                                    <Settings className="w-3.5 h-3.5" />
                                                    <span>{(school._count as any)?.teachers || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <StatusBadge status={school.status} />
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end">
                                                <SchoolActions
                                                    schoolId={school.id}
                                                    subdomain={school.subdomain}
                                                    currentStatus={school.status}
                                                />
                                            </div>
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
        ACTIVE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50',
        SUSPENDED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200 dark:border-red-800/50',
        EXPIRED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50',
    } as any;

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[status] || styles.ACTIVE}`}>
            {status}
        </span>
    );
}
