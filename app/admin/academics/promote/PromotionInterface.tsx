'use client';

import React, { useState } from 'react';
import { promoteStudents } from '@/lib/actions/academics';
import { ArrowRight, CheckSquare, Square, Users, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PromotionPreview } from './PromotionPreview';

type Student = {
    id: string;
    admissionNo: string;
    user: { name: string };
    rollNo: string | null;
};

type Class = {
    id: string;
    name: string;
    section: string;
};

type Props = {
    classes: Class[];
    students: Student[];
    currentClassId?: string;
};

type ToastType = 'success' | 'error';

export default function PromotionInterface({ classes, students, currentClassId }: Props) {
    const router = useRouter();
    const [fromClassId, setFromClassId] = useState(currentClassId || '');
    const [toClassId, setToClassId] = useState('');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
    const [formData, setFormData] = useState<FormData | null>(null);
    const [promotionMode, setPromotionMode] = useState<'bulk' | 'single'>('bulk');
    const [singleStudentId, setSingleStudentId] = useState('');
    const [remarks, setRemarks] = useState('');

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const classId = e.target.value;
        setFromClassId(classId);
        if (classId) {
            router.push(`/admin/academics/promote?classId=${classId}`);
        } else {
            router.push('/admin/academics/promote');
        }
    };

    const toggleStudent = (id: string) => {
        if (promotionMode === 'single') {
            setSingleStudentId(id === singleStudentId ? '' : id);
        } else {
            setSelectedStudents(prev =>
                prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
            );
        }
    };

    const toggleAll = () => {
        if (promotionMode === 'single') return;
        if (selectedStudents.length === students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(students.map(s => s.id));
        }
    };

    const showToast = (type: ToastType, message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 5000);
    };

    const handlePromoteClick = async (formData: FormData) => {
        // Client-side validation
        if (promotionMode === 'bulk' && selectedStudents.length === 0) {
            showToast('error', 'Please select at least one student');
            return;
        }
        if (promotionMode === 'single' && !singleStudentId) {
            showToast('error', 'Please select a student');
            return;
        }
        if (!toClassId) {
            showToast('error', 'Please select a target class');
            return;
        }
        if (fromClassId === toClassId) {
            showToast('error', 'Target class cannot be the same as current class');
            return;
        }

        if (promotionMode === 'bulk') {
            // Store formData and show preview for bulk
            setFormData(formData);
            setShowPreview(true);
        } else {
            // Direct promotion for single student
            if (!confirm('Are you sure you want to promote this student?')) return;

            setLoading(true);
            try {
                // Add specific fields for single promotion
                formData.append('studentId', singleStudentId);
                formData.append('toClassId', toClassId);
                // academicYear and promotedBy are already in the form

                // We need to import promoteSingleStudent dynamically or pass it as prop if it was a server action passed down
                // But since we imported promoteStudents from @/lib/actions/academics, we should import promoteSingleStudent too.
                // Assuming it's exported from the same file.
                const { promoteSingleStudent } = await import('@/lib/actions/academics');

                const result = await promoteSingleStudent(formData);

                if (result?.success) {
                    showToast('success', result.message || 'Student promoted successfully!');
                    setSingleStudentId('');
                    setRemarks('');
                    setTimeout(() => {
                        router.refresh();
                        setLoading(false);
                    }, 500);
                } else {
                    showToast('error', result?.error || 'Failed to promote student');
                    setLoading(false);
                }
            } catch (error) {
                console.error('Single promotion failed', error);
                showToast('error', 'An unexpected error occurred');
                setLoading(false);
            }
        }
    };

    const handleConfirmPromotion = async () => {
        if (!formData) return;

        setLoading(true);
        try {
            // Append selected students to formData
            formData.append('studentIds', JSON.stringify(selectedStudents));
            formData.append('fromClassId', fromClassId);

            const result = await promoteStudents(formData);

            if (result?.success) {
                // Close modal FIRST
                setShowPreview(false);
                setLoading(false);

                // Then show toast
                showToast('success', result.message || 'Students promoted successfully!');

                // Clear selections
                setSelectedStudents([]);
                setToClassId('');

                // Refresh page after a short delay
                setTimeout(() => {
                    router.refresh();
                }, 500);
            } else {
                setShowPreview(false);
                setLoading(false);
                showToast('error', result?.error || 'Failed to promote students');
            }
        } catch (error) {
            console.error('Promotion failed', error);
            setShowPreview(false);
            setLoading(false);
            showToast('error', 'An unexpected error occurred');
        }
    };

    const fromClass = classes.find(c => c.id === fromClassId);
    const toClass = classes.find(c => c.id === toClassId);
    const selectedStudentsList = students.filter(s => selectedStudents.includes(s.id));

    return (
        <div className="space-y-8">
            {/* Toast Notification */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg animate-in slide-in-from-top ${toast.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                    }`}>
                    {toast.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    )}
                    <p className={`font-medium ${toast.type === 'success'
                        ? 'text-green-800 dark:text-green-200'
                        : 'text-red-800 dark:text-red-200'
                        }`}>
                        {toast.message}
                    </p>
                </div>
            )}

            {/* Promotion Preview Modal */}
            {showPreview && fromClass && toClass && (
                <PromotionPreview
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    onConfirm={handleConfirmPromotion}
                    students={selectedStudentsList}
                    fromClass={fromClass}
                    toClass={toClass}
                    academicYear={formData?.get('academicYear') as string || ''}
                    promotedBy={formData?.get('promotedBy') as string || ''}
                    loading={loading}
                />
            )}

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700 pb-4">
                    <button
                        onClick={() => setPromotionMode('bulk')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${promotionMode === 'bulk'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        Bulk Promotion
                    </button>
                    <button
                        onClick={() => setPromotionMode('single')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${promotionMode === 'single'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        Single Student Promotion
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Promote From Class</label>
                        <select
                            value={fromClassId}
                            onChange={handleClassChange}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Promote To Class</label>
                        <select
                            name="toClassId"
                            value={toClassId}
                            onChange={(e) => setToClassId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                            disabled={!fromClassId}
                        >
                            <option value="">Select Target Class</option>
                            {classes.filter(c => c.id !== fromClassId).map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {fromClassId && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-600" />
                            Students List ({students.length})
                        </h3>
                        <div className="text-sm text-slate-500">
                            {promotionMode === 'bulk'
                                ? `${selectedStudents.length} selected`
                                : singleStudentId ? '1 student selected' : 'Select a student'
                            }
                        </div>
                    </div>

                    {students.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="p-4 w-12">
                                                {promotionMode === 'bulk' && (
                                                    <button onClick={toggleAll} className="text-slate-500 hover:text-indigo-600">
                                                        {selectedStudents.length === students.length && students.length > 0 ? (
                                                            <CheckSquare className="w-5 h-5" />
                                                        ) : (
                                                            <Square className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                )}
                                            </th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Admission No</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                                            <th className="p-4 font-semibold text-slate-700 dark:text-slate-300">Roll No</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {students.map((student) => {
                                            const isSelected = promotionMode === 'bulk'
                                                ? selectedStudents.includes(student.id)
                                                : singleStudentId === student.id;

                                            return (
                                                <tr
                                                    key={student.id}
                                                    className={`hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''}`}
                                                    onClick={() => toggleStudent(student.id)}
                                                >
                                                    <td className="p-4">
                                                        {isSelected ? (
                                                            <CheckSquare className="w-5 h-5 text-indigo-600" />
                                                        ) : (
                                                            <Square className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-sm">
                                                        {student.admissionNo}
                                                    </td>
                                                    <td className="p-4 font-medium text-slate-800 dark:text-white">
                                                        {student.user.name}
                                                    </td>
                                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                                        {student.rollNo || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <form action={handlePromoteClick} className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Academic Year (Next Session)</label>
                                        <input
                                            name="academicYear"
                                            defaultValue="2025-2026"
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Promoted By</label>
                                        <input
                                            name="promotedBy"
                                            defaultValue="Admin"
                                            required
                                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>

                                    {promotionMode === 'single' && (
                                        <div className="flex-1 w-full">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Remarks</label>
                                            <input
                                                name="remarks"
                                                value={remarks}
                                                onChange={(e) => setRemarks(e.target.value)}
                                                placeholder="Optional remarks"
                                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || (promotionMode === 'bulk' ? selectedStudents.length === 0 : !singleStudentId) || !toClassId}
                                        className="w-full md:w-auto px-8 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {promotionMode === 'bulk' ? 'Promote Selected' : 'Promote Student'}
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            No students found in this class.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
