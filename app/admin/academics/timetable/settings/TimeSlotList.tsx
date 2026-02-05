'use client';

import { useState } from 'react';
import { deleteTimeSlot, updateTimeSlot } from '@/lib/actions/academics';
import { Trash2, Edit2, Save, X, Loader2, Clock } from 'lucide-react';
import { TimePicker } from '@/components/ui/TimePicker';

export function TimeSlotList({ timeSlots }: { timeSlots: any[] }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this time slot?')) return;
        setIsDeleting(id);
        await deleteTimeSlot(id);
        setIsDeleting(null);
    }

    if (timeSlots.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Time Slots</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Add your first period to get started</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/80 dark:bg-slate-700/50">
                        <tr>
                            <th className="p-5 font-semibold text-slate-700 dark:text-slate-300 w-24">Order</th>
                            <th className="p-5 font-semibold text-slate-700 dark:text-slate-300">Label</th>
                            <th className="p-5 font-semibold text-slate-700 dark:text-slate-300">Duration</th>
                            <th className="p-5 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {timeSlots.map((slot) => (
                            <EditableRow
                                key={slot.id}
                                slot={slot}
                                isEditing={editingId === slot.id}
                                onEdit={() => setEditingId(slot.id)}
                                onCancel={() => setEditingId(null)}
                                onDelete={() => handleDelete(slot.id)}
                                isDeleting={isDeleting === slot.id}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
                {timeSlots.map((slot) => (
                    <div key={slot.id} className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                        {editingId === slot.id ? (
                            <EditForm
                                slot={slot}
                                onCancel={() => setEditingId(null)}
                            />
                        ) : (
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800">
                                            #{slot.order}
                                        </span>
                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">{slot.label}</h4>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                                        <Clock className="w-4 h-4" />
                                        {slot.displayTime}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setEditingId(slot.id)}
                                        className="p-2.5 bg-slate-50 dark:bg-slate-700 text-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slot.id)}
                                        disabled={isDeleting === slot.id}
                                        className="p-2.5 bg-slate-50 dark:bg-slate-700 text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                                    >
                                        {isDeleting === slot.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Sub-component for editing (Used in both Desktop and Mobile views)
function EditForm({ slot, onCancel }: { slot: any, onCancel: () => void }) {
    return (
        <form action={async (formData) => {
            await updateTimeSlot(formData);
            onCancel();
        }} className="flex flex-col gap-4">
            <input type="hidden" name="id" value={slot.id} />

            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Order</label>
                    <input
                        name="order"
                        type="number"
                        defaultValue={slot.order}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
                <div className="col-span-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Label</label>
                    <input
                        name="label"
                        defaultValue={slot.label}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Time Range</label>
                <div className="flex flex-wrap items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                    <TimePicker name="startTime" defaultValue={slot.startTime} />
                    <span className="text-slate-400 font-bold">-</span>
                    <TimePicker name="endTime" defaultValue={slot.endTime} />
                </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                    <Save className="w-4 h-4" /> Save Changes
                </button>
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
                    Cancel
                </button>
            </div>
        </form>
    );
}

function EditableRow({ slot, isEditing, onEdit, onCancel, onDelete, isDeleting }: any) {
    if (isEditing) {
        return (
            <tr className="bg-indigo-50/30 dark:bg-indigo-900/10">
                <td colSpan={4} className="p-5">
                    <EditForm slot={slot} onCancel={onCancel} />
                </td>
            </tr>
        );
    }

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
            <td className="p-5">
                <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold border border-indigo-100 dark:border-indigo-800">
                    {slot.order}
                </span>
            </td>
            <td className="p-5 font-bold text-slate-800 dark:text-white">{slot.label}</td>
            <td className="p-5 text-slate-600 dark:text-slate-400 font-medium">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {slot.displayTime}
                </div>
            </td>
            <td className="p-5 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onEdit}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        disabled={isDeleting}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Delete"
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                </div>
            </td>
        </tr>
    );
}
