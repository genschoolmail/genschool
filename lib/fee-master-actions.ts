'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTenantId } from '@/lib/tenant';

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

export async function assignFeeToStudent(studentId: string, feeStructureId: string) {
    try {
        const schoolId = await getTenantId();

        await prisma.feePayment.create({
            data: {
                schoolId,
                studentId,
                feeStructureId,
                amount: 0, // Will be updated from fee structure
                status: 'PENDING',
                dueDate: new Date()
            }
        }).catch(() => null);

        revalidatePath('/admin/finance/fees/assign');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function assignFeesToClass(classId: string, feeStructureId: string) {
    try {
        const schoolId = await getTenantId();

        // Get all students in class
        const students = await prisma.student.findMany({
            where: { schoolId, classId }
        });

        // Assign fee to each student
        for (const student of students) {
            await assignFeeToStudent(student.id, feeStructureId);
        }

        revalidatePath('/admin/finance/fees/assign');
        return { success: true, count: students.length };
    } catch (error: any) {
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
            orderBy: { createdAt: 'desc' }
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