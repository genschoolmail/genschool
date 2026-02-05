'use client';

import React from 'react';
import { Trash2, Edit, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { deleteGrade } from '@/lib/actions/exams';
import { toast } from 'sonner';

export function GradeActions({ gradeId, gradeName }: { gradeId: string; gradeName: string }) {
    const [isPending, startTransition] = React.useTransition();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete grade "${gradeName}"?`)) return;

        startTransition(async () => {
            try {
                const result = await deleteGrade(gradeId);
                if (result.success) {
                    toast.success(result.message);
                } else {
                    toast.error(result.message);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to delete grade');
            }
        });
    };

    return (
        <div className="flex gap-2 justify-end">
            <Link
                href={`/admin/exams/grading/${gradeId}/edit`}
                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
            >
                <Edit className="w-4 h-4" />
            </Link>
            <button
                onClick={handleDelete}
                disabled={isPending}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
        </div>
    );
}
