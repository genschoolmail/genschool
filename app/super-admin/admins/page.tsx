import { getAllSchoolAdmins } from '@/lib/actions/subscription-actions';
import { Users, Mail, Phone, Building } from 'lucide-react';
import PasswordViewer from '@/components/common/PasswordViewer';

export default async function AllAdminsPage() {
    const admins = await getAllSchoolAdmins();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">All School Administrators</h1>
                <p className="text-slate-500 mt-1">
                    View all school admin accounts across the platform (Super Admin credentials are hidden).
                </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                            <tr>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Name</th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Phone</th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Password</th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">School</th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Role</th>
                                <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-slate-500">
                                        No school admin accounts found.
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-semibold">
                                                    {admin.name?.charAt(0) || 'A'}
                                                </div>
                                                <span className="font-medium text-slate-800 dark:text-white">{admin.name}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Mail className="w-4 h-4" />
                                                {admin.email}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Phone className="w-4 h-4" />
                                                {admin.phone}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <PasswordViewer password={(admin as any).tempPassword} />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                                <Building className="w-4 h-4" />
                                                <div>
                                                    <div className="font-medium text-slate-800 dark:text-white">{admin.school?.name}</div>
                                                    <div className="text-xs text-slate-500">{admin.school?.subdomain}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs rounded-full font-medium">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Note about Super Admin security */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="text-sm">
                        <span className="font-semibold text-amber-900 dark:text-amber-100">Security Notice:</span>
                        <span className="text-amber-800 dark:text-amber-200 ml-1">
                            Super Admin credentials are protected and not visible in this list for security purposes.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
