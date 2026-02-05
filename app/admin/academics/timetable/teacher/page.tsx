import React from 'react';
import { getTeachers } from '@/lib/actions';
import { Users, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function TeacherTimetableSelectionPage() {
    const teachers = await getTeachers();

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
                    <Users className="w-8 h-8 text-indigo-600" />
                    Select Teacher for Timetable
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachers.map((t) => (
                    <Link
                        key={t.id}
                        href={`/admin/academics/timetable/teacher/${t.id}`}
                        className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group flex justify-between items-center"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                {(t.user.name || 'T').charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white">{t.user.name || 'Unknown Teacher'}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    {t.designation || 'Teacher'}
                                </p>
                            </div>
                        </div>
                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            <ArrowRight className="w-5 h-5" />
                        </div>
                    </Link>
                ))}
                {teachers.length === 0 && (
                    <div className="col-span-full p-8 text-center text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                        No teachers found. Please add teachers first.
                    </div>
                )}
            </div>
        </div>
    );
}
