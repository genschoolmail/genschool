import { getClass, getTimeSlots, getSubjectsByClass, getClassTimetable } from '@/lib/actions/academics';
import { getTeachers } from '@/lib/actions';
import TimetableBuilder from './TimetableBuilder';
import { notFound } from 'next/navigation';
import { Layers, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function ClassTimetablePage({ params }: { params: { classId: string } }) {
    const classData = await getClass(params.classId);
    if (!classData) notFound();

    const timeSlots = await getTimeSlots();
    const classSubjects = await getSubjectsByClass(params.classId);
    const teachers = await getTeachers();
    const timetable = await getClassTimetable(params.classId);

    // Format teachers to ensure non-null name

    // Format teachers to ensure non-null name
    const formattedTeachers = teachers.map(t => ({
        ...t,
        user: {
            ...t.user,
            name: t.user.name || 'Unknown'
        }
    }));

    // Format timetable to ensure non-null teacher name
    const formattedTimetable = timetable.map(entry => ({
        ...entry,
        teacher: entry.teacher ? {
            ...entry.teacher,
            user: {
                ...entry.teacher.user,
                name: entry.teacher.user.name || 'Unknown'
            }
        } : null
    }));

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/academics/timetable/class"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Layers className="w-8 h-8 text-indigo-600" />
                        Timetable: {classData.name} - {classData.section}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Manage weekly schedule for this class
                    </p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <TimetableBuilder
                    classId={params.classId}
                    initialData={formattedTimetable}
                    timeSlots={timeSlots}
                    subjects={classSubjects}
                    teachers={formattedTeachers}
                />
            </div>
        </div>
    );
}
