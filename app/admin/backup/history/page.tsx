import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getBackupList } from '@/lib/backup-actions'
import { ArrowLeft, Download, Cloud, HardDrive, Calendar, FileText } from 'lucide-react'

export default async function BackupHistoryPage() {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        redirect('/login')
    }

    // Get all backups
    const backupsResult = await getBackupList({ limit: 100 })
    const backups = backupsResult.success ? backupsResult.backups : []

    // Format bytes
    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <div className="p-6">
            <Link
                href="/admin/backup"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Backup History</h1>
                <p className="text-gray-600 mt-1">
                    View and manage all backup records
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Storage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {!backups || backups.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-12 h-12 text-gray-300 mb-3" />
                                            <p className="text-gray-500 font-medium">No backups found</p>
                                            <p className="text-gray-400 text-sm mt-1">
                                                Create your first backup to get started
                                            </p>
                                            <Link
                                                href="/admin/backup/create"
                                                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                                            >
                                                Create Backup
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                backups.map((backup) => (
                                    <tr key={backup.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                                            {backup.fileName && (
                                                <div className="text-xs text-gray-500 mt-1">{backup.fileName}</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                                {backup.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatBytes(Number(backup.fileSize))}</div>
                                            {backup.isCompressed && backup.compressionRatio > 0 && (
                                                <div className="text-xs text-gray-500">
                                                    {backup.compressionRatio.toFixed(1)}% compressed
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-2 py-1 text-xs font-medium rounded-full ${backup.status === 'COMPLETED' || backup.status === 'SYNCED'
                                                    ? 'bg-green-100 text-green-800'
                                                    : backup.status === 'FAILED'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {backup.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                {backup.storedLocally && (
                                                    <div
                                                        className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                                                        title="Stored Locally"
                                                    >
                                                        <HardDrive className="w-3 h-3" />
                                                        <span>Local</span>
                                                    </div>
                                                )}
                                                {backup.storedInCloud && (
                                                    <div
                                                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs"
                                                        title="Stored in Cloud"
                                                    >
                                                        <Cloud className="w-3 h-3" />
                                                        <span>Cloud</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(backup.startedAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {new Date(backup.startedAt).toLocaleTimeString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex gap-2">
                                                {backup.status === 'COMPLETED' || backup.status === 'SYNCED' ? (
                                                    <>
                                                        <Link
                                                            href={`/admin/backup/restore?backupId=${backup.id}`}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                        >
                                                            Restore
                                                        </Link>
                                                        {backup.filePath && (
                                                            <a
                                                                href={`/api/backup/download?id=${backup.id}`}
                                                                className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                            >
                                                                Download
                                                            </a>
                                                        )}
                                                    </>
                                                ) : backup.status === 'FAILED' ? (
                                                    <span className="text-red-600 text-sm">Failed</span>
                                                ) : (
                                                    <span className="text-yellow-600 text-sm">In Progress...</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div >
    )
}
