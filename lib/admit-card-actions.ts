'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { ensureTenantId } from './tenant';

export async function generateAdmitCards(examGroupId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }
    const schoolId = await ensureTenantId();

    // Get all students enrolled in classes that have exams in this group
    const examGroup = await prisma.examGroup.findUnique({
        where: { id: examGroupId },
        include: {
            examSchedules: {
                include: {
                    class: {
                        include: {
                            students: true
                        }
                    }
                }
            }
        }
    });

    if (!examGroup) {
        throw new Error('Exam group not found');
    }

    // Get unique students
    const studentIds = new Set<string>();
    examGroup.examSchedules.forEach(schedule => {
        schedule.class.students.forEach(student => {
            studentIds.add(student.id);
        });
    });

    // Generate admit cards for each student
    const admitCards = [];
    for (const studentId of studentIds) {
        // Check if already exists
        const existing = await prisma.admitCard.findUnique({
            where: {
                schoolId_examGroupId_studentId: {
                    schoolId,
                    examGroupId,
                    studentId
                }
            }
        });

        if (!existing) {
            admitCards.push({
                schoolId,
                examGroupId,
                studentId,
                status: 'GENERATED'
            });
        }
    }

    if (admitCards.length > 0) {
        await prisma.admitCard.createMany({
            data: admitCards
        });
    }

    revalidatePath('/admin/exams');
    return { generated: admitCards.length, total: studentIds.size };
}

export async function toggleAdmitCardStatus(admitCardId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    const admitCard = await prisma.admitCard.findUnique({
        where: { id: admitCardId }
    });

    if (!admitCard) {
        throw new Error('Admit card not found');
    }

    await prisma.admitCard.update({
        where: { id: admitCardId },
        data: {
            status: admitCard.status === 'BLOCKED' ? 'GENERATED' : 'BLOCKED'
        }
    });

    revalidatePath('/admin/exams');
}

export async function markAdmitCardDownloaded(admitCardId: string) {
    const admitCard = await prisma.admitCard.findUnique({
        where: { id: admitCardId }
    });

    if (!admitCard) {
        throw new Error('Admit card not found');
    }

    await prisma.admitCard.update({
        where: { id: admitCardId },
        data: {
            downloadedAt: new Date(),
            status: 'ISSUED'
        }
    });
}

export async function deleteAdmitCard(admitCardId: string) {
    const session = await auth();
    if (session?.user?.role !== 'ADMIN') {
        throw new Error('Unauthorized');
    }

    await prisma.admitCard.delete({
        where: { id: admitCardId }
    });

    revalidatePath('/admin/exams/admit-cards');
}
