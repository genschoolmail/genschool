'use client';

import { useState } from 'react';
import { setCurrentAcademicYear, archiveAcademicYear, deleteAcademicYear } from '@/lib/actions/academic-year';
import { Calendar, Check, Archive, Trash2, ExternalLink, MoreVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type AcademicYear = {
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    isActive: boolean;
    isCurrent: boolean;
    status: string;
};

import { toast } from 'sonner';
import { Pencil } from 'lucide-react';

export default function AcademicYearCard({ year }: { year: AcademicYear }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showMenu, setShowMenu] = useState(false);

    const handleSetCurrent = async () => {
        if (!confirm(`Set ${year.name} as the current academic year?`)) return;

        setLoading(true);
        const result = await setCurrentAcademicYear(year.id);
        if (result.success) {
            toast.success(result.message);
            router.refresh();
        } else {
            toast.error(result.error);
        }
        setLoading(false);
        setShowMenu(false);
    };

    const handleArchive = async () => {
        if (!confirm(`Archive ${year.name}? This will make it read-only.`)) return;

        setLoading(true);
        const result = await archiveAcademicYear(year.id);
        if (result.success) {
            toast.success(result.message);
            router.refresh();
        } else {
            toast.error(result.error);
        }
        setLoading(false);
        setShowMenu(false);
    };

    const handleDelete = async () => {
        if (!confirm(`Delete ${year.name}? This action cannot be undone.`)) return;

        setLoading(true);
        const result = await deleteAcademicYear(year.id);
        if (result.success) {
            toast.success(result.message);
            router.refresh();
        } else {
            toast.error(result.error);
        }
        setLoading(false);
        setShowMenu(false);
    };

    const getStatusColor = () => {
        if (year.isCurrent) return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
        if (year.status === 'ACTIVE') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
        if (year.status === 'ARCHIVED') return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    };

    const getStatusText = () => {
        if (year.isCurrent) return 'Current';
        return year.status;
    };

    return (
        <div className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl transition-all duration-300 group
            ${year.isCurrent
                ? 'shadow-lg shadow-green-500/10 ring-2 ring-green-500 dark:ring-green-600'
                : 'shadow-md border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700'
            }`}>

            {/* Status Strip */}
            {year.isCurrent && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-green-400 to-emerald-500" />
            )}

            <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner
                            ${year.isCurrent
                                ? 'bg-gradient-to-br from-green-100 to-emerald-50 text-green-600 dark:from-green-900/40 dark:to-green-900/20 dark:text-green-400'
                                : 'bg-gradient-to-br from-indigo-50 to-slate-50 text-indigo-600 dark:from-indigo-900/20 dark:to-slate-900 dark:text-indigo-400'
                            }`}>
                            <Calendar className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                                {year.name}
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${getStatusColor()}`}>
                                    {getStatusText()}
                                </span>
                                {year.isActive && !year.isCurrent && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        Active
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="p-2 -mr-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-slate-900 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                                <div className="p-1">
                                    <Link
                                        href={`/admin/settings/academic-years/${year.id}`}
                                        className="w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 text-slate-700 dark:text-slate-300"
                                    >
                                        <Pencil className="w-4 h-4 text-slate-400" />
                                        Edit Details
                                    </Link>
                                    {!year.isCurrent && (
                                        <button
                                            onClick={handleSetCurrent}
                                            disabled={loading}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-3 text-green-700 dark:text-green-400"
                                        >
                                            <Check className="w-4 h-4" />
                                            Set as Current
                                        </button>
                                    )}
                                </div>
                                <div className="p-1">
                                    {year.status !== 'ARCHIVED' && !year.isCurrent && (
                                        <button
                                            onClick={handleArchive}
                                            disabled={loading}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 flex items-center gap-3 text-amber-700 dark:text-amber-400"
                                        >
                                            <Archive className="w-4 h-4" />
                                            Archive Year
                                        </button>
                                    )}
                                    {year.status === 'DRAFT' && (
                                        <button
                                            onClick={handleDelete}
                                            disabled={loading}
                                            className="w-full px-4 py-2.5 text-left text-sm font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 text-red-600 dark:text-red-400"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Start Date</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(year.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">End Date</p>
                        <p className="font-semibold text-slate-900 dark:text-white">
                            {new Date(year.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <Link
                    href={`/admin/settings/academic-years/${year.id}`}
                    className={`flex items-center justify-center w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                        ${year.isCurrent
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
                            : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
                        }`}
                >
                    Manage Year
                    <ExternalLink className="w-4 h-4 ml-2 opacity-60" />
                </Link>
            </div>
        </div>
    );
}
