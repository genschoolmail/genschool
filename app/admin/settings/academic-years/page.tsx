import { getAcademicYears } from '@/lib/actions/academic-year';
import { Calendar, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AcademicYearCard from './AcademicYearCard';

export default async function AcademicYearsPage() {
    const academicYears = await getAcademicYears();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/settings"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Calendar className="w-8 h-8 text-indigo-600" />
                            Academic Year Management
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Manage academic years, promotions, and session transitions
                        </p>
                    </div>
                </div>
                <Link
                    href="/admin/settings/academic-years/new"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Create New Year
                </Link>
            </div>

            {/* Academic Years Grid */}
            {academicYears.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {academicYears.map((year) => (
                        <AcademicYearCard key={year.id} year={year} />
                    ))}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                        No Academic Years Found
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-4">
                        Get started by creating your first academic year
                    </p>
                    <Link
                        href="/admin/settings/academic-years/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Academic Year
                    </Link>
                </div>
            )}

            {/* Quick Stats */}
            {academicYears.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Total Years</p>
                        <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                            {academicYears.length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Active Years</p>
                        <p className="text-2xl font-bold text-indigo-600 mt-1">
                            {academicYears.filter(y => y.isActive).length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Draft Years</p>
                        <p className="text-2xl font-bold text-yellow-600 mt-1">
                            {academicYears.filter(y => y.status === 'DRAFT').length}
                        </p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Archived</p>
                        <p className="text-2xl font-bold text-slate-600 mt-1">
                            {academicYears.filter(y => y.status === 'ARCHIVED').length}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
