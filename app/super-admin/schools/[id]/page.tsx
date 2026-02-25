import { getSchoolDetails, getSchoolUsers, updateSchool, deleteSchool, addAdminToSchool } from '@/lib/actions/school-crud';
import { redirect } from 'next/navigation';
import { ArrowLeft, Users, GraduationCap, Calendar, Trash2, Info, MapPin, Globe, Hash, UserCircle, ShieldAlert, Key, Mail, Phone, User } from 'lucide-react';
import Link from 'next/link';
import PasswordViewer from '@/components/common/PasswordViewer';
import SmtpSettingsForm from './SmtpSettingsForm';

export default async function SchoolDetailsPage({ params }: { params: { id: string } }) {
    const school = await getSchoolDetails(params.id);
    const users = await getSchoolUsers(params.id);

    if (!school) {
        return <div className="p-8 text-center text-slate-500">School not found.</div>;
    }

    const hasAdmin = users.some(u => u.role === 'ADMIN');

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/schools" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{school.name}</h1>
                        <p className="text-slate-500 mt-1">Manage school details and users</p>
                    </div>
                </div>
                <form action={async () => {
                    'use server';
                    await deleteSchool(params.id);
                    redirect('/super-admin/schools');
                }}>
                    <button
                        type="submit"
                        className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete School
                    </button>
                </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                            <GraduationCap className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-slate-500">Students</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">
                        {school._count?.students || 0}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-slate-500">Teachers</div>
                    </div>
                    <div className="text-3xl font-bold text-slate-800 dark:text-white">
                        {school._count?.teachers || 0}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div className="text-sm text-slate-500">Plan</div>
                    </div>
                    <div className="text-xl font-bold text-slate-800 dark:text-white">
                        {school.subscription?.plan?.name || 'Free Trial'}
                    </div>
                </div>
            </div>

            {/* Admin Alert or Setup Form */}
            {!hasAdmin && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-400 rounded-xl">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">Attention: No Administrator Found</h2>
                            <p className="text-amber-700 dark:text-amber-400 mt-1">
                                This school does not have an active administrator account. An admin is required for the school to function properly.
                            </p>
                        </div>
                    </div>

                    <form
                        action={async (formData) => {
                            'use server';
                            await addAdminToSchool(params.id, formData);
                        }}
                        className="bg-white dark:bg-slate-800/50 rounded-xl border border-amber-200 dark:border-amber-700 p-6 space-y-4 shadow-sm"
                    >
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <UserCircle className="w-5 h-5 text-indigo-500" />
                            Setup Primary Administrator
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input name="adminName" required className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="John Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input name="adminEmail" type="email" required className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="admin@school.com" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input name="adminPhone" required className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input name="adminPassword" type="password" required className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-indigo-500/30"
                            >
                                Create Admin & Initialize School
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Edit Form */}
            <form
                action={async (formData) => {
                    'use server';
                    await updateSchool(params.id, formData);
                }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-5"
            >
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">School Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            School Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={school.name}
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Status
                        </label>
                        <select
                            name="status"
                            defaultValue={school.status}
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="EXPIRED">Expired</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            name="contactEmail"
                            defaultValue={school.contactEmail || ''}
                            required
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            name="contactPhone"
                            defaultValue={school.contactPhone || ''}
                            className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-4 h-4 text-blue-600" />
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider">Settings & Affiliation</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                School Code
                            </label>
                            <input
                                type="text"
                                name="schoolCode"
                                defaultValue={school.schoolSettings?.schoolCode || ''}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Established Year
                            </label>
                            <input
                                type="text"
                                name="establishedYear"
                                defaultValue={school.schoolSettings?.establishedYear || ''}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Academic Year
                            </label>
                            <input
                                type="text"
                                name="currentAcademicYear"
                                defaultValue={school.schoolSettings?.currentAcademicYear || ''}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Affiliation Number
                            </label>
                            <input
                                type="text"
                                name="affiliationNumber"
                                defaultValue={school.schoolSettings?.affiliationNumber || ''}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Affiliated To (Board)
                            </label>
                            <input
                                type="text"
                                name="affiliatedTo"
                                defaultValue={school.schoolSettings?.affiliatedTo || ''}
                                placeholder="e.g. CBSE, ICSE"
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Motto / Slogan
                            </label>
                            <input
                                type="text"
                                name="motto"
                                defaultValue={school.schoolSettings?.motto || ''}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Website
                            </label>
                            <input
                                type="url"
                                name="website"
                                defaultValue={school.schoolSettings?.website || ''}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 pt-5">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-red-600" />
                        <h3 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider">Address & Location</h3>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Full Address
                            </label>
                            <textarea
                                name="address"
                                rows={2}
                                defaultValue={school.address || school.schoolSettings?.address || ''}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    City
                                </label>
                                <input
                                    type="text"
                                    name="city"
                                    defaultValue={school.schoolSettings?.city || ''}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    State
                                </label>
                                <input
                                    type="text"
                                    name="state"
                                    defaultValue={school.schoolSettings?.state || ''}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Pincode
                                </label>
                                <input
                                    type="text"
                                    name="pincode"
                                    defaultValue={school.schoolSettings?.pincode || ''}
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                >
                    Save Changes
                </button>
            </form>

            {/* Custom SMTP Configuration Form */}
            <SmtpSettingsForm schoolId={params.id} />

            {/* Plan Upgrade Section */}
            <PlanUpgradeForm schoolId={params.id} currentSubscription={school.subscription} />

            {/* Users List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mt-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">School Users ({users.length})</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th className="text-left p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Name</th>
                                <th className="text-left p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Email</th>
                                <th className="text-left p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Role</th>
                                <th className="text-left p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Phone</th>
                                <th className="text-left p-3 text-sm font-semibold text-slate-600 dark:text-slate-300">Password</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                    <td className="p-3 text-slate-800 dark:text-white">{user.name}</td>
                                    <td className="p-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                                    <td className="p-3">
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs rounded-full">
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-3 text-slate-600 dark:text-slate-400">{user.phone || '-'}</td>
                                    <td className="p-3">
                                        <PasswordViewer password={(user as any).tempPassword} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

// Plan Upgrade Form Component
async function PlanUpgradeForm({ schoolId, currentSubscription }: { schoolId: string; currentSubscription: any }) {
    const { formatINR } = await import('@/lib/currency');

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Subscription Management</h2>
            {currentSubscription ? (
                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Current Plan</div>
                                <div className="text-xl font-bold text-slate-800 dark:text-white mt-1">
                                    {currentSubscription.plan?.name || 'Free Trial'}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    {currentSubscription.priceOverride
                                        ? formatINR(currentSubscription.priceOverride)
                                        : formatINR(currentSubscription.plan?.price || 0)
                                    }
                                    <span className="text-xs">/{currentSubscription.plan?.billingCycle?.toLowerCase() || 'month'}</span>
                                </div>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${currentSubscription.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
                                }`}>
                                {currentSubscription.status}
                            </div>
                        </div>
                    </div>
                    <Link
                        href={`/super-admin/subscriptions/${currentSubscription.id}/edit`}
                        className="block w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-lg font-medium transition-colors"
                    >
                        Manage Subscription
                    </Link>
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-slate-500 mb-4">No active subscription</p>
                    <Link
                        href={`/super-admin/schools/${schoolId}/subscription/new`}
                        className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Create Subscription
                    </Link>
                </div>
            )}
        </div>
    );
}
