'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';
import { revalidatePath } from 'next/cache';

// Fee Structures Management (using existing FeeStructure model)
export async function getAllFeeStructures() {
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
        return [];
    }
}

export async function createFeeStructureConfig(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        await prisma.feeStructure.create({
            data: {
                schoolId,
                name: formData.get('name') as string,
                amount: parseFloat(formData.get('amount') as string),
                frequency: formData.get('frequency') as string,
                dueDay: parseInt(formData.get('dueDay') as string) || 1,
                classId: formData.get('classId') as string || null,
                feeHeadId: formData.get('feeHeadId') as string,
                isActive: true
            }
        });

        revalidatePath('/admin/finance/setup');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFeeStructureConfig(id: string) {
    try {
        await prisma.feeStructure.delete({
            where: { id }
        });

        revalidatePath('/admin/finance/setup');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Fee Heads Management (using existing FeeHead model)
export async function getAllFeeHeads() {
    try {
        const schoolId = await getTenantId();
        return await prisma.feeHead.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

export async function createFeeHead(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        await prisma.feeHead.create({
            data: {
                schoolId,
                name: formData.get('name') as string,
                description: formData.get('description') as string || '',
            }
        });

        revalidatePath('/admin/finance/setup');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFeeHead(id: string) {
    try {
        await prisma.feeHead.delete({
            where: { id }
        });

        revalidatePath('/admin/finance/setup');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Fee Categories Management
export async function getAllFeeCategories() {
    try {
        const schoolId = await getTenantId();
        return await prisma.feeCategory.findMany({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        }).catch(() => []);
    } catch (error) {
        return [];
    }
}

export async function createFeeCategory(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        await prisma.feeCategory.create({
            data: {
                schoolId,
                name: formData.get('name') as string,
                description: formData.get('description') as string || '',
            }
        });

        revalidatePath('/admin/finance/setup');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFeeCategory(id: string) {
    try {
        await prisma.feeCategory.delete({
            where: { id }
        });

        revalidatePath('/admin/finance/setup');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// Get Classes for dropdown
export async function getClassesForConfig() {
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

// Fee Configuration Settings (create simple key-value settings)
export async function getFeeSettings() {
    try {
        const schoolId = await getTenantId();

        // Get settings from a generic settings table or return defaults
        // For now, return default settings
        return {
            lateFeeEnabled: false,
            lateFeePercentage: 0,
            lateFeeAmount: 0,
            lateFeeGraceDays: 0,
            discountEnabled: false,
            earlyBirdDiscountPercentage: 0,
            earlyBirdDiscountDays: 0
        };
    } catch (error) {
        return {
            lateFeeEnabled: false,
            lateFeePercentage: 0,
            lateFeeAmount: 0,
            lateFeeGraceDays: 0,
            discountEnabled: false,
            earlyBirdDiscountPercentage: 0,
            earlyBirdDiscountDays: 0
        };
    }
}

export async function updateFeeSettings(formData: FormData) {
    try {
        // For now, just return success
        // In a real app, you'd store these in a settings table
        revalidatePath('/admin/finance/setup');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
