'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function updateClassCapacity(classId: string, capacity: number) {
    try {
        const schoolId = await getTenantId();
        await prisma.class.update({
            where: { id: classId },
            data: { capacity }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
