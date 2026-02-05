'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Key, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function ResetAdminPage() {
    const router = useRouter();
    const [masterKey, setMasterKey] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/auth/reset-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masterKey })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Admin account reset successfully!');
                toast.info('Redirecting to login with default credentials...');
                setTimeout(() => router.push('/login'), 2000);
            } else {
                toast.error(data.message || 'Invalid Master Key or reset failed');
            }
        } catch (error) {
            toast.error('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Admin Account Recovery</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Use your institution's Master Key to reset the Admin account to default settings.
                        </p>
                    </div>

                    <form onSubmit={handleReset} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                <Key className="w-4 h-4 inline mr-1" />
                                Master Key
                            </label>
                            <input
                                type="password"
                                value={masterKey}
                                onChange={(e) => setMasterKey(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                                placeholder="Enter secure master key"
                                required
                            />
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                            <h4 className="text-xs font-bold text-amber-800 dark:text-amber-200 uppercase mb-2">Warning</h4>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                                This will reset the admin password to <strong>password123</strong> and phone to <strong>9999999999</strong>. Use only in emergencies.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !masterKey}
                            className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Reseting...' : 'Reset Admin Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link
                            href="/login"
                            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center gap-1"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
