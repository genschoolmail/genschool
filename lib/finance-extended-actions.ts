'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function getSalaries() {
    try {
        const schoolId = await getTenantId();
        return await prisma.salary.findMany({
            where: { schoolId },
            include: {
                teacher: {
                    include: { user: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

export async function createSalary(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        await prisma.salary.create({
            data: {
                schoolId,
                teacherId: formData.get('teacherId') as string,
                month: formData.get('month') as string,
                basicSalary: parseFloat(formData.get('basicSalary') as string),
                allowances: parseFloat(formData.get('allowances') as string) || 0,
                deductions: parseFloat(formData.get('deductions') as string) || 0,
                netSalary: parseFloat(formData.get('netSalary') as string),
                status: 'PENDING'
            }
        }).catch(() => null);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function markSalaryPaid(salaryId: string) {
    try {
        await prisma.salary.update({
            where: { id: salaryId },
            data: { status: 'PAID', paidAt: new Date() }
        }).catch(() => null);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getExpenses() {
    try {
        const schoolId = await getTenantId();
        return await prisma.expense.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

export async function createExpense(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        await prisma.expense.create({
            data: {
                schoolId,
                category: formData.get('category') as string,
                amount: parseFloat(formData.get('amount') as string),
                description: formData.get('description') as string,
                date: new Date(formData.get('date') as string),
                status: 'PENDING'
            }
        }).catch(() => null);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approveExpense(expenseId: string) {
    try {
        await prisma.expense.update({
            where: { id: expenseId },
            data: { status: 'APPROVED' }
        }).catch(() => null);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getIncome() {
    try {
        const schoolId = await getTenantId();
        return await prisma.income.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

export async function createIncome(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        await prisma.income.create({
            data: {
                schoolId,
                source: formData.get('source') as string,
                amount: parseFloat(formData.get('amount') as string),
                description: formData.get('description') as string,
                date: new Date(formData.get('date') as string)
            }
        }).catch(() => null);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
