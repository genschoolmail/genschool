'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function getAllRefundRequests() {
    try {
        const schoolId = await getTenantId();
        return await prisma.refundRequest.findMany({
            where: {
                schoolId,
                status: 'PENDING'
            },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

export async function getCompletedRefunds() {
    try {
        const schoolId = await getTenantId();
        return await prisma.refundRequest.findMany({
            where: {
                schoolId,
                status: 'COMPLETED'
            },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

export async function processRefund(refundId: string) {
    try {
        await prisma.refundRequest.update({
            where: { id: refundId },
            data: {
                status: 'COMPLETED',
                processedAt: new Date()
            }
        }).catch(() => null);
        
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}