'use client';

import React, { useTransition } from 'react';
import { generateAdmitCardsForClass } from '@/lib/actions/exams';
import { Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface BulkGenerateAdmitCardsFormProps {
    groupId: string;
    classes: any[];
}

export default function BulkGenerateAdmitCardsForm({ groupId, classes }: BulkGenerateAdmitCardsFormProps) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const classId = formData.get('classId') as string;

        if (!groupId || !classId) {
            toast.error('Please select both exam term and class');
            return;
        }

        startTransition(async () => {
            try {
                const result = await generateAdmitCardsForClass(groupId, classId);
                if (result.success) {
                    toast.success(`Successfully generated ${result.count} admit cards`);
                    router.refresh();
                } else if (result.error) {
                    toast.error(result.error);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to generate admit cards');
            }
        });
    };

    return (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Bulk Generation</h3>
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Select Class
                    </label>
                    <select
                        name="classId"
                        required
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>
                                {c.name} - {c.section}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Users className="w-4 h-4" />
                            Generate Admit Cards
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}
