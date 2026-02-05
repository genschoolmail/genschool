'use client';

import React, { useState, useTransition } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { saveMarks } from '@/lib/marks-actions';

interface MarksVerificationGridProps {
    examSchedule: any;
    students: any[];
    students: any[];
    onSaved?: () => void;
    gradingSystem?: any[];
}

export default function MarksVerificationGrid({ examSchedule, students: initialStudents, onSaved, gradingSystem = [] }: MarksVerificationGridProps) {
    const [students, setStudents] = useState(initialStudents);
    const [isPending, startTransition] = useTransition();

    const handleMarksChange = (studentId: string, value: string) => {
        const numValue = parseFloat(value);
        if (numValue > examSchedule.maxMarks) {
            toast.error(`Marks cannot exceed maximum marks (${examSchedule.maxMarks})`);
            return;
        }

        setStudents(prev => prev.map(s => {
            if (s.id !== studentId) return s;

            const updatedStudent = { ...s, marksObtained: value === '' ? null : numValue };

            // Auto-populate remark if it's currently empty or previously auto-filled
            // We'll simplisticly just set it if empty.
            if (value !== '' && gradingSystem.length > 0) {
                const grade = gradingSystem.find((g: any) => numValue >= g.minMarks && numValue <= g.maxMarks);
                if (grade && grade.description && !s.remarks) {
                    updatedStudent.remarks = grade.description;
                }
            }

            return updatedStudent;
        }));
    };

    const handleRemarksChange = (studentId: string, value: string) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, remarks: value } : s
        ));
    };

    const handleSave = async () => {
        const marksData = students.map(s => ({
            studentId: s.id,
            marksObtained: s.marksObtained ?? 0,
            remarks: s.remarks
        }));

        startTransition(async () => {
            try {
                // In a real app, 'Admin' would come from the session
                const result = await saveMarks(examSchedule.id, marksData, 'Admin (Verified)');
                if (result.success) {
                    toast.success('Marks verified and saved successfully');
                    if (onSaved) onSaved();
                } else {
                    toast.error(result.error || 'Failed to save marks');
                }
            } catch (error: any) {
                toast.error(error.message || 'An error occurred');
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Verify Marks: {examSchedule.subject.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                        Class {examSchedule.class.name}-{examSchedule.class.section} | Max Marks: {examSchedule.maxMarks}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isPending}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-4 h-4" />
                            Verify & Save
                        </>
                    )}
                </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Roll No</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Student Name</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 w-32">Marks</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">Remarks</th>
                            <th className="px-6 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300 w-24">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {students.map((student) => (
                            <tr key={student.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-medium">
                                    {student.rollNo}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {student.image && (
                                            <img src={student.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                        )}
                                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                            {student.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        value={student.marksObtained ?? ''}
                                        onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                        onFocus={(e) => e.target.select()}
                                        onWheel={(e) => e.currentTarget.blur()}
                                        step="0.5"
                                        min="0"
                                        max={examSchedule.maxMarks}
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="text"
                                        value={student.remarks}
                                        onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                        placeholder="Optional remarks"
                                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    {student.marksObtained !== null ? (
                                        <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                                            <CheckCircle2 className="w-4 h-4" />
                                            <span className="text-xs font-medium">Entered</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                            <AlertCircle className="w-4 h-4" />
                                            <span className="text-xs font-medium">Pending</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
