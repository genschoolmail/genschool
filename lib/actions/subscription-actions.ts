'use server';

import { prisma } from '@/lib/prisma';
import { ensureTenantId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';
import { ensureSuperAdmin } from './super-admin';

export interface SubscriptionStatus {
    status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'SUSPENDED' | 'EXPIRING_SOON';
    planName: string;
    endDate: Date;
    daysLeft: number;
    isExpiringSoon: boolean;
    isExpired: boolean;
    billingCycle: string;
    autoRenew: boolean;
    price: number;
    planId: string;
    subscriptionId: string;
}

export async function getSchoolSubscriptionStatus(): Promise<SubscriptionStatus | null> {
    const schoolId = await ensureTenantId();

    const subscription = await prisma.subscription.findFirst({
        where: { schoolId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' }
    });

    if (!subscription) return null;

    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const isExpired = daysLeft <= 0;
    const isExpiringSoon = !isExpired && daysLeft <= 14; 

    let status = subscription.status as SubscriptionStatus['status'];
    if (isExpired && status !== 'SUSPENDED') {
        status = 'EXPIRED';
    } else if (isExpiringSoon && status === 'ACTIVE') {
        status = 'EXPIRING_SOON';
    }

    return {
        status,
        planName: subscription.plan.name,
        endDate,
        daysLeft: Math.max(0, daysLeft),
        isExpiringSoon,
        isExpired,
        billingCycle: subscription.billingCycle,
        autoRenew: subscription.autoRenew,
        price: subscription.priceOverride ?? subscription.plan.price,
        planId: subscription.planId,
        subscriptionId: subscription.id
    };
}

export async function getAllPlans() {
    const plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' }
    });
    return plans;
}

// ------ PLAN MANAGEMENT (SUPER ADMIN) ------

export async function createPlan(data: any) {
    try {
        await ensureSuperAdmin();
        const plan = await prisma.plan.create({
            data: {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                billingCycle: data.billingCycle,
                features: data.features, // JSON string
                maxStudents: Number(data.maxStudents),
                maxStaff: Number(data.maxStaff),
                trialDays: Number(data.trialDays),
                isActive: data.isActive ?? true,
                onlinePaymentEnabled: data.onlinePaymentEnabled ?? false
            }
        });
        revalidatePath('/super-admin/subscriptions');
        return { success: true, plan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updatePlan(id: string, data: any) {
    try {
        await ensureSuperAdmin();
        const plan = await prisma.plan.update({
            where: { id },
            data: {
                name: data.name,
                description: data.description,
                price: Number(data.price),
                billingCycle: data.billingCycle,
                features: data.features,
                maxStudents: Number(data.maxStudents),
                maxStaff: Number(data.maxStaff),
                trialDays: Number(data.trialDays),
                isActive: data.isActive,
                onlinePaymentEnabled: data.onlinePaymentEnabled
            }
        });
        revalidatePath('/super-admin/subscriptions');
        return { success: true, plan };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePlan(id: string) {
    try {
        await ensureSuperAdmin();
        await prisma.plan.delete({ where: { id } });
        revalidatePath('/super-admin/subscriptions');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Cannot delete plan. There might be active subscriptions using it." };
    }
}

// ------ SUBSCRIPTION MANAGEMENT (SUPER ADMIN) ------

export async function getAllSchoolAdmins() {
    try {
        await ensureSuperAdmin();
        // Return dummy data or fetch from users where role=ADMIN
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, name: true, email: true, school: { select: { id: true, name: true } } }
        });
        return admins;
    } catch (error) {
        return [];
    }
}

export async function upgradeSchoolPlan(schoolId: string, planId: string) {
    try {
        await ensureSuperAdmin();
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) throw new Error("Plan not found");

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + (plan.billingCycle === 'YEARLY' ? 12 : 1));

        await prisma.subscription.upsert({
            where: { schoolId },
            create: {
                schoolId,
                planId,
                endDate,
                status: 'ACTIVE',
                billingCycle: plan.billingCycle
            },
            update: {
                planId,
                endDate,
                status: 'ACTIVE',
                billingCycle: plan.billingCycle
            }
        });
        revalidatePath(`/super-admin/schools/${schoolId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSubscription(subscriptionId: string, data: any) {
    try {
        await ensureSuperAdmin();
        await prisma.subscription.update({
            where: { id: subscriptionId },
            data: {
                status: data.status,
                endDate: new Date(data.endDate),
                billingCycle: data.billingCycle,
                autoRenew: data.autoRenew,
                priceOverride: data.priceOverride ? Number(data.priceOverride) : null
            }
        });
        revalidatePath('/super-admin/subscriptions');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
