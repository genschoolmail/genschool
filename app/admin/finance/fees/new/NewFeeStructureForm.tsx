'use client';

import { useFormStatus } from 'react-dom';
import { createFeeStructure } from '@/lib/actions';
import { Loader2, Save, DollarSign, Calendar } from 'lucide-react';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';

interface Class {
    id: string;
    name: string;
    section: string;
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
                    Create Fee Structure
                </>
            )}
        </button>
    );
}

export function NewFeeStructureForm({ classes }: { classes: Class[] }) {
    return (
        <div className="max-w-2xl mx-auto pb-24">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Create Fee Structure</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Define a new fee structure for classes</p>
            </div>

            <form action={createFeeStructure} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 space-y-6">
                    <FormInput
                        label="Fee Name *"
                        name="name"
                        placeholder="e.g. Annual Tuition Fee"
                        required
                        icon={<DollarSign className="w-4 h-4" />}
                    />

                    <FormInput
                        label="Amount *"
                        name="amount"
                        type="number"
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                        required
                        icon={<DollarSign className="w-4 h-4" />}
                        helperText="Enter the fee amount in rupees"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormSelect
                            label="Frequency *"
                            name="frequency"
                            required
                            icon={<Calendar className="w-4 h-4" />}
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                            <option value="ONE_TIME">One Time</option>
                        </FormSelect>

                        <FormSelect
                            label="Class (Optional)"
                            name="classId"
                        >
                            <option value="">All Classes</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    Class {cls.name} {cls.section}
                                </option>
                            ))}
                        </FormSelect>
                    </div>
                </div>

                {/* Sticky Submit Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-40 md:static md:bg-transparent md:border-0 md:p-6 md:pt-0 md:flex md:justify-end">
                    <div className="max-w-4xl mx-auto md:mx-0 w-full md:w-auto flex gap-4">
                        <SubmitButton />
                    </div>
                </div>
            </form>
        </div>
    );
}
