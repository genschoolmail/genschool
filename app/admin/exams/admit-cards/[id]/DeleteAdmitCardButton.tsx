'use client';

import { Trash2 } from 'lucide-react';
import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import { deleteAdmitCard } from '@/lib/admit-card-actions';
import { useRouter } from 'next/navigation';

export default function DeleteAdmitCardButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }

        startTransition(async () => {
            try {
                await deleteAdmitCard(id);
                toast.success('Admit card deleted successfully');
                router.push('/admin/exams/admit-cards');
            } catch (error) {
                toast.error('Failed to delete admit card');
                console.error(error);
            }
        });
    };

    return (
        <div className="flex items-center gap-2">
            {showConfirm && (
                <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm"
                >
                    Cancel
                </button>
            )}
            <button
                onClick={handleDelete}
                disabled={isPending}
                className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 ${showConfirm
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-red-100 hover:bg-red-200 text-red-700'
                    }`}
            >
                <Trash2 className="w-4 h-4" />
                {isPending ? 'Deleting...' : showConfirm ? 'Confirm Delete' : 'Delete'}
            </button>
        </div>
    );
}
