export async function updateClassCapacity(classId: string, capacity: number) {
    'use server';
    const { prisma } = await import('@/lib/prisma');
    const { getTenantId } = await import('@/lib/tenant');

    try {
        const schoolId = await getTenantId();
        await prisma.class.update({
            where: { id: classId },
            data: { capacity }
        });
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
