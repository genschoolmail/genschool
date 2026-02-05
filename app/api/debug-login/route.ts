import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const user = await prisma.user.findFirst({
            where: { role: 'DRIVER' }
        });

        if (!user) return NextResponse.json({ error: 'No driver found' });

        const isMatch = await bcrypt.compare('password123', user.password);
        return NextResponse.json({
            email: user.email,
            phone: user.phone,
            isPassword123: isMatch
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) });
    }
}
