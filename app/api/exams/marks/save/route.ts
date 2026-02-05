import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function POST(request: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { examScheduleId, results } = body;

        if (!examScheduleId || !results || !Array.isArray(results)) {
            return NextResponse.json({ success: false, error: 'Invalid data' }, { status: 400 });
        }

        const schoolId = (session.user as any).schoolId;

        // Get grading system for auto-grading
        const grades = await prisma.gradeSystem.findMany({
            where: { schoolId },
            orderBy: { order: 'asc' }
        });

        // Process results in transaction
        await prisma.$transaction(async (tx) => {
            for (const res of results) {
                const marks = parseFloat(res.marks);

                // Calculate grade
                const grade = grades.find(g => marks >= g.minMarks && marks <= g.maxMarks);

                await tx.examResult.upsert({
                    where: {
                        schoolId_examScheduleId_studentId: {
                            schoolId,
                            examScheduleId,
                            studentId: res.studentId
                        }
                    },
                    create: {
                        schoolId,
                        examScheduleId,
                        studentId: res.studentId,
                        marksObtained: marks,
                        grade: grade?.grade || null,
                        remarks: res.remarks,
                        enteredBy: session.user.id
                    },
                    update: {
                        marksObtained: marks,
                        grade: grade?.grade || null,
                        remarks: res.remarks,
                        enteredBy: session.user.id
                    }
                });
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error saving marks:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
