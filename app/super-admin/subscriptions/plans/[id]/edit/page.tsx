import { prisma } from '@/lib/prisma';
import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { updatePlan, deletePlan } from '@/lib/actions/subscription-actions';
import { ArrowLeft, Package, Check, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

interface PageProps {
    params: { id: string };
}

export default async function EditPlanPage({ params }: PageProps) {
    await ensureSuperAdmin();

    const plan = await prisma.plan.findUnique({
        where: { id: params.id },
        include: { _count: { select: { subscriptions: true } } }
    });

    if (!plan) {
        return redirect('/super-admin/subscriptions/plans');
    }

    const handleDelete = async () => {
        'use server';
        await deletePlan(params.id);
        redirect('/super-admin/subscriptions/plans');
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/super-admin/subscriptions/plans" className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Edit Plan</h1>
                        <p className="text-slate-500 mt-1">Modify subscription tier parameters.</p>
                    </div>
                </div>

                {plan._count.subscriptions === 0 && (
                    <form action={handleDelete}>
                        <button
                            type="submit"
                            className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium border border-red-200"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Plan
                        </button>
                    </form>
                )}
            </div>

            <form action={updatePlan.bind(null, plan.id)} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 space-y-8">
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
                                defaultValue={plan.name}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Cycle</label>
                            <select
                                name="billingCycle"
                                defaultValue={plan.billingCycle}
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
                            defaultValue={plan.description || ''}
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
                                defaultValue={plan.price}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Student Limit</label>
                            <input
                                name="maxStudents"
                                type="number"
                                required
                                defaultValue={plan.maxStudents}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Staff Limit</label>
                            <input
                                name="maxStaff"
                                type="number"
                                required
                                defaultValue={plan.maxStaff}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Trial Period (Days)</label>
                        <input
                            name="trialDays"
                            type="number"
                            defaultValue={plan.trialDays || 0}
                            className="w-full max-w-[200px] px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                        />
                    </div>
                </div>

                {/* Features (JSON) */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Features Configuration (JSON)</h3>
                        <span className="text-xs text-slate-400">JSON format required</span>
                    </div>
                    <textarea
                        name="features"
                        rows={8}
                        required
                        defaultValue={(() => {
                            try {
                                return JSON.stringify(JSON.parse(plan.features || '{}'), null, 2);
                            } catch (e) {
                                return plan.features || '{}';
                            }
                        })()}
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                    ></textarea>
                </div>

                <div className="flex gap-4 pt-6">
                    <button
                        type="submit"
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                    >
                        <Save className="w-5 h-5 mr-2" />
                        Update Plan
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
