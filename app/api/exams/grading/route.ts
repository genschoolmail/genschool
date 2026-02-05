
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return new NextResponse('Unauthorized', { status: 401 });

        const gradingSystem = await prisma.gradeSystem.findMany({
            where: { schoolId: session.user.tenantId },
            orderBy: { minMarks: 'asc' }
        });

        return NextResponse.json(gradingSystem);
    } catch (error) {
        console.error('Error fetching grading system:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
