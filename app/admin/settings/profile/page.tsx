import { UserCog, Mail, Phone, Lock, User } from 'lucide-react';
import { getCurrentUserProfile } from '@/lib/settings-actions';
import ProfileEditForm from './ProfileEditForm';

export default async function ProfileSettingsPage() {
    const user = await getCurrentUserProfile();

    if (!user) {
        return (
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl">
                <p className="text-slate-500">Unable to load profile data</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <UserCog className="w-7 h-7 text-blue-600" />
                    Profile Settings
                </h1>
                <p className="text-slate-500 mt-1">Manage your account information and security</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Personal Information</h3>
                            <p className="text-sm text-slate-500">Update your basic details</p>
                        </div>
                    </div>
                    <ProfileEditForm user={user} />
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <Lock className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Security</h3>
                            <p className="text-sm text-slate-500">Manage your password and security</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500">Password</p>
                            <p className="font-medium text-slate-800 dark:text-white">••••••••</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500">Last Updated</p>
                            <p className="font-medium text-slate-800 dark:text-white">
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            Change Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
