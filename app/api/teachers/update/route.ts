import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { saveFile } from '@/lib/upload';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();

        const id = formData.get('id') as string;
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const designation = formData.get('designation') as string;
        const address = formData.get('address') as string;
        const subject = formData.get('subject') as string;

        const imageFile = formData.get('image') as File;
        const documents = formData.getAll('documents') as File[];

        const teacher = await prisma.teacher.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        // Handle Image Upload
        let imagePath = undefined;
        if (imageFile && imageFile.size > 0) {
            imagePath = await saveFile(imageFile, 'teachers');
        }

        // Handle User Update
        const userData: any = { name, email };
        if (imagePath) userData.image = imagePath;

        await prisma.user.update({
            where: { id: teacher.userId },
            data: userData
        });

        // Handle New Documents Upload
        if (documents && documents.length > 0) {
            for (const doc of documents) {
                if (doc && doc.size > 0) {
                    const filePath = await saveFile(doc, `teachers/${teacher.id}/documents`);
                    await prisma.teacherDocument.create({
                        data: {
                            teacherId: teacher.id,
                            fileName: doc.name,
                            fileType: doc.type,
                            filePath: filePath,
                            fileSize: doc.size
                        }
                    });
                }
            }
        }

        // Update Teacher Details
        await prisma.teacher.update({
            where: { id },
            data: {
                phone,
                designation,
                address,
                subject
            }
        });

        revalidatePath(`/admin/teachers/${id}`);
        revalidatePath(`/admin/teachers/${id}/edit`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Teacher update error:', error);
        return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
    }
}
