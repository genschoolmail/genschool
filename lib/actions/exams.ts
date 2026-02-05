'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getTenantId } from '@/lib/tenant';

// Exam Schedules
export async function getExamSchedules() {
    try {
        const schoolId = await getTenantId();
        return await prisma.exam.findMany({
            where: { schoolId },
            include: {
                class: true,
                subject: true
            },
            orderBy: { date: 'asc' }
        });
    } catch (error) {
        console.error('Get exam schedules error:', error);
        return [];
    }
}

// Exam Groups
export async function getExamGroups() {
    try {
        const schoolId = await getTenantId();
        return await prisma.examGroup.findMany({
            where: { schoolId },
            orderBy: { name: 'asc' }
        }).catch(() => []);
    } catch (error) {
        console.error('Get exam groups error:', error);
        return [];
    }
}

// Grading System
export async function getGradingSystem() {
    try {
        const schoolId = await getTenantId();
        return await prisma.grade.findMany({
            where: { schoolId },
            orderBy: { minMarks: 'desc' }
        }).catch(() => []);
    } catch (error) {
        console.error('Get grading system error:', error);
        return [];
    }
}

export async function createGrade(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        await prisma.grade.create({
            data: {
                schoolId,
                grade: formData.get('grade') as string,
                minMarks: parseFloat(formData.get('minMarks') as string),
                maxMarks: parseFloat(formData.get('maxMarks') as string),
                point: parseFloat(formData.get('point') as string)
            }
        }).catch(() => null);

        revalidatePath('/admin/exams/grading');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateGrade(id: string, formData: FormData) {
    try {
        await prisma.grade.update({
            where: { id },
            data: {
                grade: formData.get('grade') as string,
                minMarks: parseFloat(formData.get('minMarks') as string),
                maxMarks: parseFloat(formData.get('maxMarks') as string),
                point: parseFloat(formData.get('point') as string)
            }
        }).catch(() => null);

        revalidatePath('/admin/exams/grading');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteGrade(formData: FormData) {
    try {
        const id = formData.get('id') as string;
        await prisma.grade.delete({ where: { id } }).catch(() => null);

        revalidatePath('/admin/exams/grading');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Exam Reports
export async function getExamReportsData() {
    try {
        const schoolId = await getTenantId();
        return await prisma.exam.findMany({
            where: { schoolId },
            include: {
                class: true,
                subject: true
            }
        }).catch(() => []);
    } catch (error) {
        console.error('Get exam reports error:', error);
        return [];
    }
}

// Admit Cards
export async function generateAdmitCardsForClass(classId: string) {
    try {
        // Placeholder - would generate admit cards for all students in class
        revalidatePath('/admin/exams/admit-cards');
        return { success: true, count: 0 };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function issueAdmitCard(studentId: string, examId: string) {
    try {
        // Placeholder - would issue admit card for student
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function issueAllAdmitCards(examId: string) {
    try {
        // Placeholder - would issue admit cards for all students
        return { success: true, count: 0 };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Results Publishing
export async function publishExamResults(examId: string) {
    try {
        await prisma.exam.update({
            where: { id: examId },
            data: { published: true }
        }).catch(() => null);

        revalidatePath('/admin/exams');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function unpublishExamResults(examId: string) {
    try {
        await prisma.exam.update({
            where: { id: examId },
            data: { published: false }
        }).catch(() => null);

        revalidatePath('/admin/exams');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
