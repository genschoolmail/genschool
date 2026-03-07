'use server';

import { prisma } from '@/lib/prisma';
import { ensureTenantId } from '@/lib/tenant';

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
    const isExpiringSoon = !isExpired && daysLeft <= 14; // warn 14 days before

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
