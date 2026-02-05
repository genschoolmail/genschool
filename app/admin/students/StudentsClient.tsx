'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteStudent } from '@/lib/actions';
import { Plus, Search, Filter, MoreVertical, Edit, CreditCard, FileText, Trash2, Download } from 'lucide-react';
import { DataCard, DataCardRow } from '@/components/ui/DataCard';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import CardViewToggle from '@/components/ui/CardViewToggle';
import { exportStudentsData } from '@/lib/actions/export-actions';
import { toast } from 'sonner';

interface Student {
    id: string;
    admissionNo: string;
    gender: string | null;
    documents: string | null;
    user: {
        name: string | null;
        email: string;
        image: string | null;
    };
    class: {
        name: string;
        section: string;
    } | null;
    parent: {
        fatherName: string | null;
        motherName: string | null;
        phone: string | null;
        email: string | null;
    } | null;
}

export function StudentsClient({ students }: { students: Student[] }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');
    const [view, setView] = useState<'list' | 'card'>('list');

    // Auto-switch to card view on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setView('card');
            } else {
                setView('list');
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Get unique classes for filter
    const uniqueClasses = useMemo(() => {
        const classes = students
            .filter(s => s.class)
            .map(s => `${s.class?.name}-${s.class?.section}`)
            .filter((v, i, a) => a.indexOf(v) === i)
            .sort();
        return classes;
    }, [students]);

    // Filter students
    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const matchesSearch =
                student.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.parent?.fatherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.parent?.motherName?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesClass = !classFilter ||
                (student.class && `${student.class.name}-${student.class.section}` === classFilter);

            const matchesGender = !genderFilter || student.gender === genderFilter;

            return matchesSearch && matchesClass && matchesGender;
        });
    }, [students, searchQuery, classFilter, genderFilter]);

    const clearFilters = () => {
        setSearchQuery('');
        setClassFilter('');
        setGenderFilter('');
    };

    const hasActiveFilters = searchQuery || classFilter || genderFilter;

    const handleDelete = async (formData: FormData) => {
        const id = formData.get('id') as string;
        const studentName = students.find(s => s.id === id)?.user.name || 'Student';

        if (!confirm(`Are you sure you want to delete ${studentName}? This action cannot be undone.`)) {
            return;
        }

        const promise = deleteStudent(formData);
        toast.promise(promise, {
            loading: `Deleting ${studentName}...`,
            success: 'Student deleted successfully',
            error: (err) => `Delete failed: ${err.message}`
        });

        try {
            await promise;
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Students</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage student records</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={async () => {
                            const promise = exportStudentsData();
                            toast.promise(promise, {
                                loading: 'Exporting data...',
                                success: (result) => {
                                    if (result.success && result.data) {
                                        // Trigger download
                                        const blob = new Blob([result.data], { type: 'text/csv' });
                                        const url = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = result.filename || 'students.csv';
                                        document.body.appendChild(a);
                                        a.click();
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                        return 'Export downloaded successfully';
                                    } else {
                                        throw new Error(result.error);
                                    }
                                },
                                error: (err) => `Export failed: ${err.message}`
                            });
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl flex items-center shadow-sm hover:shadow transition-all active:scale-95 touch-target flex-1 sm:flex-initial justify-center"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export
                    </button>
                    <Link href="/admin/students/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center shadow-sm hover:shadow transition-all active:scale-95 touch-target flex-1 sm:flex-initial justify-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Add Student
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Search and Filters */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-4">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search students..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                            {/* Class Filter */}
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none min-w-[140px]"
                            >
                                <option value="">All Classes</option>
                                {uniqueClasses.map((cls) => (
                                    <option key={cls} value={cls}>Class {cls}</option>
                                ))}
                            </select>

                            {/* Gender Filter */}
                            <select
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none min-w-[130px]"
                            >
                                <option value="">All Genders</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>

                            {/* View Toggle */}
                            <CardViewToggle view={view} onViewChange={setView} />
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Found {filteredStudents.length} results
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

                {/* Content Area */}
                {filteredStudents.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No students found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            {hasActiveFilters ? 'Try adjusting your search or filters.' : 'Get started by adding a new student.'}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* List View */}
                        {view === 'list' && (
                            <ScrollIndicator>
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 font-medium text-xs uppercase tracking-wider">
                                        <tr>
                                            <th className="px-6 py-4 rounded-tl-lg">Name</th>
                                            <th className="px-6 py-4">Admission No</th>
                                            <th className="px-6 py-4">Class</th>
                                            <th className="px-6 py-4">Parent</th>
                                            <th className="px-6 py-4">Gender</th>
                                            <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <Link href={`/admin/students/${student.id}`} className="flex items-center hover:opacity-80 transition-opacity">
                                                        {student.user.image ? (
                                                            <img src={student.user.image} alt={student.user.name || 'Student'} className="w-10 h-10 rounded-full object-cover mr-3 border border-slate-200 dark:border-slate-600" />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold mr-3 border border-indigo-200 dark:border-indigo-800">
                                                                {(student.user.name || 'U').charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-white">{student.user.name}</p>
                                                            <p className="text-xs text-slate-500">{student.user.email}</p>
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-mono text-sm">{student.admissionNo}</td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    {student.class ? (
                                                        <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                                            {student.class.name}-{student.class.section}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 italic text-sm">Unassigned</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                                                    <div className="text-sm">
                                                        <p className="font-medium">{student.parent?.fatherName || student.parent?.motherName || 'N/A'}</p>
                                                        {student.parent?.phone && <p className="text-xs text-slate-500">{student.parent.phone}</p>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{student.gender}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Link href={`/admin/students/${student.id}/edit`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <Link href={`/admin/students/${student.id}/id-card`} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="ID Card">
                                                            <CreditCard className="w-4 h-4" />
                                                        </Link>
                                                        {student.documents && (
                                                            <a href={student.documents} target="_blank" rel="noopener noreferrer" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Documents">
                                                                <FileText className="w-4 h-4" />
                                                            </a>
                                                        )}
                                                        <form action={handleDelete}>
                                                            <input type="hidden" name="id" value={student.id} />
                                                            <button type="submit" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </form>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ScrollIndicator>
                        )}

                        {/* Card View */}
                        {view === 'card' && (
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-900/50">
                                {filteredStudents.map((student) => (
                                    <DataCard
                                        key={student.id}
                                        title={student.user.name || 'Unknown Student'}
                                        subtitle={student.user.email}
                                        onClick={() => router.push(`/admin/students/${student.id}`)}
                                        status={
                                            student.class ? (
                                                <span className="px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                                    {student.class.name}-{student.class.section}
                                                </span>
                                            ) : null
                                        }
                                        actions={
                                            <div className="flex gap-2 justify-end text-right w-full" onClick={(e) => e.stopPropagation()}>
                                                <Link href={`/admin/students/${student.id}/edit`} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <Link href={`/admin/students/${student.id}/id-card`} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                                    <CreditCard className="w-4 h-4" />
                                                </Link>
                                                <form action={handleDelete}>
                                                    <input type="hidden" name="id" value={student.id} />
                                                    <button type="submit" className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </form>
                                            </div>
                                        }
                                    >
                                        <DataCardRow label="Admission No" value={student.admissionNo} />
                                        <DataCardRow label="Parent" value={student.parent?.fatherName || student.parent?.motherName || 'N/A'} />
                                        <DataCardRow label="Gender" value={student.gender} />
                                        {student.documents && (
                                            <div className="pt-2 mt-2 border-t border-dashed border-slate-200 dark:border-slate-700" onClick={(e) => e.stopPropagation()}>
                                                <a href={student.documents} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline flex items-center">
                                                    <FileText className="w-3 h-3 mr-1" /> View Documents
                                                </a>
                                            </div>
                                        )}
                                    </DataCard>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
