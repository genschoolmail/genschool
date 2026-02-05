'use client';

import { useState, useTransition } from 'react';
import { publishExamResults, unpublishExamResults } from '@/lib/actions/exams';
import { toast } from 'sonner';
import { Globe, Lock } from 'lucide-react';

export default function PublishResultsButton({
    examGroupId,
    isPublished
}: {
    examGroupId: string;
    isPublished: boolean;
}) {
    const [isPending, startTransition] = useTransition();

    const handleToggle = () => {
        startTransition(async () => {
            try {
                if (isPublished) {
                    const result = await unpublishExamResults(examGroupId);
                    if (result.success) {
                        toast.success(result.message);
                    } else {
                        toast.error(result.message);
                    }
                } else {
                    const result = await publishExamResults(examGroupId);
                    if (result.success) {
                        toast.success(result.message);
                    } else {
                        toast.error(result.message);
                    }
                }
            } catch (error: any) {
                toast.error(error.message || 'Failed to update publication status');
                console.error(error);
            }
        });
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isPending}
            className={`px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors ${isPublished
                ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
        >
            {isPublished ? (
                <>
                    <Lock className="w-4 h-4" />
                    {isPending ? 'Unpublishing...' : 'Unpublish Results'}
                </>
            ) : (
                <>
                    <Globe className="w-4 h-4" />
                    {isPending ? 'Publishing...' : 'Publish Results'}
                </>
            )}
        </button>
    );
}
