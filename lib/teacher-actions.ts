'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getTenantId } from "@/lib/tenant";
import { saveFile } from "@/lib/upload";
import bcrypt from "bcryptjs";

export async function getTeachers() {
    try {
        const schoolId = await getTenantId();
        return await prisma.teacher.findMany({
            where: { schoolId },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        image: true,
                    }
                }
            },
            orderBy: {
                user: {
                    name: 'asc'
                }
            }
        });
    } catch (error) {
        console.error("[GET_TEACHERS]", error);
        return [];
    }
}

export async function createTeacher(formData: FormData) {
    try {
        const schoolId = await getTenantId();

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const designation = formData.get('designation') as string;
        const subject = formData.get('subject') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;
        const profileImage = formData.get('image') as File;
        const documents = formData.getAll('documents') as File[];

        // 1. Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { email }
        });

        if (existingUser) {
            return { error: "A user with this email already exists." };
        }

        // 2. Generate Employee ID (Prefix: TCH + Year + Random)
        const year = new Date().getFullYear();
        const count = await prisma.teacher.count({ where: { schoolId } });
        const employeeId = `TCH-${year}-${(count + 1).toString().padStart(4, '0')}`;

        // 3. Handle Profile Image Upload
        let imageUrl = null;
        if (profileImage && profileImage.size > 0) {
            imageUrl = await saveFile(profileImage, 'teachers', schoolId);
        }

        // 4. Create User
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                schoolId,
                name,
                email,
                phone,
                password: hashedPassword,
                role: 'TEACHER',
                image: imageUrl,
            }
        });

        // 5. Create Teacher Profile
        const teacher = await prisma.teacher.create({
            data: {
                schoolId,
                userId: user.id,
                employeeId,
                designation,
                subject,
                phone,
                address,
            }
        });

        // 6. Handle Document Uploads
        if (documents && documents.length > 0) {
            for (const doc of documents) {
                if (doc.size > 0) {
                    const docUrl = await saveFile(doc, 'teachers/documents', schoolId);
                    await prisma.teacherDocument.create({
                        data: {
                            schoolId,
                            teacherId: teacher.id,
                            fileName: doc.name,
                            filePath: docUrl,
                            fileType: doc.type || 'application/octet-stream',
                            fileSize: doc.size
                        }
                    });
                }
            }
        }

        revalidatePath('/admin/teachers');
        return { success: true };

    } catch (error: any) {
        console.error("[CREATE_TEACHER]", error);
        return { error: error.message || "Failed to create teacher account." };
    }
}

export async function updateTeacher(id: string, formData: FormData) {
    try {
        const schoolId = await getTenantId();

        const name = formData.get('name') as string;
        const designation = formData.get('designation') as string;
        const subject = formData.get('subject') as string;
        const phone = formData.get('phone') as string;
        const address = formData.get('address') as string;
        const profileImage = formData.get('image') as File;

        const teacher = await prisma.teacher.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!teacher || teacher.schoolId !== schoolId) {
            return { error: "Teacher not found" };
        }

        // Update User
        const { extractFileIdFromUrl, deleteFileFromDrive } = await import('@/lib/drive');
        let imageUrl = teacher.user.image;
        if (profileImage && profileImage.size > 0) {
            // Cleanup old image
            const oldFileId = extractFileIdFromUrl(imageUrl);
            if (oldFileId) await deleteFileFromDrive(oldFileId);

            imageUrl = await saveFile(profileImage, 'teachers', schoolId);
        }

        await prisma.user.update({
            where: { id: teacher.userId },
            data: {
                name,
                phone,
                image: imageUrl
            }
        });

        // Update Teacher
        await prisma.teacher.update({
            where: { id },
            data: {
                designation,
                subject,
                phone,
                address
            }
        });

        revalidatePath('/admin/teachers');
        revalidatePath(`/admin/teachers/${id}`);
        return { success: true };

    } catch (error: any) {
        console.error("[UPDATE_TEACHER]", error);
        return { error: error.message || "Failed to update teacher profile." };
    }
}

export async function deleteTeacher(id: string) {
    try {
        const schoolId = await getTenantId();
        const teacher = await prisma.teacher.findUnique({
            where: { id }
        });

        if (!teacher || teacher.schoolId !== schoolId) {
            return { error: "Teacher not found" };
        }

        // Delete User (Teacher record will be deleted via Cascade onDelete defined in schema)
        await prisma.user.delete({
            where: { id: teacher.userId }
        });

        revalidatePath('/admin/teachers');
        return { success: true };
    } catch (error: any) {
        console.error("[DELETE_TEACHER]", error);
        return { error: "Failed to delete teacher." };
    }
}

export async function updateTeacherBasicInfo(formData: FormData) {
    const id = formData.get('id') as string;
    return await updateTeacher(id, formData);
}

export async function deleteTeacherDocument(documentId: string) {
    try {
        const schoolId = await getTenantId();
        await prisma.teacherDocument.deleteMany({
            where: { id: documentId, schoolId }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}