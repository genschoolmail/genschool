import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET: Fetch current user profile
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch profile' }, { status: 500 });
    }
}

// POST: Update profile / password
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { name, email, phone, currentPassword, newPassword } = body;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const dataToUpdate: any = { name, phone };

        // Handle email change
        if (email && email !== user.email) {
            // Check if email is already taken
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return NextResponse.json({ message: 'Email already taken' }, { status: 400 });
            }
            dataToUpdate.email = email;
        }

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ message: 'Current password required to change password' }, { status: 400 });
            }
            const passwordsMatch = await bcrypt.compare(currentPassword, user.password);
            if (!passwordsMatch) {
                return NextResponse.json({ message: 'Incorrect current password' }, { status: 400 });
            }
            dataToUpdate.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: dataToUpdate,
            select: { id: true, name: true, email: true, phone: true }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: error.message || 'Failed to update profile' }, { status: 500 });
    }
}
