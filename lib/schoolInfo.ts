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
            name: school.name,
            address: school.address || '',
            phone: school.phone || '',
            email: school.email || '',
            logo: school.logo || ''
        };
    } catch (error) {
        return null;
    }
}