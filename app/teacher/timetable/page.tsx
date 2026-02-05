import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Clock, BookOpen, MapPin, Calendar } from 'lucide-react';
import { PrintButton } from './PrintButton';

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default async function TimetablePage() {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
            timetableEntries: {
                include: {
                    class: true,
                    subject: true,
                    timeSlot: true
                }
            }
        }
    });

    if (!teacher) {
        return <div>Teacher profile not found.</div>;
    }

    // Get all time slots
    const timeSlots = await prisma.timeSlot.findMany({
        orderBy: { order: 'asc' }
    });

    // Serialize timetable entries to plain objects
    const serializedEntries = teacher.timetableEntries.map(entry => ({
        id: entry.id,
        day: entry.day,
        timeSlotId: entry.timeSlotId,
        room: entry.room,
        class: {
            name: entry.class.name,
            section: entry.class.section
        },
        subject: entry.subject ? {
            name: entry.subject.name
        } : null
    }));

    // Organize timetable by day and time slot
    const timetableByDay = DAYS.reduce((acc, day) => {
        acc[day] = timeSlots.map(slot => {
            const entry = serializedEntries.find(
                e => e.day === day && e.timeSlotId === slot.id
            );
            return {
                timeSlot: slot,
                entry: entry || null
            };
        });
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1 md:mb-2">
                                My Timetable
                            </h1>
                            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                                Your weekly teaching schedule
                            </p>
                        </div>
                        <PrintButton />
                    </div>
                </div>

                {serializedEntries.length > 0 ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border-b-2 border-indigo-200 dark:border-indigo-800">
                                        <th className="p-3 md:p-4 text-left font-bold text-slate-700 dark:text-slate-300 min-w-[100px] md:min-w-[120px] text-xs md:text-sm">
                                            Time Slot
                                        </th>
                                        {DAYS.map(day => (
                                            <th key={day} className="p-3 md:p-4 text-center font-bold text-slate-700 dark:text-slate-300 min-w-[120px] md:min-w-[140px] text-xs md:text-sm">
                                                <span className="hidden sm:inline">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                                                <span className="sm:hidden">{day.slice(0, 3)}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {timeSlots.map((slot, idx) => (
                                        <tr key={slot.id} className={`border-b border-slate-100 dark:border-slate-700 ${idx % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-700/20' : ''}`}>
                                            <td className="p-2 md:p-3 border-r border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-1.5 md:gap-2 text-slate-600 dark:text-slate-400">
                                                    <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                                    <div>
                                                        <div className="font-semibold text-slate-900 dark:text-white text-xs md:text-sm">
                                                            {slot.label}
                                                        </div>
                                                        <div className="text-xs hidden md:block">
                                                            {slot.startTime} - {slot.endTime}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            {DAYS.map(day => {
                                                const dayEntry = timetableByDay[day].find(e => e.timeSlot.id === slot.id);
                                                const entry = dayEntry?.entry;

                                                return (
                                                    <td key={day} className="p-2 md:p-3 border-r border-slate-100 dark:border-slate-700 last:border-r-0">
                                                        {entry ? (
                                                            <div className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/40 dark:to-purple-900/40 p-2 md:p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                                                                <div className="flex items-start gap-1.5 md:gap-2 mb-1 md:mb-2">
                                                                    <BookOpen className="w-3 h-3 md:w-4 md:h-4 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-bold text-slate-900 dark:text-white text-xs md:text-sm truncate">
                                                                            {entry.subject?.name || 'N/A'}
                                                                        </div>
                                                                        <div className="text-xs text-slate-600 dark:text-slate-300">
                                                                            {entry.class.name}-{entry.class.section}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {entry.room && (
                                                                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                                                        <MapPin className="w-3 h-3" />
                                                                        {entry.room}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center text-slate-300 dark:text-slate-600 text-xs">
                                                                -
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
                    </div>
                ) : (
                    <div className="text-center py-16 md:py-20 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full mb-4 md:mb-6">
                            <Calendar className="w-8 h-8 md:w-10 md:h-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">No Timetable Assigned</h3>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto px-4">
                            Your teaching schedule hasn't been created yet.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
