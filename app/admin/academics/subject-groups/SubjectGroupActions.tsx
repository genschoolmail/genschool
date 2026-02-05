'use client';

import React from 'react';
import { Trash2, Edit } from 'lucide-react';
import { deleteSubjectGroup } from '@/lib/actions/academics';
import Link from 'next/link';

export function SubjectGroupActions({ groupId, groupName }: { groupId: string; groupName: string }) {
    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete "${groupName}"?`)) {
            await deleteSubjectGroup(groupId);
        }
    };

    return (
        <div className="flex gap-2 justify-end">
            <Link
                href={`/admin/academics/subject-groups/${groupId}/edit`}
                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
            >
                <Edit className="w-4 h-4" />
            </Link>
            <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
            >
                <Trash2 className="w-4 h-4" />
            </button>
        </div>
    );
}
