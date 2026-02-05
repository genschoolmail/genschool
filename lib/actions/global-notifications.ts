'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function getActiveAnnouncements(role: string) {
    // Placeholder logic
    try {
        const announcements = await prisma.announcement.findMany({
            where: { isPublic: true }, // Simplified
            orderBy: { date: 'desc' }
        });
        return announcements;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function createGlobalAnnouncement(data: any) {
    try {
        await prisma.announcement.create({
            data: {
                ...data,
                date: new Date(),
                isPublic: true,
                schoolId: 'default-school' // Fallback
            }
        });
        revalidatePath('/super-admin/announcements');
        return true;
    } catch (e) {
        console.error(e);
        throw e;
    }
}

export async function deleteGlobalAnnouncement(id: string) {
    try {
        await prisma.announcement.delete({ where: { id } });
        revalidatePath('/super-admin/announcements');
        return true;
    } catch (e) {
        console.error(e);
        throw e;
    }
}
