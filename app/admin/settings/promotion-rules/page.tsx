import { FileCheck, TrendingUp, Award } from 'lucide-react';
import { getPromotionRules } from '@/lib/settings-actions';

export default async function PromotionRulesPage() {
    const rules = await getPromotionRules();

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-7 h-7 text-orange-600" />
                    Promotion Rules
                </h1>
                <p className="text-slate-500 mt-1">Set criteria for student promotion to the next class</p>
            </div>

            {rules ? (
                <div className="grid grid-cols-1 gap-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Passing Criteria</h3>
                                <p className="text-sm text-slate-500">Minimum marks required for promotion</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Minimum Percentage</p>
                                <p className="text-2xl font-bold text-green-600">{rules.minPercentage}%</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Subject Pass Marks</p>
                                <p className="text-2xl font-bold text-green-600">{rules.minMarks}/100</p>
                            </div>
                            <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                <p className="text-sm text-slate-500 mb-1">Grace Marks</p>
                                <p className="text-2xl font-bold text-green-600">{rules.graceMarks || 0}</p>
                            </div>
                        </div>
                    </div>

                    {rules.minAttendance && (
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Attendance Requirements</h3>
                                    <p className="text-sm text-slate-500">Minimum attendance for promotion</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <p className="text-sm text-slate-500 mb-1">Minimum Attendance</p>
                                    <p className="text-2xl font-bold text-blue-600">{rules.minAttendance}%</p>
                                </div>
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                    <p className="text-sm text-slate-500 mb-1">Medical Leave Exemption</p>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {rules.allowMedicalExemption ? 'Yes' : 'No'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl border border-slate-200 dark:border-slate-700 text-center">
                    <FileCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Promotion Rules Set</h3>
                    <p className="text-slate-500 mb-4">Configure promotion criteria to enable automatic student promotion</p>
                    <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                        Set Promotion Rules
                    </button>
                </div>
            )}
        </div>
    );
}
