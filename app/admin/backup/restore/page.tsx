'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Upload, AlertTriangle, CheckCircle, Database, Calendar, HardDrive, Cloud } from 'lucide-react'

export default function RestorePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const preSelectedBackupId = searchParams.get('backupId')

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

    useEffect(() => {
        if (preSelectedBackupId && backups.length > 0) {
            const backup = backups.find(b => b.id === preSelectedBackupId)
            if (backup) {
                setSelectedBackup(backup)
                setStep('confirm')
            }
        }
    }, [preSelectedBackupId, backups])

    const loadBackups = async () => {
        try {
            const res = await fetch('/api/backup/list')
            const data = await res.json()
            if (data.success) {
                // Only show completed backups
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
            // Simulate progress
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
        <div className="p-6 max-w-5xl mx-auto">
            <Link
                href="/admin/backup"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Restore from Backup</h1>
                <p className="text-gray-600 mt-1">
                    Restore your school data from a previous backup
                </p>
            </div>

            {/* Step Indicator */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className={`flex items-center ${step === 'select' ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                            }`}>
                            1
                        </div>
                        <span className="ml-2 font-medium">Select Backup</span>
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
            </div>

            {/* Step 1: Select Backup */}
            {step === 'select' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Select a Backup to Restore</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {backups.length === 0 ? (
                            <div className="p-12 text-center">
                                <Database className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 font-medium">No backups available</p>
                                <p className="text-gray-400 text-sm mt-1">Create a backup first</p>
                                <Link
                                    href="/admin/backup/create"
                                    className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium"
                                >
                                    Create Backup
                                </Link>
                            </div>
                        ) : (
                            backups.map((backup) => (
                                <div
                                    key={backup.id}
                                    className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => handleSelectBackup(backup)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{backup.name}</h3>
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
                                                {backup.storedInCloud && (
                                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                                                        <Cloud className="w-3 h-3" />
                                                        Cloud
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
                <div className="space-y-6">
                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Selected Backup</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="font-medium text-gray-900">{selectedBackup.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Type</p>
                                <p className="font-medium text-gray-900">{selectedBackup.type}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Created</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(selectedBackup.startedAt).toLocaleString()}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Size</p>
                                <p className="font-medium text-gray-900">{formatBytes(Number(selectedBackup.fileSize))}</p>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Restore Options</h3>

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
                    </div>

                    {/* Confirmation Checkbox */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <label className="flex items-start cursor-pointer">
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
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => {
                                setStep('select')
                                setSelectedBackup(null)
                                setConfirmed(false)
                            }}
                            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleRestore}
                            disabled={!confirmed || loading}
                            className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <Upload className="w-5 h-5" />
                            {loading ? 'Restoring...' : 'Start Restore'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Progress */}
            {step === 'progress' && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Database className="w-8 h-8 text-blue-600 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">Restoring from Backup</h3>
                        <p className="text-gray-600 mt-1">Please wait while we restore your data...</p>
                    </div>

                    <div className="mb-4">
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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
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

                    <div className="flex gap-4 justify-center">
                        <Link
                            href="/admin/backup"
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            )}
        </div>
    )
}
