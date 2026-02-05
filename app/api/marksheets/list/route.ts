import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { examGroupId, classId } = await request.json();

        if (!examGroupId) {
            return NextResponse.json({ error: 'Exam Group ID required' }, { status: 400 });
        }

        const whereClause: any = {
            examResults: {
                some: {
                    examSchedule: {
                        examGroupId
                    }
                }
            }
        };

        if (classId) {
            whereClause.classId = classId;
        }

        const students = await prisma.student.findMany({
            where: whereClause,
            select: {
                id: true,
                user: {
                    select: {
                        name: true
                    }
                },
                rollNo: true
            },
            orderBy: {
                rollNo: 'asc'
            }
        });

        const formattedStudents = students.map(s => ({
            id: s.id,
            name: s.user?.name || 'Unknown',
            rollNo: s.rollNo
        }));

        return NextResponse.json(formattedStudents);
    } catch (error) {
        console.error('Marksheets list error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch students' },
            { status: 500 }
        );
    }
}
