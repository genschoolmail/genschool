'use client';

import React, { useRef } from 'react';
import { UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { assignClassTeacher } from '@/lib/actions/academics';

interface AssignTeacherFormProps {
    classes: any[];
    teachers: any[];
}

export default function AssignTeacherForm({ classes, teachers }: AssignTeacherFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        const result = await assignClassTeacher(formData);
        if (result?.success) {
            toast.success(result.message);
            formRef.current?.reset();
        } else if (result?.error) {
            toast.error(result.error);
        }
    }

    return (
        <form ref={formRef} action={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Class</label>
                <select
                    name="classId"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teacher</label>
                <select
                    name="teacherId"
                    required
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="">Select Teacher</option>
                    {teachers.map((t) => (
                        <option key={t.id} value={t.id}>{t.user.name} ({t.designation || 'Teacher'})</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
                    <select
                        name="role"
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="PRIMARY">Primary</option>
                        <option value="ASSISTANT">Assistant</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Academic Year</label>
                    <input
                        name="academicYear"
                        defaultValue="2024-2025"
                        required
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                Assign Teacher
            </button>
        </form>
    );
}
