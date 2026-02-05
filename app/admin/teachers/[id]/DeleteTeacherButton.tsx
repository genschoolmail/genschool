'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteTeacher } from '@/lib/teacher-actions';
import { Modal } from '@/components/ui/Modal';

interface DeleteTeacherButtonProps {
    id: string;
    teacherName?: string;
}

export default function DeleteTeacherButton({ id, teacherName }: DeleteTeacherButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        console.log('Proceeding with deletion...');

        try {
            const formData = new FormData();
            formData.append('id', id);

            const result = await deleteTeacher(formData);
            console.log('Delete result:', result);

            if (result?.error) {
                alert(`Error: ${result.error}`);
                setIsDeleting(false);
                setShowModal(false);
            } else {
                // Success!
                console.log('Deletion successful, redirecting...');
                window.location.href = '/admin/teachers';
            }
        } catch (error) {
            console.error('Delete error in component:', error);
            alert('An error occurred while deleting the teacher.');
            setIsDeleting(false);
            setShowModal(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                aria-label="Delete teacher"
            >
                <Trash2 className="w-4 h-4" />
                Delete Teacher
            </button>

            <Modal
                isOpen={showModal}
                onClose={() => !isDeleting && setShowModal(false)}
                title="Delete Teacher"
                type="danger"
            >
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-red-600 bg-red-50 p-3 rounded-lg">
                        <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                        <p className="text-sm font-medium">
                            Warning: This action is permanent and cannot be undone.
                        </p>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300">
                        Are you sure you want to delete <strong>{teacherName || 'this teacher'}</strong>?
                    </p>

                    <ul className="list-disc list-inside text-sm text-slate-500 space-y-1 ml-2">
                        <li>Teacher profile will be removed</li>
                        <li>All uploaded documents will be deleted</li>
                        <li>Classes/Subjects will be unassigned</li>
                    </ul>

                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                        <button
                            onClick={() => setShowModal(false)}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isDeleting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete Forever'
                            )}
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
