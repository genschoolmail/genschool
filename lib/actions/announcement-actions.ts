'use server'

import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function getAnnouncements({
    isPublic,
    targetRole,
    schoolId,
    classId,
    recipientId
}: {
    isPublic?: boolean;
    targetRole?: string;
    schoolId?: string;
    classId?: string;
    recipientId?: string;
} = {}) {
    try {
        const sid = schoolId || await getTenantId();

        console.log(`[getAnnouncements] Fetching for School: ${sid}, Public: ${isPublic}, Role: ${targetRole}`);

        const where: any = {
            schoolId: sid,
        };

        // Strict boolean check if provided
        if (typeof isPublic === 'boolean') {
            where.isPublic = isPublic;
        }

        if (targetRole && targetRole !== 'ALL') {
            where.targetRole = targetRole;
        }

        const announcements = await prisma.announcement.findMany({
            where,
            orderBy: {
                date: 'desc' // Using 'date' as per schema
            }
        });

        console.log(`[getAnnouncements] Found ${announcements.length} announcements`);
        return announcements;
    } catch (error) {
        console.error("[getAnnouncements] Error fetching announcements:", error);
        return [];
    }
}

export async function createAnnouncement(data: {
    title: string;
    content: string;
    isPublic: boolean;
    targetRole: string;
    classId?: string;
    recipientId?: string;
    attachmentUrl?: string;
    attachmentType?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const schoolId = await getTenantId();

        console.log("Creating announcement for school:", schoolId);

        await prisma.announcement.create({
            data: {
                schoolId,
                title: data.title,
                content: data.content,
                isPublic: data.isPublic,
                targetRole: data.targetRole,
                classId: data.classId,
                recipientId: data.recipientId,
                attachmentUrl: data.attachmentUrl,
                attachmentType: data.attachmentType,
                authorId: session.user.id,
                date: new Date()
            }
        });

        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');
        revalidatePath('/admin/notices');

        return { success: true };
    } catch (error: any) {
        console.error("Create announcement error:", error);
        return { success: false, error: error.message || "Failed to create announcement" };
    }
}

export async function deleteAnnouncement(id: string) {
    try {
        await prisma.announcement.delete({ where: { id } });
        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');
        revalidatePath('/admin/notices');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
