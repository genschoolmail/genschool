'use client';

import React, { useTransition } from 'react';
import { createExamSchedule } from '@/lib/exam-schedule-actions';
import Link from 'next/link';
import { Calendar, Clock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface NewExamScheduleFormProps {
    examGroups: any[];
    classes: any[];
    subjects: any[];
    teachers: any[];
    selectedGroupId: string;
}

export default function NewExamScheduleForm({
    examGroups,
    classes,
    subjects,
    teachers,
    selectedGroupId
}: NewExamScheduleFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            try {
                const result = await createExamSchedule(formData);
                if (result.success) {
                    toast.success(result.message);
                    router.push('/admin/exams');
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to create schedule');
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Exam Group Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Exam Term <span className="text-red-500">*</span>
                </label>
                <select
                    name="examGroupId"
                    required
                    defaultValue={selectedGroupId}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                    {examGroups.map(group => (
                        <option key={group.id} value={group.id}>
                            {group.name} ({group.academicYear})
                        </option>
                    ))}
                </select>
            </div>

            {/* Class and Subject */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Class <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="classId"
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                        <option value="">Select Class</option>
                        {classes.map(cls => (
                            <option key={cls.id} value={cls.id}>
                                Class {cls.name}-{cls.section}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="subjectId"
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.id}>
                                {subject.name} (Class {subject.class.name}-{subject.class.section})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Teacher Assignment */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Assign Teacher <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                    name="teacherId"
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                >
                    <option value="">Select Teacher (Unassigned)</option>
                    {teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                            {teacher.user.name}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">If unassigned, all markers can view this exam.</p>
            </div>

            {/* Date, Time and Shift */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Exam Date <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="date"
                        name="examDate"
                        required
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Start Time <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="time"
                        name="startTime"
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Shift <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="shift"
                        required
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    >
                        <option value="1st Shift">1st Shift (Morning)</option>
                        <option value="2nd Shift">2nd Shift (Afternoon)</option>
                        <option value="3rd Shift">3rd Shift (Evening)</option>
                    </select>
                </div>
            </div>

            {/* Duration */}
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <input
                    type="number"
                    name="duration"
                    required
                    defaultValue={180}
                    min={30}
                    max={480}
                    step={15}
                    className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <p className="text-xs text-slate-500 mt-1">Maximum 480 minutes (8 hours)</p>
            </div>

            {/* Marks */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Maximum Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="maxMarks"
                        required
                        defaultValue={100}
                        min={1}
                        step="0.5"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Passing Marks <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="number"
                        name="passingMarks"
                        required
                        defaultValue={33}
                        min={1}
                        step="0.5"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                    />
                </div>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <div className="flex gap-3">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-medium mb-1">Conflict Detection</p>
                        <p className="text-amber-700 dark:text-amber-300">
                            System will check for scheduling conflicts:
                        </p>
                        <ul className="list-disc list-inside mt-1 text-amber-700 dark:text-amber-300">
                            <li>Duplicate subject for same class and exam term</li>
                            <li>Same class scheduled at overlapping times</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Link
                    href="/admin/exams"
                    className="flex-1 px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-center font-medium"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Scheduling...
                        </>
                    ) : (
                        <>
                            <Calendar className="w-5 h-5" />
                            Create Schedule
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
