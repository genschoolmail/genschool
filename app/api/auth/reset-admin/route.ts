import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { masterKey } = await req.json();

        // 1. Validate Master Key
        // Use environment variable or fallback for development
        const VALID_KEY = process.env.ADMIN_MASTER_KEY || 'school_admin_master_2025';

        if (masterKey !== VALID_KEY) {
            return NextResponse.json({ message: 'Invalid Master Key' }, { status: 401 });
        }

        // 2. Find Admin User
        // Assuming admin is identified by email 'admin@school.com'
        // If not found, we could try to find by role 'ADMIN' but there might be multiple.
        // Let's stick to the primary admin email standard.
        const adminEmail = 'admin@school.com';

        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        const hashedPassword = await bcrypt.hash('password123', 10);
        const defaultPhone = '9999999999';

        if (existingAdmin) {
            // Update existing admin
            await prisma.user.update({
                where: { email: adminEmail },
                data: {
                    password: hashedPassword,
                    phone: defaultPhone,
                    name: 'Admin', // Reset name too
                    // Don't reset ID or other relations
                }
            });
        } else {
            // Create if miraculously missing (failsafe)
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    password: hashedPassword,
                    name: 'Admin',
                    phone: defaultPhone,
                    role: 'ADMIN'
                }
            });
        }

        return NextResponse.json({
            message: 'Admin reset successful',
            details: 'Login with: admin@school.com / password123'
        });

    } catch (error) {
        console.error('Admin reset error:', error);
        return NextResponse.json({ message: 'Failed to reset admin account' }, { status: 500 });
    }
}
