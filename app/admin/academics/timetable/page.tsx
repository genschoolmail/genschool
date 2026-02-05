import React from 'react';
import { Calendar, Settings, Users, Layers } from 'lucide-react';
import Link from 'next/link';

export default function TimetableDashboard() {
    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-8 h-8 text-indigo-600" />
                Timetable Management
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Time Slots Configuration */}
                <Link
                    href="/admin/academics/timetable/settings"
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group"
                >
                    <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                        <Settings className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Time Slots Configuration</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Define periods, start times, and end times for the school timetable.
                    </p>
                </Link>

                {/* Class Timetable Builder */}
                <Link
                    href="/admin/academics/timetable/class"
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group"
                >
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                        <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Class Timetable</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Create and manage weekly timetables for each class.
                    </p>
                </Link>

                {/* Teacher Timetable View */}
                <Link
                    href="/admin/academics/timetable/teacher"
                    className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow group"
                >
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform">
                        <Users className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">Teacher Timetable</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        View timetables by teacher to check workload and availability.
                    </p>
                </Link>
            </div>
        </div>
    );
}
