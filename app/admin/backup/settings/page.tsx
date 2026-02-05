'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Key, Download, Upload, Save } from 'lucide-react'
import Link from 'next/link'

export default function BackupSettingsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [config, setConfig] = useState<any>(null)
    const [encryptionKey, setEncryptionKey] = useState('')
    const [showKey, setShowKey] = useState(false)

    useEffect(() => {
        loadConfig()
    }, [])

    const loadConfig = async () => {
        try {
            const res = await fetch('/api/backup/config')
            const data = await res.json()
            if (data.success) {
                setConfig(data.config)
            }
        } catch (error) {
            console.error('Error loading config:', error)
        }
    }

    const handleSaveConfig = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/backup/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            })

            const data = await res.json()
            if (data.success) {
                alert('Settings saved successfully!')
            } else {
                alert(`Error: ${data.message}`)
            }
        } catch (error) {
            alert(`Error: ${error}`)
        } finally {
            setLoading(false)
        }
    }

    const handleExportKey = async () => {
        try {
            const res = await fetch('/api/backup/encryption/export')
            const data = await res.json()

            if (data.success && data.key) {
                setEncryptionKey(data.key)
                setShowKey(true)

                // Download key as file
                const blob = new Blob([data.key], { type: 'text/plain' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'encryption-key.txt'
                a.click()
                URL.revokeObjectURL(url)
            } else {
                alert(`Error: ${data.message}`)
            }
        } catch (error) {
            alert(`Error: ${error}`)
        }
    }

    const handleImportKey = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        try {
            const text = await file.text()

            const res = await fetch('/api/backup/encryption/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: text.trim() }),
            })

            const data = await res.json()
            if (data.success) {
                alert('Encryption key imported successfully!')
                loadConfig()
            } else {
                alert(`Error: ${data.message}`)
            }
        } catch (error) {
            alert(`Error: ${error}`)
        }
    }

    if (!config) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <p className="text-gray-500">Loading settings...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link
                href="/admin/backup"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Link>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Backup Settings</h1>
                <p className="text-gray-600 mt-1">
                    Configure backup options and encryption settings
                </p>
            </div>

            <div className="space-y-6">
                {/* Encryption Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Encryption Settings</h2>

                    <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Key className="w-5 h-5 text-blue-600 mt-0.5" />
                                <div className="ml-3 flex-1">
                                    <h3 className="font-medium text-blue-900">Encryption Status</h3>
                                    <p className="text-sm text-blue-700 mt-1">
                                        {config.encryptionInitialized
                                            ? '✓ Encryption is initialized and active'
                                            : '⚠ Encryption not initialized'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={handleExportKey}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Export Encryption Key
                            </button>

                            <label className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer">
                                <Upload className="w-5 h-5" />
                                Import Encryption Key
                                <input
                                    type="file"
                                    accept=".txt"
                                    onChange={handleImportKey}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {showKey && encryptionKey && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm font-medium text-gray-700 mb-2">
                                    Your Encryption Key (Save this securely!)
                                </p>
                                <code className="block bg-white p-3 rounded border border-gray-300 text-xs break-all">
                                    {encryptionKey}
                                </code>
                                <p className="text-xs text-red-600 mt-2">
                                    ⚠ Keep this key safe! You'll need it to restore backups on another device.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Automatic Backup Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Automatic Backup</h2>

                    <div className="space-y-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={config.autoBackupEnabled}
                                onChange={(e) => setConfig({ ...config, autoBackupEnabled: e.target.checked })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700 font-medium">
                                Enable automatic backups
                            </span>
                        </label>

                        {config.autoBackupEnabled && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Backup Frequency
                                    </label>
                                    <select
                                        value={config.backupFrequency}
                                        onChange={(e) => setConfig({ ...config, backupFrequency: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="HOURLY">Hourly</option>
                                        <option value="DAILY">Daily</option>
                                        <option value="WEEKLY">Weekly</option>
                                        <option value="MONTHLY">Monthly</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Backup Time
                                    </label>
                                    <input
                                        type="time"
                                        value={config.backupTime || '02:00'}
                                        onChange={(e) => setConfig({ ...config, backupTime: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Cloud Storage Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Cloud Storage</h2>

                    <div className="space-y-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={config.enableCloudStorage}
                                onChange={(e) => setConfig({ ...config, enableCloudStorage: e.target.checked })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700 font-medium">
                                Enable cloud storage
                            </span>
                        </label>

                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={config.autoSyncEnabled}
                                onChange={(e) => setConfig({ ...config, autoSyncEnabled: e.target.checked })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="ml-3 text-gray-700 font-medium">
                                Enable automatic sync to cloud
                            </span>
                        </label>

                        {config.autoSyncEnabled && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sync Interval (minutes)
                                </label>
                                <input
                                    type="number"
                                    min="5"
                                    max="1440"
                                    value={config.syncIntervalMinutes}
                                    onChange={(e) =>
                                        setConfig({ ...config, syncIntervalMinutes: parseInt(e.target.value) })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Retention Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Retention Policy</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Keep backups for (days)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="365"
                                value={config.retentionDays}
                                onChange={(e) => setConfig({ ...config, retentionDays: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Maximum number of backups to keep
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={config.maxBackupsToKeep}
                                onChange={(e) =>
                                    setConfig({ ...config, maxBackupsToKeep: parseInt(e.target.value) })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-4">
                    <button
                        onClick={handleSaveConfig}
                        disabled={loading}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </div>
        </div>
    )
}
