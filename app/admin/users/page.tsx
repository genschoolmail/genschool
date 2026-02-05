import React from 'react';
import { prisma } from '@/lib/prisma';
import { Search, Shield, User } from 'lucide-react';
import { ResetPasswordForm } from './ResetPasswordForm';
import { getTenantId } from '@/lib/tenant';

export default async function UserManagementPage({ searchParams }: { searchParams: { q?: string } }) {
    const schoolId = await getTenantId();
    if (!schoolId) {
        throw new Error('Tenant ID not found');
    }

    const query = searchParams.q || '';

    const users = await prisma.user.findMany({
        where: {
            schoolId, // Strict scoping
            role: { not: 'SUPER_ADMIN' }, // Hide platform admins
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } },
                { studentProfile: { phone: { contains: query } } },
                { teacherProfile: { phone: { contains: query } } },
            ]
        },
        include: {
            studentProfile: { select: { phone: true } },
            teacherProfile: { select: { phone: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Shield className="w-7 h-7 md:w-8 md:h-8 text-indigo-600" />
                        User Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage user passwords and access</p>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <form className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Search by name, email, or phone..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-base"
                    />
                </form>
            </div>

            {/* Users List - Desktop Table */}
            <div className="hidden md:block bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">User</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Role</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Contact</th>
                                <th className="p-4 font-semibold text-slate-600 dark:text-slate-300">Reset Password</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                                {(user.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                                            user.role === 'TEACHER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                user.role === 'STUDENT' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-sm">
                                        {user.phone || (user as any).teacherProfile?.phone || (user as any).studentProfile?.phone || 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'ADMIN' ? (
                                            <span className="text-xs text-slate-400 italic">Manage in Profile Settings</span>
                                        ) : (
                                            <ResetPasswordForm userId={user.id} />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="empty-state py-12">
                        <User className="empty-state-icon mx-auto" />
                        <h3 className="empty-state-title">No Users Found</h3>
                        <p className="empty-state-description">
                            {query ? 'Try adjusting your search terms' : 'No users available in the system'}
                        </p>
                    </div>
                )}
            </div>

            {/* Users List - Mobile Cards */}
            <div className="md:hidden space-y-4">
                {users.length === 0 ? (
                    <div className="empty-state py-12 bg-white dark:bg-slate-800 rounded-2xl">
                        <User className="empty-state-icon mx-auto" />
                        <h3 className="empty-state-title">No Users Found</h3>
                        <p className="empty-state-description">
                            {query ? 'Try adjusting your search terms' : 'No users available in the system'}
                        </p>
                    </div>
                ) : (
                    users.map((user) => (
                        <div key={user.id} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                            <div className="flex items-start gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md">
                                    {(user.name || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                                    <div className="mt-2">
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' :
                                            user.role === 'TEACHER' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' :
                                                user.role === 'STUDENT' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' :
                                                    'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Phone</span>
                                    <span className="text-sm text-slate-900 dark:text-white font-mono">
                                        {user.phone || (user as any).teacherProfile?.phone || (user as any).studentProfile?.phone || 'N/A'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-2">Reset Password</span>
                                    {user.role === 'ADMIN' ? (
                                        <span className="text-xs text-slate-400 italic">Manage in Profile Settings</span>
                                    ) : (
                                        <ResetPasswordForm userId={user.id} />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
