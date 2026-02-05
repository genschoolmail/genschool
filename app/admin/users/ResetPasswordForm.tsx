'use client';

import { useFormStatus } from 'react-dom';
import { resetUserPassword } from '@/lib/actions';
import { Key, Loader2 } from 'lucide-react';

function ResetPasswordButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target"
            title="Reset Password"
        >
            {pending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Key className="w-4 h-4" />
            )}
        </button>
    );
}

export function ResetPasswordForm({ userId }: { userId: string }) {
    return (
        <form action={resetUserPassword as any} className="flex items-center gap-2">
            <input type="hidden" name="userId" value={userId} />
            <input
                type="text"
                name="newPassword"
                placeholder="New Password"
                required
                minLength={6}
                className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-32 md:w-40"
            />
            <ResetPasswordButton />
        </form>
    );
}
