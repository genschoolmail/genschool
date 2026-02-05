'use client';

import { useState } from 'react';
import { createBackup, exportAsJSON, exportAsCSV } from '@/lib/actions/backup-export';
import { Database, Download, FileJson, FileSpreadsheet, Save, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Backup = {
    id: string;
    createdAt: Date;
    fileSize: number;
    description?: string | null;
};

type Props = {
    academicYearId: string;
    academicYearName: string;
    existingBackups: Backup[];
};

export default function BackupExportUI({ academicYearId, academicYearName, existingBackups }: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [backupDescription, setBackupDescription] = useState('');

    const handleCreateBackup = async () => {
        setLoading(true);
        const result = await createBackup(academicYearId, backupDescription);

        if (result.success) {
            alert(result.message);
            setBackupDescription('');
            router.refresh();
        } else {
            alert(result.error);
        }
        setLoading(false);
    };

    const handleExportJSON = async () => {
        setLoading(true);
        const result = await exportAsJSON(academicYearId);

        if (result.success && result.data && result.filename) {
            // Download JSON file
            const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert('JSON export downloaded successfully!');
        } else {
            alert(result.error);
        }
        setLoading(false);
    };

    const handleExportCSV = async (dataType: 'students' | 'promotions') => {
        setLoading(true);
        const result = await exportAsCSV(academicYearId, dataType);

        if (result.success && result.data && result.filename) {
            // Download CSV file
            const blob = new Blob([result.data], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert(`${dataType === 'students' ? 'Students' : 'Promotions'} CSV downloaded successfully!`);
        } else {
            alert(result.error);
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* Create Backup */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Database className="w-6 h-6 text-purple-600" />
                    Create Backup
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Create a complete backup of all data for {academicYearName}
                </p>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={backupDescription}
                        onChange={(e) => setBackupDescription(e.target.value)}
                        placeholder="Backup description (optional)"
                        className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        onClick={handleCreateBackup}
                        disabled={loading}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Creating...' : 'Create Backup'}
                    </button>
                </div>
            </div>

            {/* Export Options */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Download className="w-6 h-6 text-blue-600" />
                    Export Data
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                    Export academic year data in various formats
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* JSON Export */}
                    <button
                        onClick={handleExportJSON}
                        disabled={loading}
                        className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left disabled:opacity-50"
                    >
                        <FileJson className="w-8 h-8 text-blue-600 mb-2" />
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Export as JSON</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Complete data export with students and promotions
                        </p>
                    </button>

                    {/* Students CSV */}
                    <button
                        onClick={() => handleExportCSV('students')}
                        disabled={loading}
                        className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left disabled:opacity-50"
                    >
                        <FileSpreadsheet className="w-8 h-8 text-green-600 mb-2" />
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Students CSV</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Export students list as CSV spreadsheet
                        </p>
                    </button>

                    {/* Promotions CSV */}
                    <button
                        onClick={() => handleExportCSV('promotions')}
                        disabled={loading}
                        className="p-4 border-2 border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors text-left disabled:opacity-50"
                    >
                        <FileSpreadsheet className="w-8 h-8 text-orange-600 mb-2" />
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-1">Promotions CSV</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Export promotion history as CSV
                        </p>
                    </button>
                </div>
            </div>

            {/* Backup History */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-slate-600" />
                    Backup History
                </h3>

                {existingBackups.length > 0 ? (
                    <div className="space-y-3">
                        {existingBackups.map((backup) => (
                            <div
                                key={backup.id}
                                className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30"
                            >
                                <div>
                                    <p className="font-medium text-slate-800 dark:text-white">
                                        {backup.description || 'Backup'}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {new Date(backup.createdAt).toLocaleString('en-IN')} · {(backup.fileSize / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <Database className="w-5 h-5 text-purple-600" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <Database className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                        <p className="text-slate-500 dark:text-slate-400">No backups created yet</p>
                    </div>
                )}
            </div>
        </div>
    );
}
