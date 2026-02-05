'use client';

import { toast } from 'sonner';
import { triggerManualBackup, fetchBackups } from '@/lib/actions/backup-actions';
import { useEffect, useState } from 'react';
import { Cloud, Download, Clock, Shield } from 'lucide-react';

export default function BackupPage() {
    const [backups, setBackups] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBackups();
    }, []);

    const loadBackups = async () => {
        const data = await fetchBackups();
        setBackups(data);
    };

    const handleBackup = async () => {
        setLoading(true);
        try {
            await triggerManualBackup();
            toast.success('Backup started successfully');
            await loadBackups();
        } catch (e) {
            toast.error('Backup failed: ' + (e as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Backup & Restore</h1>
                    <p className="text-slate-500">Manage database backups and disaster recovery.</p>
                </div>
                <button
                    onClick={handleBackup}
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                    <Cloud className={`w-5 h-5 mr-2 ${loading ? 'animate-bounce' : ''}`} />
                    {loading ? 'Backing up...' : 'Trigger Backup'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Status Card */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Security Status</h3>
                            <p className="text-sm text-green-600 font-medium">Encrypted & Secure</p>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Provider</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">AWS S3</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Retained</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{backups.length} Backups</span>
                        </div>
                    </div>
                </div>

                {/* Recent Backups List */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white">Recent Backups</h3>
                    </div>
                    <div className="divide-y divide-slate-100 dark:divide-slate-700">
                        {backups.length === 0 ? (
                            <div className="p-8 text-center text-slate-400">No backups found. Trigger one now.</div>
                        ) : (
                            backups.map((bk) => (
                                <div key={bk.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800 dark:text-white">{bk.filename}</p>
                                            <p className="text-xs text-slate-500">
                                                {new Date(bk.createdAt || new Date()).toLocaleString()} • {(bk.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={bk.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        <Download className="w-5 h-5" />
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
