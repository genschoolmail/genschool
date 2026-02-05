'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Calendar, BookOpen, Users, GraduationCap } from 'lucide-react';

export default function AcademicsQuickMenu() {
    const [isOpen, setIsOpen] = useState(false);

    const menuItems = [
        { href: '/admin/academics/timetable', icon: Calendar, label: 'Timetable', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30' },
        { href: '/admin/exams', icon: BookOpen, label: 'Marks Entry', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
        { href: '/admin/academics/class-teachers', icon: Users, label: 'Class Teachers', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
        { href: '/admin/academics/promote', icon: GraduationCap, label: 'Promotion', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/30' },
    ];

    return (
        <>
            {/* Mobile Dropdown */}
            <div className="lg:hidden relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium flex items-center justify-between touch-target shadow-lg"
                >
                    <span>Quick Actions</span>
                    <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-10">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b last:border-b-0 border-slate-100 dark:border-slate-700"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className={`p-2 ${item.bg} rounded-lg`}>
                                    <item.icon className={`w-5 h-5 ${item.color}`} />
                                </div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Desktop Grid */}
            <div className="hidden lg:flex gap-3">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`px-4 py-2 ${item.bg} ${item.color} border border-current/20 rounded-lg hover:shadow-md transition-all font-medium flex items-center gap-2`}
                    >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                    </Link>
                ))}
            </div>
        </>
    );
}
