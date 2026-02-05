'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteTeacherDocument } from '@/lib/teacher-actions';
import { useRouter } from 'next/navigation';

interface DeleteDocumentButtonProps {
    docId: string;
    teacherId: string;
}

export function DeleteDocumentButton({ docId, teacherId }: DeleteDocumentButtonProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        console.log('Delete document clicked:', docId);

        if (isDeleting) return;

        const confirmed = window.confirm(
            'Are you sure you want to delete this document? This action cannot be undone.'
        );

        if (!confirmed) return;

        setIsDeleting(true);

        try {
            const formData = new FormData();
            formData.append('docId', docId);
            formData.append('teacherId', teacherId);

            const result = await deleteTeacherDocument(formData);
            console.log('Delete document result:', result);

            if (result?.success) {
                console.log('Document deleted, reloading...');
                // Force a hard reload to ensure UI updates
                window.location.reload();
            } else {
                alert(result?.error || 'Failed to delete document. Please try again.');
                setIsDeleting(false);
            }
        } catch (error) {
            console.error('Delete document error:', error);
            alert('An error occurred while deleting the document.');
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isDeleting ? 'Deleting...' : 'Delete document'}
            aria-label="Delete document"
        >
            <Trash2 className={`w-5 h-5 ${isDeleting ? 'animate-pulse' : ''}`} />
        </button>
    );
}
