'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function validateCredentials(identifier: string, password: string, subdomain: string | null) {
    try {
        const isEmail = identifier.includes('@');

        // Check for User
        const user = await prisma.user.findFirst({
            where: isEmail
                ? { email: identifier }
                : {
                    OR: [
                        { phone: identifier },
                        { studentProfile: { phone: identifier } },
                        { teacherProfile: { phone: identifier } }
                    ]
                },
            include: {
                school: {
                    select: { subdomain: true, status: true }
                }
            }
        });

        if (!user) {
            return { error: 'InvalidUser' };
        }

        // Subdomain Check
        if (user.role !== 'SUPER_ADMIN' && subdomain) {
            if (user.school?.subdomain !== subdomain.toLowerCase()) {
                return { error: 'TenantMismatch' };
            }
        }

        // Password Check
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
            return { error: 'InvalidPassword' };
        }

        return { success: true };
    } catch (error) {
        console.error('Credential validation error:', error);
        return { error: 'ServerError' };
    }
}
