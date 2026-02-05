
import { prisma } from '@/lib/prisma';
import { upgradeSchoolPlan } from '@/lib/actions/subscription-actions';
import { redirect } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default async function NewSubscriptionPage({ params }: { params: { id: string } }) {
    const schoolId = params.id;
    const plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });

    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        select: { name: true }
    });

    if (!school) {
        return <div>School not found</div>;
    }

    async function handleCreateSubscription(formData: FormData) {
        'use server';
        const planId = formData.get('planId') as string;
        if (planId) {
            await upgradeSchoolPlan(schoolId, planId);
            redirect(`/super-admin/schools/${schoolId}`);
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-8 px-4">
            <Link href={`/super-admin/schools/${schoolId}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6">
                <ArrowLeft className="w-4 h-4" />
                Back to School
            </Link>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Create Subscription</h1>
                <p className="text-slate-500 mb-6">Assign a plan to {school.name}</p>

                <form action={handleCreateSubscription} className="space-y-4">
                    <div className="space-y-3">
                        {plans.map((plan) => (
                            <label key={plan.id} className="flex items-center p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/20">
                                <input type="radio" name="planId" value={plan.id} className="w-5 h-5 text-indigo-600" required />
                                <div className="ml-4 flex-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-slate-900 dark:text-white">{plan.name}</span>
                                        <span className="text-indigo-600 font-bold">₹{plan.price}</span>
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        {plan.billingCycle} billing • {plan.description}
                                    </div>
                                </div>
                            </label>
                        ))}

                        {plans.length === 0 && (
                            <div className="p-4 bg-amber-50 text-amber-800 rounded-lg text-sm">
                                No active plans found. Please create plans in the Super Admin dashboard first.
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={plans.length === 0}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        <Check className="w-5 h-5" />
                        Assign Plan
                    </button>
                </form>
            </div>
        </div>
    );
}
