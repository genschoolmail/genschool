'use client';

import React, { useState } from 'react';
import { updateTimetableEntry } from '@/lib/actions/academics';
import { Save, X, Plus } from 'lucide-react';

type TimetableEntry = {
    id: string;
    day: string;
    timeSlotId: string;
    subjectId: string | null;
    teacherId: string | null;
    subject: { name: string; code: string | null } | null;
    teacher: { user: { name: string } } | null;
};

type Props = {
    classId: string;
    initialData: TimetableEntry[];
    timeSlots: any[];
    subjects: any[];
    teachers: any[];
    readOnly?: boolean;
};

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function TimetableBuilder({ classId, initialData, timeSlots, subjects, teachers, readOnly = false }: Props) {
    const [entries, setEntries] = useState<TimetableEntry[]>(initialData);
    const [editingCell, setEditingCell] = useState<{ day: string; timeSlotId: string } | null>(null);
    const [loading, setLoading] = useState(false);

    const getEntry = (day: string, timeSlotId: string) => {
        return entries.find(e => e.day === day && e.timeSlotId === timeSlotId);
    };

    const handleSave = async (formData: FormData) => {
        setLoading(true);
        try {
            await updateTimetableEntry(formData);

            // Optimistic update (simplified, ideally we'd get the new entry back)
            // For now, we'll rely on server revalidation to refresh the page data
            // But to make UI responsive, we can close the modal immediately
            setEditingCell(null);
        } catch (error) {
            console.error('Failed to save timetable entry', error);
            alert('Failed to save entry');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (time: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        let h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        h = h ? h : 12;
        return `${h}:${minutes} ${ampm}`;
    };

    return (
        <div className="overflow-x-auto pb-20">
            <table className="w-full border-collapse min-w-[1000px]">
                <thead>
                    <tr>
                        <th className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-left font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-10 w-32">
                            Day / Time
                        </th>
                        {timeSlots.map(slot => (
                            <th key={slot.id} className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center min-w-[160px]">
                                <div className="font-semibold text-slate-800 dark:text-white">{slot.label}</div>
                                <div className="text-xs text-slate-500 font-normal">
                                    {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {DAYS.map(day => (
                        <tr key={day}>
                            <td className="p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 sticky left-0 z-10">
                                {day}
                            </td>
                            {timeSlots.map(slot => {
                                const entry = getEntry(day, slot.id);
                                const isEditing = editingCell?.day === day && editingCell?.timeSlotId === slot.id;

                                return (
                                    <td key={slot.id} className="p-2 border border-slate-200 dark:border-slate-700 relative h-32 align-top">
                                        {isEditing ? (
                                            <div className="absolute inset-0 bg-white dark:bg-slate-800 z-20 p-2 shadow-lg border-2 border-indigo-500 rounded-lg flex flex-col gap-2">
                                                <form action={handleSave} className="flex flex-col h-full gap-2">
                                                    <input type="hidden" name="classId" value={classId} />
                                                    <input type="hidden" name="day" value={day} />
                                                    <input type="hidden" name="timeSlotId" value={slot.id} />

                                                    <select
                                                        name="subjectId"
                                                        defaultValue={entry?.subjectId || ''}
                                                        className="w-full text-sm p-1 border rounded dark:bg-slate-700 dark:border-slate-600 outline-none"
                                                    >
                                                        <option value="">No Subject</option>
                                                        {subjects.map(s => (
                                                            <option key={s.id} value={s.id}>{s.name}</option>
                                                        ))}
                                                    </select>

                                                    <select
                                                        name="teacherId"
                                                        defaultValue={entry?.teacherId || ''}
                                                        className="w-full text-sm p-1 border rounded dark:bg-slate-700 dark:border-slate-600 outline-none"
                                                    >
                                                        <option value="">No Teacher</option>
                                                        {teachers.map(t => (
                                                            <option key={t.id} value={t.id}>{t.user.name || 'Unknown'}</option>
                                                        ))}
                                                    </select>

                                                    <div className="mt-auto flex gap-2">
                                                        <button
                                                            type="submit"
                                                            disabled={loading}
                                                            className="flex-1 bg-indigo-600 text-white text-xs py-1 rounded hover:bg-indigo-700 flex items-center justify-center gap-1"
                                                        >
                                                            <Save className="w-3 h-3" /> Save
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCell(null)}
                                                            className="px-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded hover:bg-slate-300 dark:hover:bg-slate-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </form>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={() => !readOnly && setEditingCell({ day, timeSlotId: slot.id })}
                                                className={`w-full h-full rounded p-2 transition-colors group flex flex-col justify-center items-center text-center ${readOnly ? 'cursor-default' : 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                                    }`}
                                            >
                                                {entry ? (
                                                    <>
                                                        <div className="font-semibold text-indigo-600 dark:text-indigo-400 text-sm mb-1">
                                                            {entry.subject?.name}
                                                        </div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                                            {/* In teacher view, show Class instead of Teacher */}
                                                            {readOnly ? (
                                                                // @ts-ignore - class might be populated in teacher view
                                                                entry.class ? `${entry.class.name} - ${entry.class.section}` : (entry.teacher?.user.name || 'Unknown')
                                                            ) : (
                                                                entry.teacher?.user.name || 'Unknown'
                                                            )}
                                                        </div>
                                                    </>
                                                ) : (
                                                    !readOnly && (
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">
                                                            <Plus className="w-6 h-6 mx-auto" />
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
