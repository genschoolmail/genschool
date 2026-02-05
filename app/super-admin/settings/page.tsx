import Link from 'next/link';
import { ensureSuperAdmin, getSystemSettings, ensureCommunicationSettings } from '@/lib/actions/super-admin';
import { UserCircle, ShieldAlert } from 'lucide-react';
import SettingsClient from './SettingsClient';

export default async function PlatformSettingsPage() {
    await ensureSuperAdmin();
    await ensureCommunicationSettings(); // Ensure communication keys exist
    const allSettings = await getSystemSettings();

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        Platform Settings
                    </h1>
                    <p className="text-slate-500 mt-1 text-lg">
                        Manage global integrations and system-wide configurations.
                    </p>
                </div>
                <Link
                    href="/super-admin/settings/profile"
                    className="flex items-center px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                >
                    <UserCircle className="w-5 h-5 mr-2 text-indigo-600" />
                    My Profile
                </Link>
            </div>

            {/* Main Settings Interface */}
            <div className="min-h-[400px]">
                <SettingsClient allSettings={allSettings as any} />
            </div>

            {/* Advanced Configuration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ShieldAlert className="w-6 h-6" />
                        Platform vs School Settings
                    </h3>
                    <div className="space-y-4 opacity-90 text-sm">
                        <p>
                            Platform settings affect all schools in the system. Use these to configure shared infrastructure like SMTP and SMS gateways.
                        </p>
                        <ul className="grid grid-cols-2 gap-2">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                                Email (SMTP)
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                                SMS Gateway
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                                Maps API
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50"></div>
                                Cloud Storage
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Development Tools</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                            <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">System Logs</p>
                                <p className="text-slate-500 text-xs">View real-time platform logs</p>
                            </div>
                            <button className="px-4 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-medium hover:bg-slate-300 transition-colors">
                                View
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                            <div>
                                <p className="font-semibold text-slate-700 dark:text-slate-200">Cache Flush</p>
                                <p className="text-slate-500 text-xs">Clear platform-wide Redis cache</p>
                            </div>
                            <button className="px-4 py-1.5 bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 transition-colors">
                                Flush
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
