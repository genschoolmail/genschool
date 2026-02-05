import { School, MapPin, Phone, Mail, Globe, Calendar } from 'lucide-react';
import { getCurrentSchoolInfo } from '@/lib/settings-actions';
import SchoolInfoEditForm from './SchoolInfoEditForm';

export default async function SchoolInfoPage() {
    const school = await getCurrentSchoolInfo();

    if (!school) {
        return (
            <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl">
                <p className="text-slate-500">Unable to load school information</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <School className="w-7 h-7 text-indigo-600" />
                    School Information
                </h1>
                <p className="text-slate-500 mt-1">Update school details, logos, and contact information</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <School className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Basic Details</h3>
                            <p className="text-sm text-slate-500">Update your school identity</p>
                        </div>
                    </div>
                    <SchoolInfoEditForm school={school} />
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Read-only System Info</h3>
                    <div className="space-y-3">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">School Code</p>
                            <p className="font-medium text-slate-800 dark:text-white">{school.schoolId || 'Not set'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Subdomain</p>
                            <p className="font-medium text-slate-800 dark:text-white">{school.subdomain}</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Status</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${school.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                school.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {school.status}
                            </span>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-slate-500 mb-1">Registered On</p>
                            <p className="font-medium text-slate-800 dark:text-white">
                                {new Date(school.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
