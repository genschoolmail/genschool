'use server';

import { prisma } from "@/lib/prisma";

export async function createFeeDiscount(formData: FormData) {
    try {
        // Placeholder implementation
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTeacherFinancialSummary(teacherId: string) {
    try {
        const salaries = await prisma.salary.findMany({
            where: { teacherId },
            orderBy: { month: 'desc' }
        });

        const totalEarned = salaries
            .filter(s => s.status === 'PAID')
            .reduce((sum, s) => sum + s.netSalary, 0);

        const pendingSalary = salaries
            .filter(s => s.status === 'PENDING')
            .reduce((sum, s) => sum + s.netSalary, 0);

        const now = new Date();
        const currentMonthSalary = salaries.find(s => {
            const salaryMonth = new Date(s.month);
            return salaryMonth.getMonth() === now.getMonth() &&
                salaryMonth.getFullYear() === now.getFullYear();
        }) || salaries[0]; // Fallback to most recent if current month not found

        return {
            totalEarned,
            pendingSalary,
            currentMonth: currentMonthSalary || null,
            salaryHistory: salaries.slice(0, 6)
        };
    } catch (error) {
        console.error("[GET_TEACHER_FINANCIAL_SUMMARY]", error);
        return {
            totalEarned: 0,
            pendingSalary: 0,
            currentMonth: null,
            salaryHistory: []
        };
    }
}

export async function getAccountantDashboard() {
    try {
        // Stub implementation
        return {
            totalCollection: 0,
            pendingFees: 0,
            recentTransactions: []
        };
    } catch (error) {
        return null;
    }
}

export async function getPrincipalDashboard() {
    try {
        // Stub implementation
        return {
            totalRevenue: 0,
            totalExpenses: 0,
            netBalance: 0,
            monthlyData: []
        };
    } catch (error) {
        return null;
    }
}