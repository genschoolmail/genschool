import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Package, Plus } from 'lucide-react';
import { revalidatePath } from 'next/cache';
import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { formatINR } from '@/lib/currency';

async function getPlans() {
    return await prisma.plan.findMany({ orderBy: { price: 'asc' } });
}

async function createDefaultPlans() {
    'use server';
    await ensureSuperAdmin();
    // Idempotent seed
    const plans = [
        {
            name: 'Basic', description: 'Essential features for small schools', price: 999, maxStudents: 50, maxStaff: 5,
            features: JSON.stringify({ transport: false, inventory: false, library: false, finance_module: true, sms_integration: false })
        },
        {
            name: 'Standard', description: 'Everything you need to grow', price: 2999, maxStudents: 200, maxStaff: 20,
            features: JSON.stringify({ transport: true, inventory: true, library: true, finance_module: true, sms_integration: true })
        },
        {
            name: 'Premium', description: 'Unlimited power for large institutions', price: 9999, maxStudents: 1000, maxStaff: 100,
            features: JSON.stringify({ transport: true, inventory: true, library: true, finance_module: true, sms_integration: true, biometric_attendance: true })
        }
    ];

    for (const p of plans) {
        await prisma.plan.upsert({
            where: { name: p.name },
            update: p,
            create: p
        });
    }
    revalidatePath('/super-admin/subscriptions/plans');
}

export default async function PlansPage() {
    const plans = await getPlans();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Subscription Plans</h1>
                    <p className="text-slate-500">Define tiers and feature sets.</p>
                </div>
                <div className="flex gap-3">
                    <form action={createDefaultPlans}>
                        <button className="flex items-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors">
                            Seed Defaults
                        </button>
                    </form>
                    <Link
                        href="/super-admin/subscriptions/plans/new"
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Plan
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">{plan.name}</h3>
                            <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px]">{plan.description}</p>
                        </div>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-6">
                            {formatINR(plan.price)}<span className="text-sm font-normal text-slate-500">/{plan.billingCycle.toLowerCase()}</span>
                        </div>

                        <div className="space-y-3 mb-8 flex-1">
                            <LimitItem label="Students" value={plan.maxStudents} />
                            <LimitItem label="Staff" value={plan.maxStaff} />
                            <LimitItem label="Trial Days" value={plan.trialDays || 0} />
                            <div className="pt-2 border-t border-slate-100 dark:border-slate-700"></div>
                            <FeatureList features={plan.features} />
                        </div>

                        <Link
                            href={`/super-admin/subscriptions/plans/${plan.id}/edit`}
                            className="w-full py-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors text-center font-medium"
                        >
                            Edit Plan
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}

function LimitItem({ label, value }: { label: string; value: number }) {
    return (
        <div className="flex justify-between text-sm">
            <span className="text-slate-500">{label} Limit</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{value}</span>
        </div>
    );
}

function FeatureList({ features }: { features: string }) {
    try {
        const parsed = JSON.parse(features);
        return (
            <div className="space-y-2">
                {Object.entries(parsed).map(([key, enabled]) => (
                    <div key={key} className={`flex items-center text-xs ${enabled ? 'text-green-600 dark:text-green-400' : 'text-slate-400 line-through'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full mr-2 ${enabled ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                        {key.replace('_', ' ').toUpperCase()}
                    </div>
                ))}
            </div>
        )
    } catch (e) {
        return <div className="text-red-500 text-xs">Invalid Feature JSON</div>
    }
}
