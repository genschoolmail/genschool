import { Database, Download, Upload, FileSpreadsheet } from 'lucide-react';

export default function DataManagementPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Database className="w-7 h-7 text-cyan-600" />
                    Data Management
                </h1>
                <p className="text-slate-500 mt-1">Bulk import/export student and staff data</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Import Data */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                            <Upload className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Import Data</h3>
                            <p className="text-sm text-slate-500">Upload CSV/Excel files</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-medium text-slate-800 dark:text-white mb-2">Student Data</p>
                            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Import Students
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-medium text-slate-800 dark:text-white mb-2">Teacher Data</p>
                            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Import Teachers
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-medium text-slate-800 dark:text-white mb-2">Fee Data</p>
                            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                Import Fees
                            </button>
                        </div>
                    </div>
                </div>

                {/* Export Data */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Download className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Export Data</h3>
                            <p className="text-sm text-slate-500">Download CSV/Excel files</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-medium text-slate-800 dark:text-white mb-2">Student Data</p>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Export Students
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-medium text-slate-800 dark:text-white mb-2">Teacher Data</p>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Export Teachers
                            </button>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="font-medium text-slate-800 dark:text-white mb-2">Financial Reports</p>
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Export Reports
                            </button>
                        </div>
                    </div>
                </div>

                {/* Templates */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <FileSpreadsheet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Download Templates</h3>
                            <p className="text-sm text-slate-500">Sample CSV/Excel templates for bulk import</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left">
                            <p className="font-medium text-slate-800 dark:text-white">Student Template</p>
                            <p className="text-sm text-slate-500">CSV format</p>
                        </button>
                        <button className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left">
                            <p className="font-medium text-slate-800 dark:text-white">Teacher Template</p>
                            <p className="text-sm text-slate-500">CSV format</p>
                        </button>
                        <button className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left">
                            <p className="font-medium text-slate-800 dark:text-white">Fee Template</p>
                            <p className="text-sm text-slate-500">CSV format</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
