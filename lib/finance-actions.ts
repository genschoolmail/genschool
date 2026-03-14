'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function getFinancialSummary() {
    try {
        const schoolId = await getTenantId();

        // Get all income from Income table (Source of Truth for Ledger & Dashboard)
        const incomeStats = await prisma.income.groupBy({
            where: { schoolId },
            by: ['source'],
            _sum: { amount: true }
        });

        const feeCollectedAmount = incomeStats
            .filter(i => i.source === 'FEE_PAYMENT' || i.source === 'FEE')
            .reduce((sum, i) => sum + (i._sum.amount || 0), 0);

        const otherIncomeAmount = incomeStats
            .filter(i => i.source !== 'FEE_PAYMENT' && i.source !== 'FEE')
            .reduce((sum, i) => sum + (i._sum.amount || 0), 0);

        // Get salaries paid
        const salariesPaid = await prisma.salary.aggregate({
            where: {
                schoolId,
                status: 'PAID'
            },
            _sum: { netSalary: true }
        }).catch(() => ({ _sum: { netSalary: 0 } }));

        // Get other expenses from Expense table
        const otherExpensesData = await prisma.expense.aggregate({
            where: {
                schoolId,
                status: 'APPROVED'
            },
            _sum: { amount: true }
        }).catch(() => ({ _sum: { amount: 0 } }));

        const salariesPaidAmount = (salariesPaid._sum?.netSalary) || 0;
        const otherExpensesAmount = (otherExpensesData._sum?.amount) || 0;

        return {
            feeCollected: feeCollectedAmount,
            otherIncome: otherIncomeAmount,
            totalIncome: feeCollectedAmount + otherIncomeAmount,
            salariesPaid: salariesPaidAmount,
            otherExpenses: otherExpensesAmount,
            totalExpenses: salariesPaidAmount + otherExpensesAmount
        };
    } catch (error) {
        console.error('Get financial summary error:', error);
        return {
            feeCollected: 0,
            otherIncome: 0,
            totalIncome: 0,
            salariesPaid: 0,
            otherExpenses: 0,
            totalExpenses: 0
        };
    }
}

export async function createFeeStructure(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        await prisma.feeStructure.create({
            data: {
                schoolId,
                name: formData.get('name') as string,
                amount: parseFloat(formData.get('amount') as string),
                frequency: formData.get('frequency') as string,
                classId: formData.get('classId') as string || null,
                feeHeadId: formData.get('feeHeadId') as string || 'default'
            }
        }).catch(() => null);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getStudentFees(studentId?: string) {
    try {
        const schoolId = await getTenantId();

        const where: any = { schoolId };
        if (studentId) {
            where.studentId = studentId;
        }

        return await prisma.feePayment.findMany({
            where,
            include: {
                studentFee: {
                    include: {
                        student: {
                            include: {
                                user: true,
                                class: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

// Salary Management
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
                paymentMethod: formData.get('paymentMethod') as string || 'OFFLINE',
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
            data: { status: 'PAID', paidDate: new Date() }
        }).catch(() => null);

        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Expense Management
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

// Income Management
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

/**
 * Syncs paid FeePayment records to the Income table if they are missing.
 * Prevents duplicates by using unique feePaymentId.
 */
export async function backfillIncomeFromPayments() {
    try {
        const schoolId = await getTenantId();
        
        // 1. Find all paid fee payments
        const paidPayments = await prisma.feePayment.findMany({
            where: {
                schoolId,
                status: 'PAID',
                income: { is: null } // Only those NOT already in income
            },
            include: {
                studentFee: {
                    include: {
                        student: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        if (paidPayments.length === 0) return { success: true, count: 0 };

        let createdCount = 0;

        // 2. Create income records for each
        for (const payment of paidPayments) {
            try {
                const studentName = payment.studentFee?.student?.user?.name || 'Student';
                const description = payment.method === 'ONLINE' 
                    ? `Online fee payment - ${payment.reference || payment.id}`
                    : `Offline fee payment (${payment.method}) - ${studentName}`;

                await prisma.income.create({
                    data: {
                        schoolId,
                        source: 'FEE_PAYMENT',
                        amount: payment.amount,
                        description: description,
                        date: payment.date || new Date(),
                        reference: payment.reference || payment.receiptNo,
                        feePaymentId: payment.id,
                    }
                });
                createdCount++;
            } catch (err) {
                console.error(`Failed to backfill payment ${payment.id}:`, err);
            }
        }

        return { success: true, count: createdCount };
    } catch (error) {
        console.error('backfillIncomeFromPayments error:', error);
        return { success: false, error: 'Failed to backfill income data' };
    }
}