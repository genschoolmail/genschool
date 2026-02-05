'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { ensureTenantId } from './tenant';

export async function getTeacherClasses(userId: string) {
    const schoolId = await ensureTenantId();
    const teacher = await prisma.teacher.findFirst({
        where: { userId, schoolId },
        include: {
            classes: true,
            classTeachers: {
                include: {
                    class: true
                }
            }
        }
    });

    if (!teacher) return [];

    const classMap = new Map();
    teacher.classes.forEach(c => classMap.set(c.id, c));
    teacher.classTeachers.forEach(ct => classMap.set(ct.class.id, ct.class));

    return Array.from(classMap.values());
}

export async function getClassAttendance(classId: string, date: Date) {
    const schoolId = await ensureTenantId();
    // Normalize date to start of day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const students = await prisma.student.findMany({
        where: { classId, schoolId },
        include: {
            user: {
                select: { name: true, image: true }
            },
            attendances: {
                where: {
                    date: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    schoolId
                }
            }
        },
        orderBy: { rollNo: 'asc' }
    });

    return students.map(student => ({
        id: student.id,
        name: student.user.name,
        rollNo: student.rollNo,
        image: student.user.image,
        status: student.attendances[0]?.status || 'PRESENT' // Default to PRESENT
    }));
}

export async function saveAttendance(classId: string, date: Date, attendanceData: { studentId: string, status: string }[]) {
    try {
        const schoolId = await ensureTenantId();
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        // Use transaction to ensure consistency
        await prisma.$transaction(
            attendanceData.map(({ studentId, status }) => {
                return prisma.attendance.upsert({
                    where: {
                        date_studentId_schoolId: {
                            date: startOfDay,
                            studentId,
                            schoolId
                        }
                    } as any,
                    update: { status },
                    create: {
                        date: startOfDay,
                        status,
                        studentId,
                        schoolId
                    }
                });
            })
        );

        revalidatePath('/teacher/attendance');
        return { success: true };
    } catch (error) {
        console.error('Error saving attendance:', error);
        return { error: 'Failed to save attendance' };
    }
}
