'use server';

import { prisma } from '@/lib/prisma';

export async function getSubscription(schoolId: string) {
    if (!schoolId) {
        return null;
    }

    try {
        const subscription = await prisma.subscription.findFirst({
            where: { schoolId },
            include: {
                plan: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return subscription;
    } catch (error) {
        console.error('Error fetching subscription:', error);
        return null;
    }
}

export async function checkFeatureAccess(schoolId: string, featureName: string): Promise<boolean> {
    const subscription = await getSubscription(schoolId);

    if (!subscription || !subscription.plan) {
        return false;
    }

    try {
        const features = JSON.parse(subscription.plan.features || '{}');
        return features[featureName] !== false;
    } catch {
        return true; // Default to allowing features if parsing fails
    }
}

export async function checkUsageLimit(schoolId: string, type: 'student' | 'teacher' | 'class') {
    const subscription = await getSubscription(schoolId);
    if (!subscription || !subscription.plan) {
        return { allowed: true, current: 0, limit: Infinity }; // Default to allowing if no plan
    }

    const features = JSON.parse(subscription.plan.features || '{}');
    let limit = Infinity;
    let current = 0;

    if (type === 'student') {
        limit = features.studentLimit || Infinity;
        current = await prisma.student.count({ where: { schoolId } });
    } else if (type === 'teacher') {
        limit = features.teacherLimit || Infinity;
        current = await prisma.teacher.count({ where: { schoolId } });
    } else if (type === 'class') {
        limit = features.classLimit || Infinity;
        current = await prisma.class.count({ where: { schoolId } });
    }

    return {
        allowed: current < limit,
        current,
        limit
    };
}