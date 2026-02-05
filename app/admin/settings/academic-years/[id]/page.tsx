import { getAcademicYear } from '@/lib/actions/academic-year';
import { ArrowLeft, Calendar, Users, Edit, Archive, Trash2, DollarSign, Copy, Database, History as HistoryIcon, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function AcademicYearDetailsPage({ params }: { params: { id: string } }) {
    const academicYear = await getAcademicYear(params.id);

    if (!academicYear) {
        redirect('/admin/settings/academic-years');
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/settings/academic-years"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar className="w-8 h-8 text-indigo-600" />
                            {academicYear.name}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Details and actions for academic year {academicYear.name}
                        </p>
                    </div>
                </div>
            </div>

            {/* Details Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Year Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Name:</p>
                        <p className="font-medium text-slate-800 dark:text-white">{academicYear.name}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Status:</p>
                        <p className={`font-medium ${academicYear.isCurrent ? 'text-green-600' : 'text-slate-800 dark:text-white'}`}>
                            {academicYear.isCurrent ? 'Current' : academicYear.status}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">Start Date:</p>
                        <p className="font-medium text-slate-800 dark:text-white">{new Date(academicYear.startDate).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-slate-400">End Date:</p>
                        <p className="font-medium text-slate-800 dark:text-white">{new Date(academicYear.endDate).toLocaleDateString('en-IN')}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href={`/admin/settings/academic-years/${params.id}/promote`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Users className="w-5 h-5" />
                        Bulk Student Promotion
                    </Link>
                    <Link
                        href={`/admin/settings/academic-years/${params.id}/rollover-fees`}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <DollarSign className="w-5 h-5" />
                        Fee Structure Rollover
                    </Link>
                    <Link
                        href={`/admin/settings/academic-years/${params.id}/carry-forward`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Copy className="w-5 h-5" />
                        Data Carry Forward
                    </Link>
                    <Link
                        href={`/admin/settings/academic-years/${params.id}/backup`}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <Database className="w-5 h-5" />
                        Backup & Export
                    </Link>
                </div>
            </div>

            {/* Additional Settings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Settings & Rules</h3>
                <div className="flex flex-wrap gap-4">
                    <Link
                        href="/admin/settings/promotion-rules"
                        className="px-4 py-2 border-2 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center gap-2 font-medium"
                    >
                        Promotion Rules
                    </Link>
                    <Link
                        href={`/admin/settings/academic-years/${params.id}/audit`}
                        className="px-4 py-2 border-2 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex items-center gap-2 font-medium"
                    >
                        <HistoryIcon className="w-5 h-5" />
                        Audit Logs
                    </Link>
                    <Link
                        href={`/admin/settings/academic-years/${params.id}/rollback`}
                        className="px-4 py-2 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2 font-medium"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Rollback
                    </Link>
                </div>
            </div>
        </div>
    );
}
