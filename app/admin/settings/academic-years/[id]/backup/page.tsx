import { getAcademicYear } from '@/lib/actions/academic-year';
import { getBackups } from '@/lib/actions/backup-export';
import { ArrowLeft, Database } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import BackupExportUI from './BackupExportUI';

export default async function BackupExportPage({ params }: { params: { id: string } }) {
    const academicYear = await getAcademicYear(params.id);

    if (!academicYear) {
        redirect('/admin/settings/academic-years');
    }

    const backupsResult = await getBackups(params.id);
    const backups = backupsResult.success ? backupsResult.backups : [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/settings/academic-years/${params.id}`}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Database className="w-8 h-8 text-purple-600" />
                        Backup & Export
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Academic Year: <span className="font-semibold">{academicYear.name}</span>
                    </p>
                </div>
            </div>

            {/* Main UI */}
            <BackupExportUI
                academicYearId={params.id}
                academicYearName={academicYear.name}
                existingBackups={backups || []}
            />
        </div>
    );
}
