import React from 'react';
import { getClasses } from '@/lib/actions/academics';
import { Layers, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ClassTimetableSelectionPage() {
    const classes = await getClasses();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/academics/timetable"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Layers className="w-8 h-8 text-indigo-600" />
                    Select Class for Timetable
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((c) => (
                    <Link
                        key={c.id}
                        href={`/admin/academics/timetable/class/${c.id}`}
                        className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group flex justify-between items-center"
                    >
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{c.name} - {c.section}</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                {c._count.students} Students
                            </p>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </Link>
                ))}
                {classes.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        No classes found. Please create classes first.
                    </div>
                )}
            </div>
        </div>
    );
}
