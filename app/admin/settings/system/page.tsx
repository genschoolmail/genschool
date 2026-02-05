import { Settings, Shield, Clock, Database, CheckCircle } from 'lucide-react';

export default function SystemSettingsPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Settings className="w-7 h-7 text-slate-600" />
                    System Settings
                </h1>
                <p className="text-slate-500 mt-1">General system-wide configurations and maintenance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* General Configuration */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-slate-100 dark:bg-slate-900/30 rounded-xl">
                            <Database className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">General Config</h3>
                            <p className="text-sm text-slate-500">Language, Timezone, and UI behavior</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Timezone</p>
                            <p className="font-medium text-slate-800 dark:text-white">India (GMT+5:30)</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Language</p>
                            <p className="font-medium text-slate-800 dark:text-white">English (US)</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center">
                            <span className="font-medium text-slate-800 dark:text-white">Auto-logout on Inactivity</span>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">30 mins</span>
                        </div>
                    </div>
                </div>

                {/* Maintenance Mode */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <Shield className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Security & Maintenance</h3>
                            <p className="text-sm text-slate-500">Manage system availability and security</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-medium text-slate-800 dark:text-white">Maintenance Mode</p>
                                <p className="text-xs text-slate-500">Only admins can access the app</p>
                            </div>
                            <div className="w-12 h-6 bg-slate-300 rounded-full relative">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Database Health</p>
                            <div className="flex items-center gap-2 mt-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <p className="font-medium text-green-600 text-sm">Healthy</p>
                            </div>
                        </div>
                        <button className="w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm">
                            Run System Diagnostics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
