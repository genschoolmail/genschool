import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureTenantId } from '@/lib/tenant';

export async function GET(req: Request) {
    try {
        const schoolId = await ensureTenantId();
        const { searchParams } = new URL(req.url);
        const groupId = searchParams.get('groupId');
        const classId = searchParams.get('classId');

        if (!groupId || !classId) {
            return new NextResponse('Missing parameters', { status: 400 });
        }

        const schedules = await prisma.examSchedule.findMany({
            where: {
                schoolId,
                examGroupId: groupId,
                classId: classId
            },
            include: {
                subject: true,
                _count: {
                    select: { examResults: true }
                }
            },
            orderBy: { examDate: 'asc' }
        });

        return NextResponse.json(schedules);
    } catch (error) {
        console.error('Error fetching schedules:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
