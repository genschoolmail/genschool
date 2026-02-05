import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { identifier, otp } = await req.json();

        if (!identifier || !otp) {
            return NextResponse.json({ message: 'Identifier and OTP are required' }, { status: 400 });
        }

        // Detect Subdomain
        const host = req.headers.get('host') || "";
        const hostParts = host.split(":")[0].split(".");
        const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
        const currentSubdomain = isLocalhost
            ? (hostParts.length > 1 && hostParts[0] !== 'localhost' ? hostParts[0] : null)
            : (hostParts.length > 2 ? hostParts[0] : null);

        // Check if user exists in this context
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

        // Find the latest pending OTP for this identifier
        const record = await prisma.oneTimePassword.findFirst({
            where: {
                identifier,
                status: 'PENDING',
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!record) {
            return NextResponse.json({ message: 'OTP expired or not requested' }, { status: 400 });
        }

        if (record.otp !== otp) {
            return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 });
        }

        // Mark as verified
        await prisma.oneTimePassword.update({
            where: { id: record.id },
            data: { status: 'VERIFIED' }
        });

        return NextResponse.json({ success: true, message: 'OTP verified' });

    } catch (error) {
        console.error('Verify OTP error:', error);
        return NextResponse.json({ message: 'Verification failed' }, { status: 500 });
    }
}
