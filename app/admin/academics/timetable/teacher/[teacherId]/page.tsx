import React from 'react';
import { getTeacher } from '@/lib/actions';
import { getTimeSlots, getTeacherTimetable } from '@/lib/actions/academics';
import TimetableBuilder from '../../class/[classId]/TimetableBuilder';
import { notFound } from 'next/navigation';
import { Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function TeacherTimetablePage({ params }: { params: { teacherId: string } }) {
    const teacher = await getTeacher(params.teacherId);
    if (!teacher) notFound();

    const timeSlots = await getTimeSlots();
    const timetable = await getTeacherTimetable(params.teacherId);

    // Format timetable
    const formattedTimetable = timetable.map(entry => ({
        ...entry,
        teacher: {
            ...teacher,
            user: {
                ...teacher.user,
                name: teacher.user.name || 'Unknown'
            }
        }
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/academics/timetable/teacher"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Timetable: {teacher.user.name}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {teacher.designation || 'Teacher'} - Weekly Schedule
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <TimetableBuilder
                    classId=""
                    initialData={formattedTimetable}
                    timeSlots={timeSlots}
                    subjects={[] as any}
                    teachers={[] as any}
                    readOnly={true}
                />
            </div>
        </div>
    );
}
