import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmailOTP, sendSMSOTP } from '@/lib/communication';

export async function POST(req: NextRequest) {
    try {
        const { identifier } = await req.json();

        if (!identifier) {
            return NextResponse.json({ message: 'Email or Phone is required' }, { status: 400 });
        }

        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\d{10,}$/.test(identifier.replace(/\D/g, ''));

        if (!isEmail && !isPhone) {
            return NextResponse.json({ message: 'Invalid format. Please enter a valid Email or Phone number' }, { status: 400 });
        }

        // 1. Detect Subdomain from Host
        const host = req.headers.get('host') || "";
        const hostParts = host.split(":")[0].split(".");
        const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

        const currentSubdomain = isLocalhost
            ? (hostParts.length > 2 && hostParts[0] !== 'localhost' ? hostParts[0] : null)
            : (hostParts.length > 2 && hostParts[0] !== 'www' ? hostParts[0] : null);

        // 2. Check if user exists within the current tenant context
        // If user is SUPER_ADMIN, they can recover from anywhere
        // If subdomain exists, restrict regular users to that specific school
        const user = await prisma.user.findFirst({
            where: {
                AND: [
                    isEmail ? { email: identifier } : { phone: identifier },
                    {
                        OR: [
                            { role: 'SUPER_ADMIN' },
                            currentSubdomain ? { school: { subdomain: currentSubdomain.toLowerCase() } } : {}
                        ]
                    }
                ]
            }
        });

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Save to Database
        await prisma.oneTimePassword.create({
            data: {
                identifier,
                otp,
                type: isEmail ? 'EMAIL' : 'SMS',
                expiresAt,
                status: 'PENDING'
            }
        });

        // 4. Send OTP
        let sendResult;
        if (isEmail) {
            sendResult = await sendEmailOTP(identifier, otp, user.schoolId);
        } else {
            sendResult = await sendSMSOTP(identifier, otp, user.schoolId);
        }

        // Construct a safe masked identifier
        const masked = isEmail
            ? identifier.replace(/(.{2})(.*)(@.*)/, '$1***$3')
            : identifier.slice(0, 2) + '******' + identifier.slice(-2);

        if (!sendResult.success) {
            if (sendResult.error === 'SMTP settings missing' || sendResult.error === 'SMS API settings missing') {
                return NextResponse.json({
                    success: true,
                    message: `OTP generated. Configure settings in Super Admin for real delivery.`
                });
            } else {
                // If there's a real sending error, return it
                return NextResponse.json({
                    message: `Failed to send OTP: ${sendResult.error}`
                }, { status: 500 });
            }
        }

        return NextResponse.json({
            success: true,
            message: `OTP sent to ${masked}`
        });

    } catch (error) {
        console.error('Send OTP error:', error);
        return NextResponse.json({ message: 'Failed to send OTP' }, { status: 500 });
    }
}
