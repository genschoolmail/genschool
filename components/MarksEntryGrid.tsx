'use client';

import React, { useState, useEffect } from 'react';
import { Save, Send, AlertCircle, CheckCircle } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    rollNo: string;
}

interface ExamResult {
    id?: string;
    studentId: string;
    marksObtained: number;
    status: 'PRESENT' | 'ABSENT';
    remarks?: string;
}

interface MarksEntryGridProps {
    students: Student[];
    maxMarks: number;
    passingMarks: number;
    scheduleId: string;
    existingResults: ExamResult[];
    workflowStatus: string;
    isLocked?: boolean;
    onSave?: (marks: ExamResult[]) => Promise<void>;
    onSubmit?: () => Promise<void>;
    gradingSystem?: any[];
}

export default function MarksEntryGrid({
    students,
    maxMarks,
    passingMarks,
    scheduleId,
    existingResults = [],
    workflowStatus,
    isLocked,
    onSave,
    onSubmit,
    gradingSystem = []
}: MarksEntryGridProps) {
    const [marks, setMarks] = useState<Map<string, ExamResult>>(new Map());
    const [errors, setErrors] = useState<Map<string, string>>(new Map());
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        // Initialize marks from existing results
        const initialMarks = new Map<string, ExamResult>();
        students.forEach(student => {
            const existing = existingResults.find(r => r.studentId === student.id);
            initialMarks.set(student.id, {
                studentId: student.id,
                marksObtained: existing?.marksObtained || 0,
                status: existing?.status || 'PRESENT',
                remarks: existing?.remarks || ''
            });
        });
        setMarks(initialMarks);
    }, [students, existingResults]);

    const validateMarks = (studentId: string, value: number): string | null => {
        if (value < 0) return 'Marks cannot be negative';
        if (value > maxMarks) return `Marks cannot exceed ${maxMarks}`;
        if (!Number.isInteger(value) && value % 0.5 !== 0) return 'Use whole numbers or .5 increments';
        return null;
    };

    const handleMarksChange = (studentId: string, value: string) => {
        const numValue = parseFloat(value) || 0;
        const error = validateMarks(studentId, numValue);

        if (error) {
            setErrors(prev => {
                const newErrors = new Map(prev);
                newErrors.set(studentId, error);
                return newErrors;
            });
        } else {
            setErrors(prev => {
                const newErrors = new Map(prev);
                newErrors.delete(studentId);
                return newErrors;
            });
        }

        setMarks(prev => {
            const newMarks = new Map(prev);
            const current = newMarks.get(studentId);
            if (current) {
                const updatedMark = { ...current, marksObtained: numValue };

                // Auto-mark present if marks entered
                if (numValue > 0 && updatedMark.status === 'ABSENT') {
                    updatedMark.status = 'PRESENT';
                }

                // Smart Auto-fill remarks
                if (!isNaN(numValue) && gradingSystem.length > 0) {
                    const grade = gradingSystem.find((g: any) => numValue >= g.minMarks && numValue <= g.maxMarks);
                    const newDefaultRemark = grade?.description || '';

                    // Check if current remark is empty or matches ANY possible auto-generated remark
                    // This heuristically determines if the user has "customized" it.
                    // If it's empty, we fill it.
                    // If it matches a known grade description, we assume it's still "auto" mode and update it.
                    const isCurrentRemarkAuto = !updatedMark.remarks || gradingSystem.some(g => g.description === updatedMark.remarks);

                    if (isCurrentRemarkAuto) {
                        updatedMark.remarks = newDefaultRemark;
                    }
                }

                newMarks.set(studentId, updatedMark);
            }
            return newMarks;
        });
    };

    const handleRemarksChange = (studentId: string, value: string) => {
        setMarks(prev => {
            const newMarks = new Map(prev);
            const current = newMarks.get(studentId);
            if (current) {
                // Just update the remarks. The handleMarksChange logic will see this as "custom"
                // if it doesn't match a grade description anymore.
                newMarks.set(studentId, { ...current, remarks: value });
            }
            return newMarks;
        });
    };

    const handleStatusChange = (studentId: string, status: 'PRESENT' | 'ABSENT') => {
        setMarks(prev => {
            const newMarks = new Map(prev);
            const current = newMarks.get(studentId);
            if (current) {
                newMarks.set(studentId, {
                    ...current,
                    status,
                    marksObtained: status === 'ABSENT' ? 0 : current.marksObtained,
                    remarks: status === 'ABSENT' ? 'Absent' : current.remarks
                });
            }
            return newMarks;
        });
    };

    const handleSave = async () => {
        if (errors.size > 0) {
            setMessage({ type: 'error', text: 'Please fix all errors before saving' });
            return;
        }

        if (onSave) {
            setSaving(true);
            try {
                await onSave(Array.from(marks.values()));
                setMessage({ type: 'success', text: 'Marks saved as draft successfully' });
                setTimeout(() => setMessage(null), 3000);
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message || 'Failed to save marks' });
            } finally {
                setSaving(false);
            }
        }
    };

    const handleSubmit = async () => {
        if (errors.size > 0) {
            setMessage({ type: 'error', text: 'Please fix all errors before submitting' });
            return;
        }

        // Check if all students have marks entered
        const allEntered = students.every(student => {
            const mark = marks.get(student.id);
            return mark && (mark.status === 'ABSENT' || mark.marksObtained > 0);
        });

        if (!allEntered) {
            if (!confirm('Some students have 0 marks. Are you sure you want to submit?')) {
                return;
            }
        }

        if (onSave && onSubmit) {
            setSaving(true);
            try {
                await onSave(Array.from(marks.values()));
                await onSubmit();
                setMessage({ type: 'success', text: 'Marks submitted for review successfully' });
            } catch (error: any) {
                setMessage({ type: 'error', text: error.message || 'Failed to submit marks' });
            } finally {
                setSaving(false);
            }
        }
    };

    const getGrade = (marksObtained: number, status: string) => {
        if (status === 'ABSENT') return 'AB';
        const percentage = (marksObtained / maxMarks) * 100;
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B';
        if (percentage >= 60) return 'C';
        if (percentage >= 50) return 'D';
        if (percentage >= passingMarks) return 'E';
        return 'F';
    };

    return (
        <div className="space-y-4">
            {/* Message Banner */}
            {message && (
                <div
                    className={`p-4 rounded-lg flex items-center gap-2 ${message.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                        }`}
                >
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </div>
            )}

            {/* Workflow Status */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Workflow Status</p>
                    <p className="font-semibold text-slate-800 dark:text-white capitalize">{workflowStatus}</p>
                </div>
                <div className="flex gap-2">
                    {!isLocked && (
                        <>
                            <button
                                onClick={handleSave}
                                disabled={saving || errors.size > 0}
                                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                            >
                                <Save className="w-4 h-4" />
                                Save Draft
                            </button>
                            {workflowStatus === 'DRAFT' && onSubmit && (
                                <button
                                    onClick={handleSubmit}
                                    disabled={saving || errors.size > 0}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit for Review
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Marks Entry Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 w-24">
                                    Roll No
                                </th>
                                <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Student Name
                                </th>
                                <th className="p-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 w-32">
                                    Status
                                </th>
                                <th className="p-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 w-32">
                                    Marks (/{maxMarks})
                                </th>
                                <th className="p-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 w-48">
                                    Remarks
                                </th>
                                <th className="p-4 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 w-24">
                                    Grade
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {students.map(student => {
                                const mark = marks.get(student.id);
                                const error = errors.get(student.id);
                                const isPassing = mark && mark.marksObtained >= passingMarks;
                                const grade = mark ? getGrade(mark.marksObtained, mark.status) : '-';

                                return (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-4 font-medium text-slate-800 dark:text-white">
                                            {student.rollNo}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">{student.name}</td>
                                        <td className="p-4 text-center">
                                            <select
                                                value={mark?.status || 'PRESENT'}
                                                onChange={(e) =>
                                                    handleStatusChange(student.id, e.target.value as 'PRESENT' | 'ABSENT')
                                                }
                                                disabled={isLocked}
                                                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm disabled:bg-slate-100 dark:disabled:bg-slate-800"
                                            >
                                                <option value="PRESENT">Present</option>
                                                <option value="ABSENT">Absent</option>
                                            </select>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                max={maxMarks}
                                                value={mark?.marksObtained || 0}
                                                onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                disabled={isLocked || mark?.status === 'ABSENT'}
                                                onFocus={(e) => e.target.select()}
                                                onWheel={(e) => e.currentTarget.blur()}
                                                className={`w-full px-3 py-2 border rounded-lg text-center font-semibold disabled:bg-slate-100 dark:disabled:bg-slate-800 ${error
                                                    ? 'border-red-500 bg-red-50'
                                                    : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                                                    } text-slate-800 dark:text-white`}
                                            />
                                            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={mark?.remarks || ''}
                                                onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                                disabled={isLocked}
                                                placeholder="Remarks"
                                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 dark:disabled:bg-slate-800 dark:text-white"
                                            />
                                        </td>
                                        <td className="p-4 text-center">
                                            <span
                                                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${grade === 'AB'
                                                    ? 'bg-slate-100 text-slate-800'
                                                    : isPassing
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                    }`}
                                            >
                                                {grade}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">Total Students</p>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{students.length}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">Present</p>
                    <p className="text-2xl font-bold text-green-800 dark:text-green-200">
                        {Array.from(marks.values()).filter(m => m.status === 'PRESENT').length}
                    </p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">Absent</p>
                    <p className="text-2xl font-bold text-red-800 dark:text-red-200">
                        {Array.from(marks.values()).filter(m => m.status === 'ABSENT').length}
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 dark:text-purple-400">Passing</p>
                    <p className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                        {
                            Array.from(marks.values()).filter(
                                m => m.status === 'PRESENT' && m.marksObtained >= passingMarks
                            ).length
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
