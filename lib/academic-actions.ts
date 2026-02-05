'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getAcademicYears() {
    return await prisma.academicYear.findMany({
        orderBy: { startDate: 'desc' }
    });
}

export async function getCurrentAcademicYear() {
    return await prisma.academicYear.findFirst({
        where: { isCurrent: true }
    });
}

export async function createAcademicYear(data: { name: string; startDate: Date; endDate: Date }) {
    try {
        await prisma.academicYear.create({
            data: {
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                status: 'DRAFT'
            }
        });
        revalidatePath('/admin/settings/academic-years');
        return { success: true };
    } catch (error) {
        console.error("Create Academic Year Error:", error);
        return { success: false, error: 'Failed to create academic year' };
    }
}

export async function setAcademicYearAsCurrent(id: string) {
    try {
        await prisma.$transaction([
            // Unset current
            prisma.academicYear.updateMany({
                where: { isCurrent: true },
                data: { isCurrent: false }
            }),
            // Set new current
            prisma.academicYear.update({
                where: { id },
                data: { isCurrent: true, isActive: true, status: 'ACTIVE' }
            }),
            // Update School Settings text
            prisma.schoolSettings.updateMany({
                data: { currentAcademicYear: (await prisma.academicYear.findUnique({ where: { id }, select: { name: true } }))?.name }
            })
        ]);
        revalidatePath('/admin/settings/academic-years');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to switch academic year' };
    }
}
