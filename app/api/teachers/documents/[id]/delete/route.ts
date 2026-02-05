import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const documentId = params.id;

    const document = await prisma.teacherDocument.findUnique({
        where: { id: documentId },
    });

    if (!document) {
        return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete file from filesystem
    const filePath = path.join(process.cwd(), 'public', document.filePath);
    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error('Error deleting file:', error);
        // Continue to delete from DB even if file delete fails (might be already gone)
    }

    // Delete from database
    await prisma.teacherDocument.delete({
        where: { id: documentId },
    });

    return NextResponse.json({ success: true });
}
