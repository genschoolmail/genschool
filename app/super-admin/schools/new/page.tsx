import { createSchoolWithAdmin } from '@/lib/actions/school-crud';
import { redirect } from 'next/navigation';
import { ArrowLeft, Building, User, Info, MapPin, Globe, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { getPlans } from '@/lib/actions/super-admin';

export default async function NewSchoolPage() {
    const plans = await getPlans();
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/super-admin/schools" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Onboard New School</h1>
                    <p className="text-slate-500 mt-1">Create a new tenant school with admin account.</p>
                </div>
            </div>

            <form
                action={async (formData) => {
                    'use server';
                    await createSchoolWithAdmin(formData);
                    redirect('/super-admin/schools');
                }}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-6"
            >
                {/* School Information Section */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Building className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">School Information</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    School Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    placeholder="e.g., Greenwood High School"
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Subdomain *
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        name="subdomain"
                                        required
                                        pattern="[a-z0-9-]+"
                                        placeholder="e.g., greenwood"
                                        className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                    />
                                    <span className="text-slate-500">.localhost:3000</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Contact Email *
                                </label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    required
                                    placeholder="contact@school.com"
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
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Information Section */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Additional Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                School Code
                            </label>
                            <input
                                type="text"
                                name="schoolCode"
                                placeholder="e.g., GHS001"
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
                                placeholder="e.g., 1995"
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
                                placeholder="e.g., 2024-25"
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
                                placeholder="e.g., Excellence in Education"
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Website URL
                            </label>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-slate-400" />
                                <input
                                    type="url"
                                    name="website"
                                    placeholder="https://www.school.com"
                                    className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Address & Location Section */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-5 h-5 text-red-600" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Address & Location</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Full Address
                            </label>
                            <textarea
                                name="address"
                                rows={2}
                                placeholder="Street name, landmark..."
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
                                    placeholder="e.g., Mumbai"
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
                                    placeholder="e.g., Maharashtra"
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
                                    placeholder="e.g., 400001"
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Plan Section */}
                <div className="border-b border-slate-200 dark:border-slate-700 pb-4">
                    <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="w-5 h-5 text-amber-600" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Subscription Plan</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Select Plan *
                            </label>
                            <select
                                name="planId"
                                required
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Choose a plan...</option>
                                {plans.map((plan) => (
                                    <option key={plan.id} value={plan.id}>
                                        {plan.name} - ₹{plan.price} / {plan.billingCycle} ({plan.maxStudents} Students, {plan.maxStaff} Staff)
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 mt-1">This plan will be active for the first 30 days.</p>
                        </div>
                    </div>
                </div>

                {/* Admin User Section */}
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <User className="w-5 h-5 text-purple-600" />
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white">School Administrator Account</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Admin Name *
                            </label>
                            <input
                                type="text"
                                name="adminName"
                                required
                                placeholder="e.g., John Doe"
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Admin Email *
                                </label>
                                <input
                                    type="email"
                                    name="adminEmail"
                                    required
                                    placeholder="admin@school.com"
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Admin Phone *
                                </label>
                                <input
                                    type="tel"
                                    name="adminPhone"
                                    required
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Default Password *
                            </label>
                            <input
                                type="password"
                                name="adminPassword"
                                required
                                placeholder="Create a secure password"
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                            <p className="text-xs text-slate-500 mt-1">Admin can change this password after first login.</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Create School & Admin
                    </button>
                    <Link
                        href="/super-admin/schools"
                        className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
