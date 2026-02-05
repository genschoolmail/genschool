'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Edit, Search, Mail, Phone, MoreVertical, Trash2 } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { DataCard, DataCardRow } from '@/components/ui/DataCard';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import CardViewToggle from '@/components/ui/CardViewToggle';

interface Teacher {
    id: string;
    employeeId: string;
    designation: string | null;
    phone: string | null;
    subject: string | null;
    user: {
        name: string | null;
        email: string;
        image: string | null;
    };
}

export function TeachersClient({ teachers }: { teachers: Teacher[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Initialize state from URL params
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [designationFilter, setDesignationFilter] = useState(searchParams.get('designation') || '');
    const [view, setView] = useState<'list' | 'card'>('card'); // Default to card for teachers as it was before

    // Auto-switch to card view on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setView('card');
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters(searchQuery, designationFilter);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery, designationFilter]);

    const applyFilters = (q: string, designation: string) => {
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (designation) params.set('designation', designation);

        router.push(`/admin/teachers?${params.toString()}`);
    };

    const designations = ['Teacher', 'Head Teacher', 'Senior Teacher', 'Assistant Teacher'];

    const clearFilters = () => {
        setSearchQuery('');
        setDesignationFilter('');
        router.push('/admin/teachers');
    };

    const hasActiveFilters = searchQuery || designationFilter;

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            <Breadcrumb
                items={[
                    { label: 'Teachers' }
                ]}
            />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Teachers</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Manage school teachers</p>
                </div>
                <Link href="/admin/teachers/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center shadow-sm hover:shadow transition-all active:scale-95 touch-target w-full sm:w-auto justify-center">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Teacher
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, or subject..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        {/* Designation Filter */}
                        <select
                            value={designationFilter}
                            onChange={(e) => setDesignationFilter(e.target.value)}
                            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none min-w-[180px]"
                        >
                            <option value="">All Designations</option>
                            {designations.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>

                        {/* View Toggle */}
                        <CardViewToggle view={view} onViewChange={setView} />
                    </div>
                </div>

                {hasActiveFilters && (
                    <div className="flex items-center justify-between pt-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Found {teachers.length} results
                        </p>
                        <button
                            onClick={clearFilters}
                            className="text-sm text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium hover:underline"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Teachers Content */}
            {teachers.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center text-slate-500">
                    {hasActiveFilters ? 'No teachers match your filters.' : 'No teachers found. Add one to get started.'}
                </div>
            ) : (
                <>
                    {/* List View */}
                    {view === 'list' && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <ScrollIndicator>
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-lg">Teacher</th>
                                            <th className="px-6 py-4">Employee ID</th>
                                            <th className="px-6 py-4">Designation</th>
                                            <th className="px-6 py-4">Subject</th>
                                            <th className="px-6 py-4">Contact</th>
                                            <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                        {teachers.map((teacher) => (
                                            <tr key={teacher.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group cursor-pointer" onClick={() => router.push(`/admin/teachers/${teacher.id}`)}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center">
                                                        {teacher.user.image ? (
                                                            <img src={teacher.user.image} alt={teacher.user.name || 'Teacher'} className="w-10 h-10 rounded-full object-cover mr-3 border border-slate-200 dark:border-slate-600" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold mr-3 border border-indigo-200 dark:border-indigo-800">
                                                                {(teacher.user.name || 'T').charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{teacher.user.name}</p>
                                                            <p className="text-xs text-slate-500">{teacher.user.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-xs font-semibold text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800 font-mono">
                                                        {teacher.employeeId}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {teacher.designation || <span className="text-slate-400 italic text-sm">N/A</span>}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {teacher.subject ? (
                                                        <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                                                            {teacher.subject}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-sm">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-sm">
                                                    {teacher.phone || <span className="text-slate-400 italic">N/A</span>}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/admin/teachers/${teacher.id}/edit`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ScrollIndicator>
                        </div>
                    )}

                    {/* Card View */}
                    {view === 'card' && (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {teachers.map((teacher) => (
                                <DataCard
                                    key={teacher.id}
                                    title={teacher.user.name || 'Unnamed Teacher'}
                                    subtitle={teacher.user.email}
                                    status={
                                        teacher.subject ? (
                                            <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                {teacher.subject}
                                            </span>
                                        ) : null
                                    }
                                    actions={
                                        <Link
                                            href={`/admin/teachers/${teacher.id}/edit`}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                    }
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        {teacher.user.image ? (
                                            <img
                                                src={teacher.user.image}
                                                alt={teacher.user.name || 'Teacher'}
                                                className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                {teacher.user.name?.charAt(0).toUpperCase() || 'T'}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Employee ID</p>
                                            <p className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">{teacher.employeeId}</p>
                                        </div>
                                    </div>

                                    <DataCardRow label="Designation" value={teacher.designation || 'N/A'} />
                                    <DataCardRow label="Phone" value={teacher.phone || 'N/A'} icon={<Phone className="w-4 h-4" />} />
                                    <DataCardRow label="Email" value={teacher.user.email} icon={<Mail className="w-4 h-4" />} />

                                    <button
                                        onClick={() => router.push(`/admin/teachers/${teacher.id}`)}
                                        className="mt-3 w-full py-2 px-4 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg transition-colors font-medium text-sm"
                                    >
                                        View Profile
                                    </button>
                                </DataCard>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
