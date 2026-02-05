'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

// --- Announcements ---

export async function createAnnouncement(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;

    await prisma.announcement.create({
        data: {
            title,
            content,
            authorId: session.user.id
        }
    });

    revalidatePath('/admin/communication');
    // return { success: true };
}

export async function deleteAnnouncement(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) { // In real app, check role
        throw new Error('Unauthorized');
    }

    const id = formData.get('id') as string;

    await prisma.announcement.delete({
        where: { id }
    });

    revalidatePath('/admin/communication');
    // return { success: true };
}

// --- Posts ---

export async function createPost(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const content = formData.get('content') as string;
    const image = formData.get('image') as File; // Handle image upload if needed
    // For now, ignoring image upload logic or mocking it if required.
    // Assuming schema has imageUrl? Yes.

    await prisma.post.create({
        data: {
            content,
            authorId: session.user.id
            // imageUrl: ... 
        }
    });

    revalidatePath('/admin/communication');
    // return { success: true };
}

export async function deletePost(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const id = formData.get('id') as string;

    await prisma.post.delete({
        where: { id }
    });

    revalidatePath('/admin/communication');
    // return { success: true };
}

// --- Comments ---

export async function createComment(formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error('Unauthorized');
    }

    const postId = formData.get('postId') as string;
    const content = formData.get('content') as string;

    await prisma.comment.create({
        data: {
            content,
            postId,
            authorId: session.user.id
        }
    });

    revalidatePath('/admin/communication');
    return { success: true };
}
