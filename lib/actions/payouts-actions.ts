'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function getPayoutsData() {
    try {
        const schoolId = await getTenantId();

        // 1. Fetch Online Transactions (FeePayment where method is online)
        const transactions = await prisma.feePayment.findMany({
            where: {
                schoolId,
                method: {
                    in: ['razorpay', 'stripe', 'online']
                }
            },
            include: {
                studentFee: {
                    include: {
                        student: {
                            include: {
                                user: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        // 2. Fetch Settlements (Same FeePayment records but group or filter by transfer status)
        // For simplicity, we just return the same list and components will filter

        // 3. Fetch Gateway Config
        const gateways = await prisma.paymentGateway.findMany({
            where: { schoolId }
        });

        // 4. Fetch School Bank Details
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: {
                subMerchantId: true,
                commissionPercentage: true,
                bankDetailsVerified: true,
                bankDetails: true
            }
        });

        return {
            transactions,
            gateways,
            school
        };
    } catch (error) {
        console.error('Get payouts data error:', error);
        return {
            transactions: [],
            gateways: [],
            school: null
        };
    }
}
