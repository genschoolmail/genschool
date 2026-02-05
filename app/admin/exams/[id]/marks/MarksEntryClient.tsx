'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { addResult, bulkUpdateMarks } from '@/lib/marks-entry-actions';
import { CheckCircle, AlertCircle, Save, UserX, UserCheck } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
    id: string;
    rollNo: string | null;
    user: {
        name: string | null;
    };
}

interface MarksEntryClientProps {
    exam: {
        id: string;
        name: string;
        totalMarks: number;
        subject: { name: string };
        class: { name: string; section: string };
    };
    students: Student[];
    initialMarks: Record<string, string>;
    initialStatuses?: Record<string, string>;
    canEdit: boolean;
    publishedStatus: string;
    userRole: string;
}

export function MarksEntryClient({ exam, students, initialMarks, initialStatuses = {}, canEdit, publishedStatus, userRole }: MarksEntryClientProps) {
    const router = useRouter();
    const [marks, setMarks] = useState<Record<string, string>>(
        Object.fromEntries(students.map(s => [s.id, (initialMarks[s.id] || "0")]))
    );
    const [absentStatus, setAbsentStatus] = useState<Record<string, boolean>>(
        Object.fromEntries(students.map(s => [s.id, initialStatuses[s.id] === 'ABSENT']))
    );

    const [statuses, setStatuses] = useState<Record<string, { type: 'success' | 'error'; message: string } | null>>({});
    const [isPending, startTransition] = useTransition();
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Track changes
    const handleMarkChange = (studentId: string, value: string) => {
        setMarks(prev => ({ ...prev, [studentId]: value }));
        setHasUnsavedChanges(true);
    };

    const toggleAbsent = (studentId: string) => {
        setAbsentStatus(prev => {
            const newStatus = !prev[studentId];
            if (newStatus) {
                setMarks(m => ({ ...m, [studentId]: '0' }));
            }
            return { ...prev, [studentId]: newStatus };
        });
        setHasUnsavedChanges(true);
    };

    const handleSubmit = async (studentId: string) => {
        const markValue = marks[studentId];
        const isAbsent = absentStatus[studentId];

        const formData = new FormData();
        formData.append('examId', exam.id);
        formData.append('studentId', studentId);
        formData.append('marks', markValue || '0');
        formData.append('status', isAbsent ? 'ABSENT' : 'PRESENT');

        startTransition(async () => {
            const result = await addResult(formData);

            if (result?.success) {
                setStatuses(prev => ({
                    ...prev,
                    [studentId]: { type: 'success', message: result.message || 'Saved!' }
                }));
                setTimeout(() => {
                    setStatuses(prev => ({ ...prev, [studentId]: null }));
                }, 3000);
            } else {
                setStatuses(prev => ({
                    ...prev,
                    [studentId]: { type: 'error', message: result?.error || 'Failed to save' }
                }));
            }
        });
    };

    const handleBulkSave = async () => {
        startTransition(async () => {
            const updates = students.map(student => ({
                studentId: student.id,
                marks: marks[student.id] || '0',
                status: absentStatus[student.id] ? 'ABSENT' : 'PRESENT'
            }));

            const result = await bulkUpdateMarks(exam.id, updates);

            if (result?.success) {
                setHasUnsavedChanges(false);
                toast.success((result as any).message || 'All marks saved successfully!');
                router.refresh();
            } else {
                toast.error(result.error || 'Failed to save marks. Please try again.');
            }
        });
    };

    return (
        <div className="space-y-6">
            {/* Permission Warning */}
            {!canEdit && (
                <div className={`p-4 rounded-lg border ${publishedStatus === 'LOCKED'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    }`}>
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <div>
                            <p className="font-semibold">
                                {publishedStatus === 'LOCKED' ? 'Results Locked' : 'Read-Only Mode'}
                            </p>
                            <p className="text-sm mt-1">
                                {publishedStatus === 'LOCKED'
                                    ? 'These results have been locked and cannot be edited.'
                                    : userRole === 'TEACHER'
                                        ? 'Results have been published. Only admins can edit published results.'
                                        : 'You do not have permission to edit these marks.'}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Enter Marks</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {exam.name} - {exam.subject.name} (Class {exam.class.name}-{exam.class.section})
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-500 mt-1">
                        Maximum Marks: <span className="font-semibold">{exam.totalMarks || 'N/A'}</span>
                        {publishedStatus !== 'DRAFT' && (
                            <span className={`ml-3 px-2 py-0.5 text-xs rounded-full ${publishedStatus === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                                publishedStatus === 'LOCKED' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                {publishedStatus}
                            </span>
                        )}
                    </p>
                </div>
                <button
                    onClick={handleBulkSave}
                    disabled={isPending || !hasUnsavedChanges || !canEdit}
                    className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-sm
                        ${hasUnsavedChanges && canEdit
                            ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                            : 'bg-slate-400 cursor-not-allowed'}`}
                >
                    <Save className="w-5 h-5" />
                    {isPending ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 w-24">Roll No</th>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200">Student Name</th>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 w-32 text-center">Status</th>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 w-40">Marks Obtained</th>
                                <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 w-32 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map(student => {
                                const status = statuses[student.id];
                                const isAbsent = absentStatus[student.id];
                                const currentMarks = marks[student.id];
                                const maxMarks = exam.totalMarks || 100;
                                const isInvalid = parseFloat(currentMarks) > maxMarks || parseFloat(currentMarks) < 0;

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono">
                                            {student.rollNo || '-'}
                                        </td>
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-white">
                                            {student.user.name}
                                        </td>
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-center">
                                            <button
                                                onClick={() => toggleAbsent(student.id)}
                                                disabled={!canEdit}
                                                className={`p-2 rounded-lg transition-colors ${isAbsent
                                                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                                    : 'bg-green-100 text-green-600 hover:bg-green-200'
                                                    } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title={isAbsent ? "Mark Present" : "Mark Absent"}
                                            >
                                                {isAbsent ? <UserX className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
                                            </button>
                                        </td>
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700">
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max={maxMarks}
                                                    value={currentMarks || ''}
                                                    onChange={(e) => handleMarkChange(student.id, e.target.value)}
                                                    disabled={isAbsent || !canEdit}
                                                    placeholder={isAbsent ? "Absent" : "0.00"}
                                                    onFocus={(e) => e.target.select()}
                                                    onWheel={(e) => e.currentTarget.blur()}
                                                    className={`w-full px-3 py-2 border rounded-lg outline-none transition-all
                                                        ${isInvalid
                                                            ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                                                            : 'border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500'}
                                                        ${isAbsent || !canEdit ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-white dark:bg-slate-700'}
                                                    `}
                                                />
                                                {isInvalid && !isAbsent && (
                                                    <span className="absolute -bottom-5 left-0 text-xs text-red-500 font-medium">
                                                        Max: {maxMarks}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {status ? (
                                                    <div className={`flex items-center gap-1 text-sm ${status.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                                                        }`}>
                                                        <span className="hidden sm:inline">{status.message}</span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleSubmit(student.id)}
                                                        disabled={isPending || !canEdit}
                                                        className={`p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        title="Save"
                                                    >
                                                        <Save className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend/Help */}
            <div className="flex gap-6 text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <span>Present (Enter Marks)</span>
                </div>
                <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-red-600" />
                    <span>Absent (Marks = 0)</span>
                </div>
                <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-indigo-600" />
                    <span>Use "Save All Changes" for bulk update</span>
                </div>
            </div>
        </div>
    );
}
