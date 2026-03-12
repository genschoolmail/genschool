import { prisma } from '@/lib/prisma';

export async function createSystemNotification(userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO', link?: string) {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link,
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error creating system notification:', error);
        return { success: false, error };
    }
}
