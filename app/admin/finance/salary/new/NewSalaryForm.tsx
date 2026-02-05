'use client';

import React from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Save, DollarSign, Calendar, User, AlertCircle } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';
import Link from 'next/link';
import { toast } from 'sonner';

interface Teacher {
    id: string;
    designation: string | null;
    user: {
        name: string | null;
    };
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                </>
            ) : (
                <>
                    <Save className="w-5 h-5" />
                    Create Salary Record
                </>
            )}
        </button>
    );
}

export function NewSalaryForm({
    teachers,
    drivers,
    createSalaryAction
}: {
    teachers: Teacher[];
    drivers: any[];
    createSalaryAction: (formData: FormData) => Promise<void>;
}) {
    const [staffType, setStaffType] = React.useState<'TEACHER' | 'DRIVER'>('TEACHER');

    // We use a wrapper to intercept the action
    // But since createSalaryAction is a Server Action that redirects, 
    // we can't easily intercept the success case (it unmounts).
    // We can only intercept errors that DONT throw redirect.
    // If it crashes, we want to know.

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-24">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Add Salary Record</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create a new salary record for a staff member</p>
            </div>

            <form
                action={async (formData) => {
                    try {
                        const loadingToast = toast.loading("Creating Record...");
                        // Call the server action
                        await createSalaryAction(formData);
                        // If we reach here, it implies it didn't redirect (maybe success without redirect? or just finished)
                        // But in our case it redirects.
                        toast.dismiss(loadingToast);
                    } catch (error: any) {
                        toast.dismiss();
                        // Next.js Redirect throws an error "NEXT_REDIRECT". We must rethrow it.
                        if (error.message === 'NEXT_REDIRECT') {
                            toast.success("Salary Created Successfully");
                            throw error;
                        }
                        console.error("Action Failed:", error);
                        toast.error("Failed to create salary. Please check all fields.");
                    }
                }}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
                <div className="p-6 space-y-6">
                    {/* Staff Type Toggle */}
                    <div className="flex p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setStaffType('TEACHER')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${staffType === 'TEACHER'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            Teacher
                        </button>
                        <button
                            type="button"
                            onClick={() => setStaffType('DRIVER')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${staffType === 'DRIVER'
                                ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                                }`}
                        >
                            Driver
                        </button>
                    </div>

                    {staffType === 'TEACHER' ? (
                        <FormSelect
                            label="Teacher *"
                            name="teacherId"
                            required
                            icon={<User className="w-4 h-4" />}
                        >
                            <option value="">Select Teacher</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.user.name} - {teacher.designation}
                                </option>
                            ))}
                        </FormSelect>
                    ) : (
                        <FormSelect
                            label="Driver *"
                            name="driverId"
                            required
                            icon={<User className="w-4 h-4" />}
                        >
                            <option value="">Select Driver</option>
                            {drivers.map(driver => (
                                <option key={driver.id} value={driver.id}>
                                    {driver.user.name} - {driver.licenseNo}
                                </option>
                            ))}
                        </FormSelect>
                    )}

                    <FormInput
                        label="Month *"
                        name="month"
                        type="month"
                        required
                        icon={<Calendar className="w-4 h-4" />}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormInput
                            label="Basic Salary * (₹)"
                            name="basicSalary"
                            type="number"
                            required
                            min={0}
                            step={0.01}
                            placeholder="0.00"
                            icon={<DollarSign className="w-4 h-4" />}
                        />

                        <FormInput
                            label="Allowances (₹)"
                            name="allowances"
                            type="number"
                            min={0}
                            step={0.01}
                            defaultValue={0}
                            placeholder="0.00"
                            icon={<DollarSign className="w-4 h-4" />}
                        />

                        <FormInput
                            label="Deductions (₹)"
                            name="deductions"
                            type="number"
                            min={0}
                            step={0.01}
                            defaultValue={0}
                            placeholder="0.00"
                            icon={<DollarSign className="w-4 h-4" />}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Remarks
                        </label>
                        <textarea
                            name="remarks"
                            rows={3}
                            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-base"
                            placeholder="Any additional notes..."
                        />
                    </div>

                    <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex items-start gap-3 text-sm">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">Note on Deductions</p>
                            <p>Use the "Deductions" field to account for absences or other penalties. Check attendance records if needed before generating salary.</p>
                        </div>
                    </div>
                </div>

                {/* Sticky Submit Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-40 md:static md:bg-transparent md:border-0 md:p-6 md:pt-0 md:flex md:justify-end">
                    <div className="max-w-4xl mx-auto md:mx-0 w-full md:w-auto flex gap-4">
                        <SubmitButton />
                        <Link
                            href="/admin/finance/salary"
                            className="hidden md:flex items-center justify-center px-6 py-3.5 border border-slate-300 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </form>
        </div>
    );
}
