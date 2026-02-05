import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { createPlan } from '@/lib/actions/subscription-actions';
import { ArrowLeft, Package, Check, Save } from 'lucide-react';
import Link from 'next/link';

export default async function NewPlanPage() {
    await ensureSuperAdmin();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/super-admin/subscriptions/plans" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Create New Plan</h1>
                    <p className="text-slate-500 mt-1">Define a new subscription tier for schools.</p>
                </div>
            </div>

            <form action={createPlan} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 space-y-8">
                {/* Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Package className="w-5 h-5 text-indigo-500" />
                        Plan Basics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Plan Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                placeholder="e.g. Pro, Enterprise"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Cycle</label>
                            <select
                                name="billingCycle"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="LIFETIME">Lifetime</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={2}
                            placeholder="Briefly describe who this plan is for..."
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        ></textarea>
                    </div>
                </div>

                {/* Pricing & Limits */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                        <Check className="w-5 h-5 text-green-500" />
                        Pricing & Limits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price (₹)</label>
                            <input
                                name="price"
                                type="number"
                                required
                                placeholder="0 for free"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Limit</label>
                            <input
                                name="maxStudents"
                                type="number"
                                required
                                placeholder="e.g. 500"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Staff Limit</label>
                            <input
                                name="maxStaff"
                                type="number"
                                required
                                placeholder="e.g. 50"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Trial Period (Days)</label>
                        <input
                            name="trialDays"
                            type="number"
                            defaultValue={0}
                            className="w-full max-w-[200px] px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                        <p className="text-xs text-slate-500 mt-1">Number of free days for new schools</p>
                    </div>
                </div>

                {/* Features (JSON) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Features Configuration (JSON)</h3>
                    <textarea
                        name="features"
                        rows={6}
                        required
                        defaultValue={JSON.stringify({
                            transport: true,
                            inventory: true,
                            library: true,
                            finance_module: true,
                            sms_integration: false,
                            biometric_attendance: false
                        }, null, 2)}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                    ></textarea>
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Create Plan
                    </button>
                    <Link
                        href="/super-admin/subscriptions/plans"
                        className="px-6 py-3 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
