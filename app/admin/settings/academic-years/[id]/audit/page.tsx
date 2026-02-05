import { getAuditLogs } from '@/lib/actions/audit';
import { getAcademicYear } from '@/lib/actions/academic-year';
import { ArrowLeft, History, User, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AuditLogPage({ params }: { params: { id: string } }) {
    const academicYear = await getAcademicYear(params.id);

    if (!academicYear) {
        redirect('/admin/settings/academic-years');
    }

    const logsResult = await getAuditLogs(params.id);
    const logs = logsResult.success ? logsResult.logs : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/settings/academic-years/${params.id}`}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <History className="w-8 h-8 text-orange-600" />
                        Audit Logs
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Activity history for {academicYear.name}
                    </p>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {logs && logs.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {logs.map((log) => (
                            <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-3">
                                        <div className={`mt-1 p-2 rounded-full ${log.action === 'CREATE' ? 'bg-green-100 text-green-600' :
                                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                                                log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800 dark:text-white">
                                                {log.action} {log.entityType}
                                            </p>
                                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {log.user.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            {log.reason && (
                                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-100 dark:border-slate-700">
                                                    Reason: {log.reason}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">No audit logs found</p>
                    </div>
                )}
            </div>
        </div>
    );
}
