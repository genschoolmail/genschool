import React from 'react';
import { createTimeSlot, getTimeSlots, deleteTimeSlot, updateTimeSlot } from '@/lib/actions/academics';
import { Clock, Plus, Trash2, ArrowLeft, Edit2, Loader2, Save, X } from 'lucide-react';
import Link from 'next/link';
import { TimeSlotList } from './TimeSlotList';
import { AddTimeSlotForm } from './AddTimeSlotForm';

export default async function TimeSlotsPage() {
    const timeSlots = await getTimeSlots();

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/academics/timetable"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Clock className="w-8 h-8 text-indigo-600" />
                    Time Slots Configuration
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Time Slot Form */}
                <AddTimeSlotForm nextOrder={timeSlots.length + 1} />

                {/* Time Slots List */}
                <div className="lg:col-span-2">
                    <TimeSlotList timeSlots={timeSlots} />
                </div>
            </div>
        </div>
    );
}
