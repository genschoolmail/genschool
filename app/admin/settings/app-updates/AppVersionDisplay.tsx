'use client';

import React from 'react';
import { Smartphone, Download, Clock, CheckCircle, AlertCircle, Package } from 'lucide-react';

interface AppVersion {
    id: string;
    version: string;
    buildNumber: number;
    releaseDate: string | Date;
    changelog?: string | null;
    isCurrent: boolean;
    isSecurityUpdate?: boolean;
}

export default function AppVersionDisplay({
    currentVersion,
    versionHistory
}: {
    currentVersion: AppVersion | null;
    versionHistory: AppVersion[]
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                        App Version & Updates
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">
                        View current version and update history
                    </p>
                </div>

                {/* Current Version Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-8 mb-8 text-white">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-2xl">
                                <Smartphone className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Current Version</h2>
                                <p className="text-indigo-100">You're up to date!</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-bold">{currentVersion?.version || 'v1.0.0'}</div>
                            <div className="text-indigo-100">Build {currentVersion?.buildNumber || 1}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock className="w-5 h-5" />
                                <span className="text-sm">Released</span>
                            </div>
                            <p className="font-semibold">
                                {currentVersion?.releaseDate ? new Date(currentVersion.releaseDate).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-5 h-5" />
                                <span className="text-sm">Status</span>
                            </div>
                            <p className="font-semibold">Stable</p>
                        </div>

                        <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Package className="w-5 h-5" />
                                <span className="text-sm">Environment</span>
                            </div>
                            <p className="font-semibold">Production</p>
                        </div>
                    </div>
                </div>

                {/* Version History */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        Version History
                    </h2>

                    <div className="space-y-4">
                        {versionHistory.map((version, index) => (
                            <div
                                key={version.id}
                                className={`p-6 rounded-xl border-2 ${version.isCurrent
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${version.isCurrent
                                            ? 'bg-green-500'
                                            : 'bg-slate-400'
                                            }`}>
                                            <Package className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                Version {version.version}
                                            </h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Build #{version.buildNumber} • {new Date(version.releaseDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        {version.isCurrent && (
                                            <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                                                Current
                                            </span>
                                        )}
                                        {version.isSecurityUpdate && (
                                            <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Security Update
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {version.changelog && (
                                    <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-600">
                                        <div className="prose prose-sm dark:prose-invert max-w-none">
                                            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                                                {version.changelog}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
