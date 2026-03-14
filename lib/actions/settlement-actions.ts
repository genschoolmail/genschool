'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function getSettlementStats() {
    try {
        const session = await auth();
        if (!session?.user?.schoolId) return { success: false, error: 'Unauthorized' };
        const schoolId = session.user.schoolId as string;

        // 1. Get all online payments for this school
        const allOnlinePayments = await prisma.feePayment.findMany({
            where: {
                schoolId,
                paymentMethod: 'ONLINE',
                status: 'PAID', // Only successful payments
            },
            select: {
                amount: true,
                platformFee: true,
                schoolShare: true,
                splitStatus: true,
            }
        });

        const stats = {
            totalVolume: 0,
            totalGatewayCharges: 0,
            totalNetReceivable: 0,
            pendingSettlement: 0,
            settledAmount: 0,
            processingAmount: 0,
        };

        allOnlinePayments.forEach(payment => {
            stats.totalVolume += payment.amount;
            stats.totalGatewayCharges += (payment.platformFee || 0);
            stats.totalNetReceivable += (payment.schoolShare || payment.amount);

            // Calculate status blocks based on splitStatus
            // PENDING -> Just captured
            // SUCCESS -> Transferred to linked account
            if (payment.splitStatus === 'SUCCESS') {
                stats.settledAmount += (payment.schoolShare || payment.amount);
            } else if (payment.splitStatus === 'PENDING') {
                stats.processingAmount += (payment.schoolShare || payment.amount);
            }
        });

        // Set pending as processing for simplicity right now
        stats.pendingSettlement = stats.processingAmount;

        return { success: true, stats };
    } catch (error: any) {
        console.error('Failed to get settlement stats:', error);
        return { success: false, error: 'Failed to fetch settlement data' };
    }
}

export async function getSettlementTransactions(page = 1, limit = 50) {
    try {
        const session = await auth();
        if (!session?.user?.schoolId) return { success: false, error: 'Unauthorized' };
        const schoolId = session.user.schoolId as string;
        const skip = (page - 1) * limit;

        const transactions = await prisma.feePayment.findMany({
            where: {
                schoolId,
                paymentMethod: 'ONLINE',
            },
            include: {
                studentFee: {
                    include: {
                        student: {
                            include: { user: { select: { name: true } } }
                        },
                        feeStructure: { select: { name: true } }
                    }
                }
            },
            orderBy: { date: 'desc' },
            skip,
            take: limit,
        });

        const total = await prisma.feePayment.count({
            where: {
                schoolId,
                paymentMethod: 'ONLINE',
            }
        });

        return {
            success: true,
            transactions,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };

    } catch (error: any) {
        console.error('Failed to get settlement transactions:', error);
        return { success: false, error: 'Failed to fetch transactions' };
    }
}
