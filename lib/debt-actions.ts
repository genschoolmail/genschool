'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function getAllStudentsWithDebt() {
    try {
        const schoolId = await getTenantId();
        // Get students with pending fee payments
        const students = await prisma.student.findMany({
            where: {
                schoolId,
                feePayments: {
                    some: {
                        status: 'PENDING'
                    }
                }
            },
            include: {
                user: true,
                class: true,
                feePayments: {
                    where: { status: 'PENDING' }
                }
            }
        }).catch(() => []);

        return students;
    } catch (error) {
        return [];
    }
}
