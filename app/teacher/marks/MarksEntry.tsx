'use client';

import React, { useState, useEffect } from 'react';
import { Save, BookOpen, Users, Calendar } from 'lucide-react';
import { getExamStudents, saveMarks } from '@/lib/marks-actions';
import { useRouter } from 'next/navigation';

interface ExamSchedule {
    id: string;
    examGroup: { name: string };
    class: { name: string; section: string };
    subject: { name: string };
    maxMarks: number;
    passingMarks: number;
}

interface Student {
    id: string;
    name: string | null;
    rollNo: string | null;
    image: string | null;
    marksObtained: number | null;
    remarks: string;
}

export default function MarksEntry({
    examSchedules,
    userId
}: {
    examSchedules: ExamSchedule[];
    userId: string;
}) {
    const [selectedExamId, setSelectedExamId] = useState<string>(examSchedules[0]?.id || '');
    const [examSchedule, setExamSchedule] = useState<any>(null);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (selectedExamId) {
            fetchStudents();
        }
    }, [selectedExamId]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const data = await getExamStudents(selectedExamId);
            setExamSchedule(data.examSchedule);
            setStudents(data.students);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarksChange = (studentId: string, marks: string) => {
        const marksValue = marks === '' ? null : parseFloat(marks);
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, marksObtained: marksValue } : s
        ));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, remarks } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const marksData = students
                .filter(s => s.marksObtained !== null)
                .map(s => ({
                    studentId: s.id,
                    marksObtained: s.marksObtained!,
                    remarks: s.remarks
                }));

            if (marksData.length === 0) {
                alert('Please enter marks for at least one student.');
                setSaving(false);
                return;
            }

            await saveMarks(selectedExamId, marksData, userId);
            alert('Marks saved successfully!');
            router.refresh();
        } catch (error) {
            console.error('Error saving marks:', error);
            alert('Failed to save marks.');
        } finally {
            setSaving(false);
        }
    };

    if (examSchedules.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Exam Schedules</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    There are no exams scheduled for your classes yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex-1 min-w-[300px]">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Exam</label>
                    <select
                        value={selectedExamId}
                        onChange={(e) => setSelectedExamId(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                        {examSchedules.map(exam => (
                            <option key={exam.id} value={exam.id}>
                                {exam.examGroup.name} - {exam.subject.name} - Class {exam.class.name}-{exam.class.section}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Marks'}
                </button>
            </div>

            {/* Progress Bar (New Feature) */}
            {!loading && students.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Completion Progress</span>
                        <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                            {Math.round((students.filter(s => s.marksObtained !== null).length / students.length) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(students.filter(s => s.marksObtained !== null).length / students.length) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Exam Info */}
            {examSchedule && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Exam</p>
                            <p className="font-bold text-slate-900 dark:text-white">{examSchedule.examGroup?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Subject</p>
                            <p className="font-bold text-slate-900 dark:text-white">{examSchedule.subject?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Max Marks</p>
                            <p className="font-bold text-slate-900 dark:text-white">{examSchedule.maxMarks}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Passing Marks</p>
                            <p className="font-bold text-slate-900 dark:text-white">{examSchedule.passingMarks}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Marks Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Loading students...</div>
                ) : students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                    <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Roll No</th>
                                    <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Student</th>
                                    <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Marks Obtained</th>
                                    <th className="p-4 font-medium text-slate-500 dark:text-slate-400">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => (
                                    <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-sm">
                                            {student.rollNo || '-'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {student.image ? (
                                                    <img src={student.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                        {student.name?.charAt(0)}
                                                    </div>
                                                )}
                                                <span className="font-medium text-slate-900 dark:text-white">{student.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max={examSchedule?.maxMarks || 100}
                                                step="0.5"
                                                value={student.marksObtained ?? ''}
                                                onChange={(e) => handleMarksChange(student.id, e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                onWheel={(e) => e.currentTarget.blur()}
                                                placeholder="Enter marks"
                                                className="w-24 p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            />
                                            <span className="ml-2 text-slate-500 text-sm">/ {examSchedule?.maxMarks}</span>
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={student.remarks}
                                                onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                                                placeholder="Optional"
                                                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">No students found for this exam.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
