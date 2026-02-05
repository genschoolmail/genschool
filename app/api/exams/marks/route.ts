import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();
    if (!session || !(session.user as any).schoolId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const schoolId = (session.user as any).schoolId;
    const { searchParams } = new URL(request.url);
    const examGroupId = searchParams.get('examGroupId');
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');

    if (!examGroupId || !classId || !subjectId) {
        return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    try {
        // 1. Get Exam Schedule to find Max Marks
        const schedule = await prisma.examSchedule.findUnique({
            where: {
                schoolId_examGroupId_classId_subjectId: {
                    schoolId,
                    examGroupId,
                    classId,
                    subjectId
                }
            }
        });

        if (!schedule) {
            return NextResponse.json({ success: false, error: 'Exam not scheduled' });
        }

        // 2. Get Students in Class
        const students = await prisma.student.findMany({
            where: { classId },
            include: { user: true },
            orderBy: { rollNo: 'asc' }
        });

        // 3. Get Existing Results
        const results = await prisma.examResult.findMany({
            where: { examScheduleId: schedule.id }
        });

        return NextResponse.json({
            success: true,
            students,
            examScheduleId: schedule.id,
            maxMarks: schedule.maxMarks,
            results
        });

    } catch (error) {
        console.error('Error marks data:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
