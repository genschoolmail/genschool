'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function getSchoolInfo() {
    try {
        const schoolId = await getTenantId();

        const school = await prisma.school.findUnique({
            where: { id: schoolId }
        });

        if (!school) {
            return null;
        }

        return {
            schoolName: school.name,
            address: school.address || '',
            contactNumber: (school as any).contactPhone || '',
            email: (school as any).contactEmail || '',
            logoUrl: school.logo || ''
        };
    } catch (error) {
        return null;
    }
}