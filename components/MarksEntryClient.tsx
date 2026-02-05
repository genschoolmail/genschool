'use client';

import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface MarksEntryClientProps {
    examGroups: any[];
    classes: any[];
    subjects: any[];
    initialData?: any;
    role: 'ADMIN' | 'TEACHER';
}

export default function MarksEntryClient({
    examGroups,
    classes,
    subjects,
    role
}: MarksEntryClientProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Selection State
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');

    // Data State
    const [students, setStudents] = useState<any[]>([]);
    const [marksData, setMarksData] = useState<Record<string, number>>({});
    const [remarksData, setRemarksData] = useState<Record<string, string>>({});
    const [maxMarks, setMaxMarks] = useState(100);
    const [examScheduleId, setExamScheduleId] = useState('');

    // Fetch Students and existing marks when selection changes
    useEffect(() => {
        if (selectedExamId && selectedClassId && selectedSubjectId) {
            fetchMarksData();
        } else {
            setStudents([]);
        }
    }, [selectedExamId, selectedClassId, selectedSubjectId]);

    async function fetchMarksData() {
        setLoading(true);
        try {
            // This API endpoint needs to be created or we use a server action wrapper
            // For now, let's assume we fetch via a server action or API
            const response = await fetch(`/api/exams/marks?examGroupId=${selectedExamId}&classId=${selectedClassId}&subjectId=${selectedSubjectId}`);
            const data = await response.json();

            if (data.success) {
                setStudents(data.students);
                setExamScheduleId(data.examScheduleId);
                setMaxMarks(data.maxMarks);

                // Initialize marks state
                const marks: Record<string, number> = {};
                const remarks: Record<string, string> = {};

                data.results.forEach((r: any) => {
                    marks[r.studentId] = r.marksObtained;
                    remarks[r.studentId] = r.remarks || '';
                });

                setMarksData(marks);
                setRemarksData(remarks);
            }
        } catch (error) {
            console.error('Error fetching marks:', error);
            alert('Failed to load student list');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!examScheduleId) {
            alert('Exam schedule not found for this selection. Please check if exam is scheduled.');
            return;
        }

        setSaving(true);
        try {
            const resultsToSave = Object.keys(marksData).map(studentId => ({
                studentId,
                marks: marksData[studentId],
                remarks: remarksData[studentId]
            }));

            const response = await fetch('/api/exams/marks/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    examScheduleId,
                    results: resultsToSave
                })
            });

            const result = await response.json();
            if (result.success) {
                alert('Marks saved successfully!');
                router.refresh();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            alert('Error saving marks: ' + error.message);
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Exam Term
                        </label>
                        <select
                            value={selectedExamId}
                            onChange={(e) => setSelectedExamId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">Select Exam</option>
                            {examGroups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Class
                        </label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => (
                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Subject
                        </label>
                        <select
                            value={selectedSubjectId}
                            onChange={(e) => setSelectedSubjectId(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Marks Entry Grid */}
            {selectedExamId && selectedClassId && selectedSubjectId && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                            Enter Marks (Max: {maxMarks})
                        </h3>
                        <button
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Marks
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-600" />
                            <p className="mt-2 text-slate-500">Loading student list...</p>
                        </div>
                    ) : students.length > 0 ? (
                        <table className="w-full">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 w-24">Roll No</th>
                                    <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Student Name</th>
                                    <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 w-48">Marks Obtained</th>
                                    <th className="p-4 text-left text-sm font-semibold text-slate-700 dark:text-slate-200">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {students.map(student => (
                                    <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-4 font-medium text-slate-800 dark:text-white">
                                            {student.rollNo}
                                        </td>
                                        <td className="p-4 text-slate-600 dark:text-slate-300">
                                            {student.user.name}
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="number"
                                                min="0"
                                                max={maxMarks}
                                                value={marksData[student.id] ?? ''}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value);
                                                    if (val > maxMarks) return; // Prevent > max
                                                    setMarksData(prev => ({ ...prev, [student.id]: val }));
                                                }}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder={`Max ${maxMarks}`}
                                            />
                                        </td>
                                        <td className="p-4">
                                            <input
                                                type="text"
                                                value={remarksData[student.id] || ''}
                                                onChange={(e) => {
                                                    setRemarksData(prev => ({ ...prev, [student.id]: e.target.value }));
                                                }}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
                                                placeholder="Optional remarks"
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="p-12 text-center text-slate-500">
                            No students found or exam not scheduled for this class/subject.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
