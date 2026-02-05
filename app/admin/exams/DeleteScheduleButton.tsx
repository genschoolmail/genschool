'use client';

import { Trash2 } from 'lucide-react';
import { deleteExamSchedule } from '@/lib/exam-schedule-actions';
import { toast } from 'sonner';
import { useTransition } from 'react';

export function DeleteScheduleButton({ scheduleId, subjectName }: { scheduleId: string; subjectName: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`Delete ${subjectName} exam? This will fail if results exist.`)) {
            return;
        }

        startTransition(async () => {
            try {
                const result = await deleteExamSchedule(scheduleId);
                if (result.success) {
                    toast.success(result.message);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete schedule');
            }
        });
    };

    return (
        <form action={handleDelete}>
            <button
                type="submit"
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Schedule"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </form>
    );
}
