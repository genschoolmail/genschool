import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Calendar, Clock, BookOpen, Users } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default async function StudentTimetablePage() {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            class: {
                include: {
                    timetableEntries: {
                        include: {
                            subject: true,
                            teacher: {
                                include: { user: true }
                            }
                        },
                        orderBy: { day: 'asc' }
                    }
                }
            }
        }
    });

    if (!student) {
        return <div className="p-8 text-center">Student profile not found</div>;
    }

    if (!student.class) {
        return (
            <div className="p-8 text-center">
                <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Class Assigned</h2>
                <p className="text-sm text-slate-500">Please contact administration to assign you to a class.</p>
            </div>
        );
    }

    // Get time slots
    const timeSlots = await prisma.timeSlot.findMany({
        orderBy: { startTime: 'asc' }
    });

    // Organize timetable by day
    const timetableByDay = DAYS.reduce((acc, day) => {
        acc[day] = timeSlots.map(slot => {
            const entry = student.class!.timetableEntries.find(
                e => e.day === day && e.timeSlotId === slot.id
            );
            return {
                timeSlot: slot,
                entry: entry || null
            };
        });
        return acc;
    }, {} as Record<string, any[]>);

    const hasAnyClasses = student.class.timetableEntries.length > 0;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Timetable</h1>
                <p className="text-slate-500">
                    Class {student.class.name}-{student.class.section} • Weekly Schedule
                </p>
            </div>

            {!hasAnyClasses ? (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Timetable Yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Timetable will be available once created by the administration
                    </p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-4 text-left text-sm font-semibold text-slate-600 dark:text-slate-300 sticky left-0 bg-slate-50 dark:bg-slate-700/50">
                                        Time
                                    </th>
                                    {DAYS.map(day => (
                                        <th key={day} className="p-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                                            {day}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {timeSlots.map((slot) => (
                                    <tr key={slot.id} className="border-t border-slate-200 dark:border-slate-700">
                                        <td className="p-4 bg-slate-50 dark:bg-slate-700/50 sticky left-0">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <div className="text-sm">
                                                    <div className="font-medium text-slate-900 dark:text-white">{slot.label}</div>
                                                    <div className="text-xs text-slate-500">
                                                        {slot.startTime} - {slot.endTime}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {DAYS.map(day => {
                                            const daySlot = timetableByDay[day]?.find(s => s.timeSlot.id === slot.id);
                                            const entry = daySlot?.entry;

                                            return (
                                                <td key={day} className="p-4 text-center">
                                                    {entry ? (
                                                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-700 rounded-lg p-3">
                                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                                                                    {entry.subject?.name || 'Subject'}
                                                                </span>
                                                            </div>
                                                            {entry.teacher && (
                                                                <div className="flex items-center justify-center gap-1 text-xs text-slate-600 dark:text-slate-400 mb-1">
                                                                    <Users className="w-3 h-3" />
                                                                    <span>{entry.teacher.user.name}</span>
                                                                </div>
                                                            )}
                                                            {entry.room && (
                                                                <div className="text-xs text-slate-500 dark:text-slate-500">
                                                                    Room: {entry.room}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-slate-400 dark:text-slate-600">-</div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Note</h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Your class timetable is shared with all students in Class {student.class.name}-{student.class.section}.
                            For any changes or queries, please contact your class teacher.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
