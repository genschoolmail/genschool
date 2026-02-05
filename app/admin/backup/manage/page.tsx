'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
    Download, Upload, Database, Lock, Zap, Cloud, Calendar,
    HardDrive, AlertTriangle, CheckCircle, ArrowLeft, Trash2, History
} from 'lucide-react'

type TabType = 'create' | 'restore' | 'history'

export default function BackupManagePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const tabParam = searchParams.get('tab') as TabType || 'create'
    const [activeTab, setActiveTab] = useState<TabType>(tabParam)

    // Update tab when URL changes
    useEffect(() => {
        if (tabParam && ['create', 'restore', 'history'].includes(tabParam)) {
            setActiveTab(tabParam)
        }
    }, [tabParam])

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <Link
                href="/admin/backup"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Backup & Restore Management</h1>
                <p className="text-gray-600 mt-1">
                    Create backups, restore from previous backups, and manage backup history
                </p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('create')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${activeTab === 'create'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                }`}
                        >
                            <Download className="w-5 h-5" />
                            Create Backup
                        </button>
                        <button
                            onClick={() => setActiveTab('restore')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${activeTab === 'restore'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                }`}
                        >
                            <Upload className="w-5 h-5" />
                            Restore Backup
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium transition-colors ${activeTab === 'history'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                }`}
                        >
                            <History className="w-5 h-5" />
                            Backup History
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'create' && <CreateBackupTab />}
                    {activeTab === 'restore' && <RestoreBackupTab />}
                    {activeTab === 'history' && <BackupHistoryTab />}
                </div>
            </div>
        </div>
    )
}

// Create Backup Tab Component
function CreateBackupTab() {
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
                    setLoading(false)
                    setProgress(0)
                    setStatus('')
                    setBackupName('')
                    // Refresh the history tab
                }, 2000)
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
        <div className="space-y-6">
            {/* Backup Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Backup Type
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                        onClick={() => setBackupType('FULL')}
                        disabled={loading}
                        className={`p-4 rounded-lg border-2 transition-all ${backupType === 'FULL'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Database className="w-8 h-8 mb-2 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">Full Backup</h3>
                        <p className="text-sm text-gray-600 mt-1">Complete database backup</p>
                    </button>

                    <button
                        onClick={() => setBackupType('INCREMENTAL')}
                        disabled={loading}
                        className={`p-4 rounded-lg border-2 transition-all ${backupType === 'INCREMENTAL'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Zap className="w-8 h-8 mb-2 text-purple-600" />
                        <h3 className="font-semibold text-gray-900">Incremental</h3>
                        <p className="text-sm text-gray-600 mt-1">Changes since last backup</p>
                    </button>

                    <button
                        onClick={() => setBackupType('MANUAL')}
                        disabled={loading}
                        className={`p-4 rounded-lg border-2 transition-all ${backupType === 'MANUAL'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Download className="w-8 h-8 mb-2 text-green-600" />
                        <h3 className="font-semibold text-gray-900">Manual</h3>
                        <p className="text-sm text-gray-600 mt-1">One-time manual backup</p>
                    </button>
                </div>
            </div>

            {/* Backup Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Backup Name (Optional)
                </label>
                <input
                    type="text"
                    value={backupName}
                    onChange={(e) => setBackupName(e.target.value)}
                    disabled={loading}
                    placeholder="e.g., Before Academic Year 2025"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                />
                <p className="text-sm text-gray-500 mt-1">
                    Leave empty to use automatic naming
                </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Backup Options
                </label>

                <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={enableEncryption}
                            onChange={(e) => setEnableEncryption(e.target.checked)}
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                <div>
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

            {/* Success Message */}
            {status.includes('successfully') && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                        <p className="text-green-800 font-medium">{status}</p>
                    </div>
                </div>
            )}

            {/* Action Button */}
            <button
                onClick={handleCreateBackup}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
            >
                <Download className="w-5 h-5" />
                {loading ? 'Creating Backup...' : 'Create Backup'}
            </button>
        </div>
    )
}

// Restore Backup Tab Component
function RestoreBackupTab() {
    const [backups, setBackups] = useState<any[]>([])
    const [selectedBackup, setSelectedBackup] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [createSafetyBackup, setCreateSafetyBackup] = useState(true)
    const [confirmed, setConfirmed] = useState(false)
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState('')
    const [step, setStep] = useState<'select' | 'confirm' | 'progress' | 'complete'>('select')

    useEffect(() => {
        loadBackups()
    }, [])

    const loadBackups = async () => {
        try {
            const res = await fetch('/api/backup/list')
            const data = await res.json()
            if (data.success) {
                const completedBackups = data.backups.filter(
                    (b: any) => b.status === 'COMPLETED' || b.status === 'SYNCED'
                )
                setBackups(completedBackups)
            }
        } catch (error) {
            console.error('Error loading backups:', error)
        }
    }

    const handleSelectBackup = (backup: any) => {
        setSelectedBackup(backup)
        setStep('confirm')
    }

    const handleRestore = async () => {
        if (!confirmed) {
            alert('Please confirm that you understand the risks')
            return
        }

        setLoading(true)
        setStep('progress')
        setProgress(0)
        setStatus('Preparing restore...')

        try {
            const progressInterval = setInterval(() => {
                setProgress((prev) => Math.min(prev + 5, 90))
            }, 500)

            const res = await fetch('/api/backup/restore', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    backupId: selectedBackup.id,
                    createSafetyBackup,
                }),
            })

            clearInterval(progressInterval)
            setProgress(100)

            const data = await res.json()

            if (data.success) {
                setStatus('Restore completed successfully!')
                setStep('complete')
            } else {
                setStatus(`Error: ${data.message}`)
                setStep('confirm')
                setLoading(false)
            }
        } catch (error) {
            setStatus(`Error: ${error}`)
            setStep('confirm')
            setLoading(false)
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-between">
                <div className={`flex items-center ${step === 'select' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}>
                        1
                    </div>
                    <span className="ml-2 font-medium">Select</span>
                </div>

                <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div className={`h-full ${['confirm', 'progress', 'complete'].includes(step) ? 'bg-blue-600' : ''}`} />
                </div>

                <div className={`flex items-center ${step === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}>
                        2
                    </div>
                    <span className="ml-2 font-medium">Confirm</span>
                </div>

                <div className="flex-1 h-1 mx-4 bg-gray-200">
                    <div className={`h-full ${['progress', 'complete'].includes(step) ? 'bg-blue-600' : ''}`} />
                </div>

                <div className={`flex items-center ${['progress', 'complete'].includes(step) ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['progress', 'complete'].includes(step) ? 'bg-blue-600 text-white' : 'bg-gray-200'
                        }`}>
                        3
                    </div>
                    <span className="ml-2 font-medium">Restore</span>
                </div>
            </div>

            {/* Step 1: Select Backup */}
            {step === 'select' && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Select a Backup to Restore</h3>
                    <div className="space-y-3">
                        {backups.length === 0 ? (
                            <div className="text-center py-12">
                                <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No backups available</p>
                                <p className="text-gray-400 text-sm mt-1">Create a backup first</p>
                            </div>
                        ) : (
                            backups.map((backup) => (
                                <div
                                    key={backup.id}
                                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-all"
                                    onClick={() => handleSelectBackup(backup)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">{backup.name}</h4>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                <div className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {new Date(backup.startedAt).toLocaleString()}
                                                </div>
                                                <div className="flex items-center">
                                                    <Database className="w-4 h-4 mr-1" />
                                                    {formatBytes(Number(backup.fileSize))}
                                                </div>
                                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                                    {backup.type}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {backup.storedLocally && (
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                                                        <HardDrive className="w-3 h-3" />
                                                        Local
                                                    </div>
                                                )}
                                                {backup.isEncrypted && (
                                                    <div className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">
                                                        🔐 Encrypted
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium">
                                            Select
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Step 2: Confirm */}
            {step === 'confirm' && selectedBackup && (
                <div className="space-y-4">
                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start">
                            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                            <div className="ml-3">
                                <h3 className="text-lg font-bold text-red-900">Important Warning</h3>
                                <ul className="mt-2 text-sm text-red-800 space-y-1 list-disc list-inside">
                                    <li>This will replace ALL current data with backup data</li>
                                    <li>Any changes made after this backup will be lost</li>
                                    <li>The application will need to restart after restore</li>
                                    <li>Make sure all users are logged out</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Selected Backup Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-bold text-gray-900 mb-3">Selected Backup</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-600">Name</p>
                                <p className="font-medium text-gray-900">{selectedBackup.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Type</p>
                                <p className="font-medium text-gray-900">{selectedBackup.type}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Created</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(selectedBackup.startedAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Size</p>
                                <p className="font-medium text-gray-900">{formatBytes(Number(selectedBackup.fileSize))}</p>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <label className="flex items-start cursor-pointer bg-blue-50 p-4 rounded-lg">
                        <input
                            type="checkbox"
                            checked={createSafetyBackup}
                            onChange={(e) => setCreateSafetyBackup(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="ml-3">
                            <span className="font-medium text-gray-900">Create safety backup before restore</span>
                            <p className="text-sm text-gray-600 mt-1">
                                Recommended: Creates a backup of current state before restoring
                            </p>
                        </div>
                    </label>

                    {/* Confirmation */}
                    <label className="flex items-start cursor-pointer border-2 border-gray-300 p-4 rounded-lg">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => setConfirmed(e.target.checked)}
                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-0.5"
                        />
                        <div className="ml-3">
                            <span className="font-medium text-gray-900">
                                I understand that this action will replace all current data
                            </span>
                            <p className="text-sm text-gray-600 mt-1">
                                Please confirm that you want to proceed with the restore
                            </p>
                        </div>
                    </label>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setStep('select')
                                setSelectedBackup(null)
                                setConfirmed(false)
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleRestore}
                            disabled={!confirmed || loading}
                            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            {loading ? 'Restoring...' : 'Start Restore'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Progress */}
            {step === 'progress' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Database className="w-8 h-8 text-blue-600 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Restoring from Backup</h3>
                    <p className="text-gray-600 mt-1">Please wait while we restore your data...</p>

                    <div className="mt-6">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>{status}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                        <p className="text-sm text-yellow-800">
                            ⚠️ Do not close this page or refresh the browser during restore
                        </p>
                    </div>
                </div>
            )}

            {/* Step 4: Complete */}
            {step === 'complete' && (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Restore Complete!</h3>
                    <p className="text-gray-600 mb-6">
                        Your data has been successfully restored from the backup.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-blue-800 font-medium">
                            ⚠️ Please restart the application for changes to take effect
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setStep('select')
                            setSelectedBackup(null)
                            setConfirmed(false)
                            setLoading(false)
                            loadBackups()
                        }}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                    >
                        Create Another Restore
                    </button>
                </div>
            )}
        </div>
    )
}

// Backup History Tab Component
function BackupHistoryTab() {
    const [backups, setBackups] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadBackups()
    }, [])

    const loadBackups = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/backup/list')
            const data = await res.json()
            if (data.success) {
                setBackups(data.backups)
            }
        } catch (error) {
            console.error('Error loading backups:', error)
        }
        setLoading(false)
    }

    const handleDelete = async (backupId: string) => {
        if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
            return
        }

        try {
            const res = await fetch(`/api/backup/${backupId}`, {
                method: 'DELETE',
            })
            const data = await res.json()
            if (data.success) {
                loadBackups()
            } else {
                alert(`Error: ${data.message}`)
            }
        } catch (error) {
            alert(`Error: ${error}`)
        }
    }

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">All Backups</h3>
                <button
                    onClick={loadBackups}
                    disabled={loading}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Storage</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {backups.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                    No backups found
                                </td>
                            </tr>
                        ) : (
                            backups.map((backup) => (
                                <tr key={backup.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-medium text-gray-900">{backup.name}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                            {backup.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {formatBytes(Number(backup.fileSize))}
                                    </td>
                                    <td className="px-4 py-3">
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
                                    <td className="px-4 py-3 text-sm text-gray-500">
                                        {new Date(backup.startedAt).toLocaleString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2">
                                            {backup.storedLocally && (
                                                <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center" title="Local">
                                                    <HardDrive className="w-4 h-4 text-blue-600" />
                                                </div>
                                            )}
                                            {backup.storedInCloud && (
                                                <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center" title="Cloud">
                                                    <Cloud className="w-4 h-4 text-green-600" />
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => handleDelete(backup.id)}
                                            className="text-red-600 hover:text-red-700 p-1"
                                            title="Delete backup"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
