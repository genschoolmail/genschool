'use client';

import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { deleteSubject } from '@/lib/actions/academics';
import Link from 'next/link';

export function SubjectActions({ subjectId, subjectName }: { subjectId: string; subjectName: string }) {
    const [isDeleting, setIsDeleting] = React.useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${subjectName}"?`)) return;

        setIsDeleting(true);
        try {
            await deleteSubject(subjectId);
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete subject. It might be assigned to a timetable or have associated records.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex gap-2 justify-end">
            <Link
                href={`/admin/academics/subjects/${subjectId}/edit`}
                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-200"
                title="Edit Subject"
            >
                <Edit className="w-4 h-4" />
            </Link>
            <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete Subject"
            >
                {isDeleting ? (
                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                    <Trash2 className="w-4 h-4" />
                )}
            </button>
        </div>
    );
}
