import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureTenantId } from '@/lib/tenant';
import { getExamStudents } from '@/lib/marks-actions';

export async function GET(req: Request) {
    try {
        const schoolId = await ensureTenantId();
        const { searchParams } = new URL(req.url);
        const scheduleId = searchParams.get('scheduleId');

        if (!scheduleId) {
            return new NextResponse('Missing scheduleId', { status: 400 });
        }

        // Use the existing logic from marks-actions but wrap it for API
        const data = await getExamStudents(scheduleId);

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching verification data:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
