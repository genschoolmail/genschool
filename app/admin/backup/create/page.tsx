'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Download, Lock, Zap, Cloud, Database, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function CreateBackupPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [backupType, setBackupType] = useState<'FULL' | 'INCREMENTAL' | 'MANUAL'>('FULL')
    const [backupName, setBackupName] = useState('')
    const [enableEncryption, setEnableEncryption] = useState(true)
    const [enableCompression, setEnableCompression] = useState(true)
    const [uploadToCloud, setUploadToCloud] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState('')

    const handleCreateBackup = async () => {
        setLoading(true)
        setProgress(0)
        setStatus('Initializing backup...')

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 10, 90))
            }, 500)

            const res = await fetch('/api/backup/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: backupType,
                    customName: backupName || undefined,
                    options: {
                        encrypt: enableEncryption,
                        compress: enableCompression,
                        uploadToCloud,
                    },
                }),
            })

            clearInterval(progressInterval)
            setProgress(100)

            const data = await res.json()

            if (data.success) {
                setStatus('Backup created successfully!')
                setTimeout(() => {
                    router.push('/admin/backup')
                }, 1500)
            } else {
                setStatus(`Error: ${data.message}`)
                setLoading(false)
            }
        } catch (error) {
            setStatus(`Error: ${error}`)
            setLoading(false)
        }
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link
                href="/admin/backup"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Backups
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Create Backup</h1>
                <p className="text-gray-600 mt-1">
                    Create a new backup of your school management data
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                {/* Backup Type */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Backup Type
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => setBackupType('FULL')}
                            className={`p-4 rounded-lg border-2 transition-all ${backupType === 'FULL'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Database className="w-8 h-8 mb-2 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Full Backup</h3>
                            <p className="text-sm text-gray-600 mt-1">Complete database backup</p>
                        </button>

                        <button
                            onClick={() => setBackupType('INCREMENTAL')}
                            className={`p-4 rounded-lg border-2 transition-all ${backupType === 'INCREMENTAL'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Zap className="w-8 h-8 mb-2 text-purple-600" />
                            <h3 className="font-semibold text-gray-900">Incremental</h3>
                            <p className="text-sm text-gray-600 mt-1">Changes since last backup</p>
                        </button>

                        <button
                            onClick={() => setBackupType('MANUAL')}
                            className={`p-4 rounded-lg border-2 transition-all ${backupType === 'MANUAL'
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Download className="w-8 h-8 mb-2 text-green-600" />
                            <h3 className="font-semibold text-gray-900">Manual</h3>
                            <p className="text-sm text-gray-600 mt-1">One-time manual backup</p>
                        </button>
                    </div>
                </div>

                {/* Backup Name */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Backup Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={backupName}
                        onChange={(e) => setBackupName(e.target.value)}
                        placeholder="e.g., Before Academic Year 2025"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                        Leave empty to use automatic naming
                    </p>
                </div>

                {/* Options */}
                <div className="mb-6 space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Backup Options
                    </label>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableEncryption}
                                onChange={(e) => setEnableEncryption(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                    <Lock className="w-5 h-5 text-gray-600 mr-2" />
                                    <span className="font-medium text-gray-900">Enable Encryption</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Automatically encrypt backup with AES-256 encryption
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={enableCompression}
                                onChange={(e) => setEnableCompression(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                    <Zap className="w-5 h-5 text-gray-600 mr-2" />
                                    <span className="font-medium text-gray-900">Enable Compression</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Compress backup to reduce file size
                                </p>
                            </div>
                        </label>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={uploadToCloud}
                                onChange={(e) => setUploadToCloud(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="ml-3 flex-1">
                                <div className="flex items-center">
                                    <Cloud className="w-5 h-5 text-gray-600 mr-2" />
                                    <span className="font-medium text-gray-900">Upload to Cloud</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Sync backup to cloud storage after creation
                                </p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Progress */}
                {loading && (
                    <div className="mb-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{status}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={handleCreateBackup}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Download className="w-5 h-5" />
                        {loading ? 'Creating Backup...' : 'Create Backup'}
                    </button>
                    <Link
                        href="/admin/backup"
                        className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </div>
        </div>
    )
}
