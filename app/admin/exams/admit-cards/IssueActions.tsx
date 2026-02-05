'use client';

import React, { useTransition } from 'react';
import { issueAdmitCard, issueAllAdmitCards } from '@/lib/actions/exams';
import { toast } from 'sonner';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function IssueButton({ id, status }: { id: string, status: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    if (status === 'ISSUED') return null;

    const handleIssue = () => {
        startTransition(async () => {
            try {
                const result = await issueAdmitCard(id);
                if (result.success) {
                    toast.success(result.message);
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to issue admit card');
            }
        });
    };

    return (
        <button
            onClick={handleIssue}
            disabled={isPending}
            className="text-green-600 hover:text-green-800 text-sm font-medium inline-flex items-center gap-1 disabled:opacity-50"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Issue
        </button>
    );
}

export function BulkIssueButton({ groupId, classId, totalToIssue }: { groupId: string, classId?: string, totalToIssue: number }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    if (totalToIssue === 0) return null;

    const handleBulkIssue = () => {
        if (!confirm(`Are you sure you want to issue all ${totalToIssue} generated admit cards?`)) return;

        startTransition(async () => {
            try {
                const result = await issueAllAdmitCards(groupId, classId);
                if (result.success) {
                    toast.success(result.message);
                    router.refresh();
                } else {
                    toast.error(result.message);
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to issue admit cards');
            }
        });
    };

    return (
        <button
            onClick={handleBulkIssue}
            disabled={isPending}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Issue All Generated ({totalToIssue})
        </button>
    );
}
