import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, phone, currentPassword, newPassword } = await req.json();

        console.log(`[UPDATE_PROFILE] Attempting update for session user: ${session.user.id}, email: ${session.user.email}`);

        // Get current user - Try ID first, then Email
        let user = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!user && session.user.email) {
            console.log(`[UPDATE_PROFILE] User not found by ID ${session.user.id}. Trying email ${session.user.email}...`);
            user = await prisma.user.findUnique({
                where: { email: session.user.email }
            });
        }

        if (!user) {
            console.error(`[UPDATE_PROFILE] User not found. Session ID: ${session.user.id}`);
            return NextResponse.json({ message: 'User not found in database. Please re-login.' }, { status: 404 });
        }

        // If changing password, verify current password
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ message: 'Current password is required to set a new password' }, { status: 400 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
            }
        }

        // Prepare update data
        const updateData: any = {
            name,
            email,
            phone
        };

        // Hash new password if provided
        if (newPassword) {
            updateData.password = await bcrypt.hash(newPassword, 10);
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData
        });

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: {
                name: updatedUser.name,
                email: updatedUser.email
            }
        });

    } catch (error: any) {
        console.error('Profile update global error:', error);
        return NextResponse.json({ message: 'Failed to update profile: ' + error.message }, { status: 500 });
    }
}
