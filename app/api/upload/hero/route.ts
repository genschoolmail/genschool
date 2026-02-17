
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { saveFile } from '@/lib/upload';
import { prisma } from '@/lib/prisma';
import { ensureTenantId } from '@/lib/tenant';

export async function POST(req: NextRequest) {
    try {
        // 1. Authentication Check
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 3. Get School Context
        // Note: modify ensureTenantId to accept explicit schoolId from session if needed, 
        // but it primarily relies on subdomain. 
        // For API routes, headers might be different or same. 
        // Let's rely on session.schoolId as a fallback or primary check if subdomain fails.
        let schoolId = (session.user as any).schoolId;

        if (!schoolId) {
            // Fallback to subdomain check if session doesn't have it (though it should)
            try {
                schoolId = await ensureTenantId();
            } catch (e) {
                return NextResponse.json({ error: 'School context missing' }, { status: 400 });
            }
        }

        console.log(`[UploadAPI] Processing hero upload for school: ${schoolId}`);

        // 4. Save File
        const imageUrl = await saveFile(file, 'website/hero', schoolId);

        // 5. Update Database (Immediate Persistence)
        // We update the SchoolSettings directly here
        await (prisma.schoolSettings as any).upsert({
            where: { schoolId },
            create: {
                schoolId,
                heroImage: imageUrl,
                schoolName: 'School', // Default fields if creating new
            },
            update: { heroImage: imageUrl }
        });

        return NextResponse.json({ success: true, url: imageUrl });

    } catch (error: any) {
        console.error('[UploadAPI] Error:', error);
        return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
    }
}
