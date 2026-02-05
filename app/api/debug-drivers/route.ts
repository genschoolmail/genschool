import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const drivers = await prisma.user.findMany({
            where: { role: 'DRIVER' },
            select: { 
                id: true,
                email: true, 
                phone: true, 
                name: true,
                role: true,
                driverProfile: {
                    select: { id: true, userId: true }
                }
            }
        });
        return NextResponse.json(drivers);
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
