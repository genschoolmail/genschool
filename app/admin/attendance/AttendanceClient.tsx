'use client';

import React, { useState, useEffect } from 'react';
import { markAttendance } from '@/lib/actions';
import { toast } from 'sonner';
import { DataCard, DataCardRow } from '@/components/ui/DataCard';
import ScrollIndicator from '@/components/ui/ScrollIndicator';
import CardViewToggle from '@/components/ui/CardViewToggle';
import { Check, X, Clock } from 'lucide-react';

interface Student {
    id: string;
    user: {
        name: string | null;
    };
    admissionNo: string;
}

interface Class {
    id: string;
    name: string;
    section: string;
    students: Student[];
}

interface AttendanceClientProps {
    classes: Class[];
}

export default function AttendanceClient({ classes }: AttendanceClientProps) {
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [view, setView] = useState<'list' | 'card'>('list');

    const selectedClass = classes.find(c => c.id === selectedClassId);

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

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Select Class</label>
                        <select
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            <option value="">-- Select Class --</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    Class {cls.name}-{cls.section}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date</label>
                        <input
                            type="date"
                            className="w-full p-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {selectedClass && (
                <form action={async (formData) => {
                    try {
                        await markAttendance(formData);
                        toast.success('✅ Attendance marked successfully!', {
                            description: `Saved for Class ${selectedClass.name}-${selectedClass.section}`,
                            duration: 3000,
                        });
                    } catch (error) {
                        toast.error('❌ Failed to mark attendance', {
                            description: 'Please try again',
                        });
                    }
                }} className="space-y-6">
                    <input type="hidden" name="classId" value={selectedClassId} />
                    <input type="hidden" name="date" value={date} />

                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Students ({selectedClass.students.length})
                        </h3>
                        <CardViewToggle view={view} onViewChange={setView} />
                    </div>

                    {view === 'list' ? (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <ScrollIndicator>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Admission No</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Student Name</th>
                                            <th className="p-4 font-semibold text-slate-600 dark:text-slate-300 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedClass.students.map((student) => (
                                            <tr key={student.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="p-4 text-slate-600 dark:text-slate-400">{student.admissionNo}</td>
                                                <td className="p-4 font-medium text-slate-800 dark:text-white">{student.user.name}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-4">
                                                        <label className="flex items-center cursor-pointer group">
                                                            <input type="radio" name={`status_${student.id}`} value="PRESENT" defaultChecked className="peer sr-only" />
                                                            <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 peer-checked:bg-emerald-100 peer-checked:text-emerald-700 peer-checked:border-emerald-200 dark:peer-checked:bg-emerald-900/30 dark:peer-checked:text-emerald-400 transition-all flex items-center gap-2">
                                                                <Check className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Present</span>
                                                            </div>
                                                        </label>
                                                        <label className="flex items-center cursor-pointer group">
                                                            <input type="radio" name={`status_${student.id}`} value="ABSENT" className="peer sr-only" />
                                                            <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 peer-checked:bg-red-100 peer-checked:text-red-700 peer-checked:border-red-200 dark:peer-checked:bg-red-900/30 dark:peer-checked:text-red-400 transition-all flex items-center gap-2">
                                                                <X className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Absent</span>
                                                            </div>
                                                        </label>
                                                        <label className="flex items-center cursor-pointer group">
                                                            <input type="radio" name={`status_${student.id}`} value="LATE" className="peer sr-only" />
                                                            <div className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 peer-checked:bg-yellow-100 peer-checked:text-yellow-700 peer-checked:border-yellow-200 dark:peer-checked:bg-yellow-900/30 dark:peer-checked:text-yellow-400 transition-all flex items-center gap-2">
                                                                <Clock className="w-4 h-4" />
                                                                <span className="text-sm font-medium">Late</span>
                                                            </div>
                                                        </label>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </ScrollIndicator>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedClass.students.map((student) => (
                                <DataCard
                                    key={student.id}
                                    title={student.user.name || 'Unknown'}
                                    subtitle={`Adm: ${student.admissionNo}`}
                                    className="border-l-4 border-l-indigo-500"
                                >
                                    <div className="mt-4 grid grid-cols-3 gap-2">
                                        <label className="cursor-pointer">
                                            <input type="radio" name={`status_${student.id}`} value="PRESENT" defaultChecked className="peer sr-only" />
                                            <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:bg-emerald-50 peer-checked:border-emerald-200 peer-checked:text-emerald-700 dark:peer-checked:bg-emerald-900/20 dark:peer-checked:text-emerald-400 transition-all text-center h-full">
                                                <Check className="w-5 h-5 mb-1" />
                                                <span className="text-xs font-medium">Present</span>
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="radio" name={`status_${student.id}`} value="ABSENT" className="peer sr-only" />
                                            <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:bg-red-50 peer-checked:border-red-200 peer-checked:text-red-700 dark:peer-checked:bg-red-900/20 dark:peer-checked:text-red-400 transition-all text-center h-full">
                                                <X className="w-5 h-5 mb-1" />
                                                <span className="text-xs font-medium">Absent</span>
                                            </div>
                                        </label>
                                        <label className="cursor-pointer">
                                            <input type="radio" name={`status_${student.id}`} value="LATE" className="peer sr-only" />
                                            <div className="flex flex-col items-center justify-center p-2 rounded-lg border border-slate-200 dark:border-slate-700 peer-checked:bg-yellow-50 peer-checked:border-yellow-200 peer-checked:text-yellow-700 dark:peer-checked:bg-yellow-900/20 dark:peer-checked:text-yellow-400 transition-all text-center h-full">
                                                <Clock className="w-5 h-5 mb-1" />
                                                <span className="text-xs font-medium">Late</span>
                                            </div>
                                        </label>
                                    </div>
                                </DataCard>
                            ))}
                        </div>
                    )}

                    <div className="sticky bottom-4 z-30 flex justify-end">
                        <button type="submit" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg rounded-full shadow-xl shadow-indigo-500/40 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2">
                            <Check className="w-6 h-6" />
                            Save Attendance
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
