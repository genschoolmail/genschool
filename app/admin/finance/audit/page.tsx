import React from 'react';
import { getAuditLogs, getAuditLogStats } from '@/lib/audit-utils';
import { FileText, User, Calendar, Activity } from 'lucide-react';
import Link from 'next/link';

export default async function AuditTrailPage() {
    const logs = await getAuditLogs({ limit: 50 });
    const stats = await getAuditLogStats();

    const getActionColor = (action: string) => {
        switch (action) {
            case 'CREATE': return 'bg-green-100 text-green-800';
            case 'UPDATE': return 'bg-blue-100 text-blue-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            case 'APPROVE': return 'bg-emerald-100 text-emerald-800';
            case 'REJECT': return 'bg-orange-100 text-orange-800';
            case 'PAYMENT': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Audit Trail</h1>
                    <p className="text-slate-500">Complete history of all financial transactions and actions</p>
                </div>
                <Link href="/admin/finance" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100">
                    Back to Finance
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <Activity className="w-8 h-8 text-indigo-600 mb-2" />
                    <p className="text-sm text-slate-500">Today's Actions</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalToday}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <FileText className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-sm text-slate-500">Total Records</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stats.totalAllTime}</p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <User className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-sm text-slate-500">Unique Users</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
                        {new Set(logs.map((l: any) => l.userId)).size}
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <Calendar className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-sm text-slate-500">Last 50 Entries</p>
                    <p className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{logs.length}</p>
                </div>
            </div>

            {/* Audit Log Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Timestamp</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">User</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Action</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Entity</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Details</th>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                                        No audit logs found. Actions will appear here once finance operations are performed.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(log.createdAt).toLocaleString('en-IN')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>
                                                <p className="text-sm font-medium text-slate-800 dark:text-white">
                                                    {log.user.name || 'Unknown'}
                                                </p>
                                                <p className="text-xs text-slate-500">{log.user.role}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getActionColor(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-sm text-slate-700 dark:text-slate-300">
                                                {log.entityType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                            {log.newValue && typeof log.newValue === 'object'
                                                ? Object.keys(log.newValue).slice(0, 3).join(', ')
                                                : 'N/A'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                            {log.reason || '-'}
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
