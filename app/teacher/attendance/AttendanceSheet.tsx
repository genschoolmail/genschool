'use client';

import React, { useState, useEffect } from 'react';
import { Save, Check, X, Clock, Users } from 'lucide-react';
import { getClassAttendance, saveAttendance } from '@/lib/attendance-actions';
import { useRouter } from 'next/navigation';

interface Class {
    id: string;
    name: string;
    section: string;
}

interface Student {
    id: string;
    name: string | null;
    rollNo: string | null;
    image: string | null;
    status: string;
}

export default function AttendanceSheet({ classes }: { classes: Class[] }) {
    const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (selectedClassId && date) {
            fetchAttendance();
        }
    }, [selectedClassId, date]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const data = await getClassAttendance(selectedClassId, new Date(date));
            setStudents(data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, status } : s
        ));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const attendanceData = students.map(s => ({
                studentId: s.id,
                status: s.status
            }));
            await saveAttendance(selectedClassId, new Date(date), attendanceData);
            alert('Attendance saved successfully!');
            router.refresh();
        } catch (error) {
            console.error('Error saving attendance:', error);
            alert('Failed to save attendance.');
        } finally {
            setSaving(false);
        }
    };

    if (classes.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-slate-500">No classes assigned to you.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-4 items-center flex-1 min-w-[300px]">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Select Class</label>
                        <select
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        >
                            {classes.map(cls => (
                                <option key={cls.id} value={cls.id}>
                                    Class {cls.name} - {cls.section}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-bold text-slate-900 dark:text-white">{students.length}</span> Students
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Attendance'}
                    </button>
                </div>
            </div>

            {/* Attendance Table */}
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
                                    <th className="p-4 font-medium text-slate-500 dark:text-slate-400 text-center">Status</th>
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
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                    className={`p-2 rounded-lg flex items-center gap-1 transition-colors ${student.status === 'PRESENT'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-800'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-green-50 hover:text-green-600 dark:bg-slate-700 dark:text-slate-400'
                                                        }`}
                                                    title="Present"
                                                >
                                                    <Check className="w-4 h-4" />
                                                    <span className="text-xs font-bold">P</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                    className={`p-2 rounded-lg flex items-center gap-1 transition-colors ${student.status === 'ABSENT'
                                                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-2 ring-red-500 ring-offset-2 dark:ring-offset-slate-800'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:bg-slate-700 dark:text-slate-400'
                                                        }`}
                                                    title="Absent"
                                                >
                                                    <X className="w-4 h-4" />
                                                    <span className="text-xs font-bold">A</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'LATE')}
                                                    className={`p-2 rounded-lg flex items-center gap-1 transition-colors ${student.status === 'LATE'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-2 ring-yellow-500 ring-offset-2 dark:ring-offset-slate-800'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-yellow-50 hover:text-yellow-600 dark:bg-slate-700 dark:text-slate-400'
                                                        }`}
                                                    title="Late"
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-xs font-bold">L</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 dark:text-slate-400">No students found in this class.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
