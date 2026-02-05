import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const { identifier, otp, newPassword } = await req.json();

        // Detect Subdomain
        const host = req.headers.get('host') || "";
        const hostParts = host.split(":")[0].split(".");
        const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
        const currentSubdomain = isLocalhost
            ? (hostParts.length > 1 && hostParts[0] !== 'localhost' ? hostParts[0] : null)
            : (hostParts.length > 2 ? hostParts[0] : null);

        // 1. Find User in this context
        const user = await prisma.user.findFirst({
            where: {
                AND: [
                    { OR: [{ email: identifier }, { phone: identifier }] },
                    currentSubdomain
                        ? { school: { subdomain: currentSubdomain.toLowerCase() } }
                        : { role: 'SUPER_ADMIN' }
                ]
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found in this portal' }, { status: 404 });
        }

        // 2. Check if OTP was verified for this identifier
        const record = await prisma.oneTimePassword.findFirst({
            where: {
                identifier,
                otp,
                status: 'VERIFIED',
                updatedAt: { gt: new Date(Date.now() - 30 * 60 * 1000) } // Must have verified in last 30 mins
            }
        });

        if (!record) {
            return NextResponse.json({ message: 'Unauthorized. Please verify OTP first.' }, { status: 401 });
        }

        // 3. Update Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            }),
            prisma.oneTimePassword.update({
                where: { id: record.id },
                data: { status: 'RESET' }
            })
        ]);

        return NextResponse.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ message: 'Reset failed' }, { status: 500 });
    }
}
