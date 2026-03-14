'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTenantId } from '@/lib/tenant';
import { auth } from '@/auth';
import { createSystemNotification } from '@/lib/notification-utils';

export async function getFeeStructures() {
    try {
        const schoolId = await getTenantId();
        return await prisma.feeStructure.findMany({
            where: { schoolId },
            include: {
                class: true,
                feeHead: true
            },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        console.error('Get fee structures error:', error);
        return [];
    }
}

export async function deleteFeeStructure(id: string) {
    try {
        await prisma.feeStructure.delete({
            where: { id }
        }).catch(() => null);

        revalidatePath('/admin/finance/fees');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignFeeToStudent({
    studentId,
    feeStructureIds,
    dueDate,
    feeMonth,
    feeYear,
    academicYearId
}: {
    studentId: string;
    feeStructureIds: string[];
    dueDate: Date;
    feeMonth: number;
    feeYear: number;
    academicYearId: string;
}) {
    try {
        const schoolId = await getTenantId();
        let assigned = 0;
        let skipped = 0;

        for (const fsId of feeStructureIds) {
            const structure = await prisma.feeStructure.findUnique({
                where: { id: fsId }
            });

            // Need student's userId to send notification
            const student = await prisma.student.findUnique({
                where: { id: studentId },
                select: { userId: true }
            });

            if (!structure) continue;

            // Check if already assigned for this month/year
            const existing = await prisma.studentFee.findFirst({
                where: {
                    schoolId,
                    studentId,
                    feeStructureId: fsId,
                    feeMonth,
                    feeYear
                }
            });

            if (existing) {
                skipped++;
                continue;
            }

            await prisma.studentFee.create({
                data: {
                    schoolId,
                    studentId,
                    feeStructureId: fsId,
                    amount: structure.amount,
                    dueDate,
                    feeMonth,
                    feeYear,
                    academicYearId,
                    status: 'PENDING'
                }
            });
            assigned++;

            // Notify Student
            if (student?.userId) {
                const monthName = new Date(feeYear, feeMonth - 1).toLocaleString('default', { month: 'long' });
                await createSystemNotification(
                    student.userId,
                    'New Fee Assigned',
                    `A new fee of ₹${structure.amount} (${structure.name}) has been assigned for ${monthName} ${feeYear}. Due date: ${dueDate.toLocaleDateString()}.`,
                    'WARNING',
                    '/student/finance/payments'
                );
            }
        }

        revalidatePath('/admin/finance/fees/assign');
        return { success: true, count: assigned, skipped };
    } catch (error: any) {
        console.error('Assign fee error:', error);
        return { success: false, error: error.message };
    }
}

export async function assignFeesToClass({
    classId,
    feeStructureIds,
    dueDate,
    feeMonth,
    feeYear,
    academicYearId
}: {
    classId: string;
    feeStructureIds: string[];
    dueDate: Date;
    feeMonth: number;
    feeYear: number;
    academicYearId: string;
}) {
    try {
        const schoolId = await getTenantId();

        // Get all students in class
        const students = await prisma.student.findMany({
            where: { schoolId, classId }
        });

        let totalAssigned = 0;
        let totalSkipped = 0;

        // Assign fee to each student
        for (const student of students) {
            const res = await assignFeeToStudent({
                studentId: student.id,
                feeStructureIds,
                dueDate,
                feeMonth,
                feeYear,
                academicYearId
            });
            if (res.success) {
                totalAssigned += res.count || 0;
                totalSkipped += res.skipped || 0;
            }
        }

        revalidatePath('/admin/finance/fees/assign');

        const session = await auth();
        if (session?.user?.id) {
            await createSystemNotification(
                session.user.id,
                'Fees Assigned to Class',
                `Fees have been assigned to students in the selected class.`,
                'SUCCESS'
            );
        }

        return { success: true, count: totalAssigned, skipped: totalSkipped };
    } catch (error: any) {
        console.error('Assign fees to class error:', error);
        return { success: false, error: error.message };
    }
}

export async function getStudentsForAssignment() {
    try {
        const schoolId = await getTenantId();
        return await prisma.student.findMany({
            where: { schoolId },
            include: {
                user: true,
                class: true
            },
            orderBy: { id: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

export async function getClassesForDropdown() {
    try {
        const schoolId = await getTenantId();
        return await prisma.class.findMany({
            where: { schoolId },
            orderBy: [
                { name: 'asc' },
                { section: 'asc' }
            ]
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}