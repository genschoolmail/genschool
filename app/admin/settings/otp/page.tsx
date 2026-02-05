import { Shield, Smartphone, Mail, CheckCircle, Settings } from 'lucide-react';

export default function OTPConfigurationPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Shield className="w-7 h-7 text-red-600" />
                    OTP & Communication
                </h1>
                <p className="text-slate-500 mt-1">Configure OTP providers for login and communication</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SMS Provider */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">SMS Configuration</h3>
                            <p className="text-sm text-slate-500">Manage SMS gateways for OTP</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Provider</p>
                            <p className="font-medium text-slate-800 dark:text-white">Twilio</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Account SID</p>
                            <p className="font-mono text-xs text-slate-800 dark:text-white">AC••••••••••••••••••••••••</p>
                        </div>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Configure SMS Gateway
                        </button>
                    </div>
                </div>

                {/* Email Provider */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Email Configuration</h3>
                            <p className="text-sm text-slate-500">Manage SMTP/API for Email OTP</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Mailer Service</p>
                            <p className="font-medium text-slate-800 dark:text-white">SendGrid</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Verified Sender</p>
                            <p className="font-medium text-slate-800 dark:text-white">no-reply@school.com</p>
                        </div>
                        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                            Configure Email Mailer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
