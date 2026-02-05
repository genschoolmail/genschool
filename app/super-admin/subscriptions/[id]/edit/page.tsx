import { prisma } from '@/lib/prisma';
import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { updateSubscription } from '@/lib/actions/subscription-actions';
import { formatINR } from '@/lib/currency';
import { redirect } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import QuickActions from './QuickActions';

interface PageProps {
    params: { id: string };
}

export default async function EditSubscriptionPage({ params }: PageProps) {
    await ensureSuperAdmin();

    const subscription = await prisma.subscription.findUnique({
        where: { id: params.id },
        include: {
            school: true,
            plan: true
        }
    });

    if (!subscription) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Subscription Not Found</h1>
            </div>
        );
    }

    const plans = await prisma.plan.findMany({
        orderBy: { price: 'asc' }
    });

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/super-admin/subscriptions" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Subscription</h1>
                    <p className="text-slate-500 mt-1">
                        Managing subscription for: <strong>{subscription.school.name}</strong>
                    </p>
                </div>
            </div>

            {/* Current Status Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Current Plan</div>
                        <div className="text-xl font-bold text-slate-800 dark:text-white">{subscription.plan?.name || 'No Plan'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Price</div>
                        <div className="text-xl font-bold text-slate-800 dark:text-white">
                            {subscription?.priceOverride !== null && subscription?.priceOverride !== undefined
                                ? formatINR(subscription.priceOverride)
                                : formatINR(subscription.plan?.price || 0)
                            }
                            <span className="text-sm font-normal text-slate-500">/{subscription.plan?.billingCycle?.toLowerCase() || 'monthly'}</span>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-1">Status</div>
                        <div className="flex items-center gap-2">
                            {subscription.status === 'ACTIVE' ? (
                                <>
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-600">Active</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5 text-red-600" />
                                    <span className="font-semibold text-red-600">{subscription.status}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <form action={updateSubscription} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 space-y-6">
                <input type="hidden" name="subscriptionId" value={subscription.id} />

                {/* Plan Selection */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        <DollarSign className="w-4 h-4 inline mr-2" />
                        Select Plan
                    </label>
                    <select
                        name="planId"
                        defaultValue={subscription.planId}
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    >
                        {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name} - {formatINR(plan.price)}/{(plan.billingCycle || 'MONTHLY').toLowerCase()} ({plan.maxStudents} students, {plan.maxStaff} staff)
                            </option>
                        ))}
                    </select>
                </div>

                {/* Price Override */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Custom Price Override (Optional)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-3 text-slate-500">₹</span>
                            <input
                                type="number"
                                name="priceOverride"
                                defaultValue={subscription.priceOverride || ''}
                                placeholder="Leave empty for plan price"
                                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Override the standard plan price for this school only</p>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Expiry Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            defaultValue={subscription.endDate ? new Date(subscription.endDate).toISOString().split('T')[0] : ''}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                        <p className="text-xs text-slate-500 mt-2">Subscription will expire on this date</p>
                    </div>
                </div>

                {/* Status & Billing Cycle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Subscription Status
                        </label>
                        <select
                            name="status"
                            defaultValue={subscription.status}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="TRIAL">Trial</option>
                            <option value="EXPIRED">Expired</option>
                            <option value="SUSPENDED">Suspended</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                            Billing Cycle
                        </label>
                        <select
                            name="billingCycle"
                            defaultValue={subscription.billingCycle || 'MONTHLY'}
                            className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        >
                            <option value="MONTHLY">Monthly</option>
                            <option value="YEARLY">Yearly</option>
                            <option value="LIFETIME">Lifetime</option>
                        </select>
                    </div>
                </div>

                {/* Custom Features Override */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Custom Feature Overrides (JSON)
                    </label>
                    <textarea
                        name="features"
                        rows={4}
                        defaultValue={subscription.features || ''}
                        placeholder='{"transport": true, "inventory": false}'
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white font-mono text-xs"
                    ></textarea>
                    <p className="text-xs text-slate-500 mt-2">Leave empty to use plan defaults. Must be valid JSON.</p>
                </div>

                {/* Subscription Dates Info */}
                <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-3">Subscription Period</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="text-slate-500">Start Date:</span>
                            <div className="font-medium text-slate-800 dark:text-white">
                                {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString('en-IN') : 'N/A'}
                            </div>
                        </div>
                        <div>
                            <span className="text-slate-500">End Date:</span>
                            <div className="font-medium text-slate-800 dark:text-white">
                                {subscription.endDate
                                    ? new Date(subscription.endDate).toLocaleDateString('en-IN')
                                    : 'Not set'
                                }
                            </div>
                        </div>
                        <div>
                            <span className="text-slate-500">Last Payment:</span>
                            <div className="font-medium text-slate-800 dark:text-white">
                                {subscription.lastPayment
                                    ? new Date(subscription.lastPayment).toLocaleDateString('en-IN')
                                    : 'None'
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                    <h3 className="font-semibold text-slate-800 dark:text-white mb-4">Quick Actions</h3>
                    <QuickActions />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors shadow-lg shadow-indigo-500/30"
                    >
                        Save Changes
                    </button>
                    <Link
                        href="/super-admin/subscriptions"
                        className="px-6 py-3 border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-center"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}
