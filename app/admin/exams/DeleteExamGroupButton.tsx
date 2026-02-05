'use client';

import { Trash2 } from 'lucide-react';
import { deleteExamGroup } from '@/lib/exam-actions';
import { toast } from 'sonner';
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteExamGroupButton({ groupId, groupName }: { groupId: string; groupName: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm(`Are you sure you want to delete "${groupName}"?\n\nThis will also delete:\n- All exam schedules\n- All admit cards\n- All exam results\n\nThis action cannot be undone.`)) {
            return;
        }

        startTransition(async () => {
            try {
                const result = await deleteExamGroup(groupId);
                if (result.success) {
                    toast.success(result.message);
                    router.push('/admin/exams');
                    router.refresh();
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete exam group');
                console.error(error);
            }
        });
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete Exam Group"
        >
            <Trash2 className="w-5 h-5" />
        </button>
    );
}
