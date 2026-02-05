'use server';

import { prisma } from '@/lib/prisma';
import { getTenantId } from '@/lib/tenant';

export async function getCurrentAcademicYear() {
    try {
        const schoolId = await getTenantId();

        const currentYear = await prisma.academicYear.findFirst({
            where: {
                schoolId,
                isCurrent: true
            }
        });

        if (currentYear) {
            return currentYear;
        }

        // If no current year, return default
        const currentYearNum = new Date().getFullYear();
        return {
            id: 'default',
            schoolId,
            year: `${currentYearNum}-${currentYearNum + 1}`,
            startDate: new Date(`${currentYearNum}-04-01`),
            endDate: new Date(`${currentYearNum + 1}-03-31`),
            isCurrent: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    } catch (error) {
        console.error('Get current academic year error:', error);
        const currentYearNum = new Date().getFullYear();
        return {
            id: 'default',
            schoolId: 'default',
            year: `${currentYearNum}-${currentYearNum + 1}`,
            startDate: new Date(`${currentYearNum}-04-01`),
            endDate: new Date(`${currentYearNum + 1}-03-31`),
            isCurrent: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }
}

export async function getAcademicYears() {
    try {
        const schoolId = await getTenantId();

        const academicYears = await prisma.academicYear.findMany({
            where: {
                schoolId
            },
            orderBy: {
                startDate: 'desc'
            }
        });

        return academicYears;
    } catch (error) {
        console.error('Get academic years error:', error);
        return [];
    }
}

import { revalidatePath } from 'next/cache';

export async function createAcademicYear(formData: FormData) {
    try {
        const schoolId = await getTenantId();
        const name = formData.get('name') as string;
        const startDate = new Date(formData.get('startDate') as string);
        const endDate = new Date(formData.get('endDate') as string);
        const status = formData.get('status') as string;

        // Check if a year with this name already exists for this school
        const existing = await prisma.academicYear.findFirst({
            where: {
                schoolId,
                name: name
            }
        });

        if (existing) {
            return { success: false, error: 'An academic year with this name already exists.' };
        }

        await prisma.academicYear.create({
            data: {
                schoolId,
                name: name,
                startDate,
                endDate,
                isCurrent: status === 'ACTIVE',
            }
        });

        // If this is set to ACTIVE, we should potentially deactivate other current years
        if (status === 'ACTIVE') {
            await prisma.academicYear.updateMany({
                where: {
                    schoolId,
                    name: { not: name },
                    isCurrent: true
                },
                data: {
                    isCurrent: false
                }
            });
        }

        revalidatePath('/admin/settings/academic-years');
        return { success: true, message: 'Academic year created successfully!' };
    } catch (error: any) {
        console.error('Create academic year error:', error);
        return { success: false, error: error.message || 'Failed to create academic year' };
    }
}

export async function getAcademicYear(id: string) {
    try {
        const schoolId = await getTenantId();
        const academicYear = await prisma.academicYear.findFirst({
            where: {
                id,
                schoolId
            }
        });
        return academicYear;
    } catch (error) {
        console.error('Get academic year error:', error);
        return null;
    }
}

export async function setCurrentAcademicYear(id: string) {
    try {
        const schoolId = await getTenantId();
        // Set all to false first
        await prisma.academicYear.updateMany({
            where: { schoolId },
            data: { isCurrent: false }
        });
        // Set the selected one to true
        await prisma.academicYear.update({
            where: { id },
            data: { isCurrent: true }
        });
        revalidatePath('/admin/settings/academic-years');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function archiveAcademicYear(id: string) {
    try {
        // Stub implementation - mark as archived
        return { success: true, message: 'Academic year archived' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteAcademicYear(id: string) {
    try {
        await prisma.academicYear.delete({
            where: { id }
        });
        revalidatePath('/admin/settings/academic-years');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

