'use client';

import { createTimeSlot } from '@/lib/actions/academics';
import { Plus, Clock } from 'lucide-react';
import { TimePicker } from '@/components/ui/TimePicker';

export function AddTimeSlotForm({ nextOrder }: { nextOrder: number }) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                        <Clock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Add Time Slot</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Configure new lecture period</p>
                    </div>
                </div>
            </div>

            <form action={createTimeSlot} className="p-6 space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Slot Label</label>
                    <input
                        name="label"
                        placeholder="e.g. Period 1"
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Start Time</label>
                        <TimePicker name="startTime" className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">End Time</label>
                        <TimePicker name="endTime" className="w-full" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Display Order</label>
                    <input
                        name="order"
                        type="number"
                        defaultValue={1}
                        required
                        className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    />
                </div>

                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-600/20 font-bold text-md flex items-center justify-center gap-2 active:scale-95">
                    <Plus className="w-5 h-5" />
                    Create Time Slot
                </button>
            </form>
        </div>
    );
}
