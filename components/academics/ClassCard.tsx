import { Layers, Users, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface ClassCardProps {
    classData: {
        id: string;
        name: string;
        section: string;
        capacity: number;
        _count?: {
            students: number;
        };
    };
}

export default function ClassCard({ classData }: ClassCardProps) {
    const studentCount = classData._count?.students || 0;
    const fillPercentage = (studentCount / classData.capacity) * 100;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                            Class {classData.name}
                        </h3>
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded text-sm font-semibold">
                            Section {classData.section}
                        </span>
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Students</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                        {studentCount} / {classData.capacity}
                    </span>
                </div>

                <div>
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                        <span>Capacity</span>
                        <span>{fillPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${fillPercentage >= 90
                                    ? 'bg-red-500'
                                    : fillPercentage >= 75
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                                }`}
                            style={{ width: `${Math.min(fillPercentage, 100)}%` }}
                        />
                    </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    <Link
                        href={`/admin/academics/classes/${classData.id}/edit`}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium touch-target"
                    >
                        <Edit className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                    </Link>
                    <form action={`/api/classes/${classData.id}/delete`} method="POST" className="flex-1">
                        <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium touch-target"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
