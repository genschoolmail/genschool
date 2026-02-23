import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ensureTenantId } from '@/lib/tenant';

export async function POST(req: NextRequest) {
    try {
        // 1. Authentication Check
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = (session.user as any).role;
        if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file || file.size === 0) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        console.log(`[HeroUpload] File received: ${file.name} | Size: ${file.size} bytes | Type: ${file.type}`);

        // 3. Get School Context
        let schoolId = (session.user as any).schoolId;

        if (!schoolId) {
            try {
                schoolId = await ensureTenantId();
            } catch (e) {
                return NextResponse.json({ error: 'School context missing' }, { status: 400 });
            }
        }

        // Fetch school subdomain for readable folder structure
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { subdomain: true }
        });

        const orgLabel = school?.subdomain || schoolId;
        console.log(`[HeroUpload] School: ${orgLabel} (${schoolId})`);

        // 4. Check Drive credentials before attempting
        const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
        const hasSA = process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY;
        const hasOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN;

        if (!ROOT_FOLDER_ID) {
            return NextResponse.json({ error: 'GOOGLE_DRIVE_FOLDER_ID is not configured in environment variables.' }, { status: 500 });
        }
        if (!hasSA && !hasOAuth) {
            return NextResponse.json({ error: 'Google Drive credentials (GOOGLE_DRIVE_CLIENT_EMAIL / GOOGLE_DRIVE_PRIVATE_KEY) are not configured.' }, { status: 500 });
        }

        // 5. Upload directly to Drive — NO local fallback for this endpoint
        const { uploadToDrive, resolveFolderPath, makeFilePublic, deleteFileFromDrive, extractFileIdFromUrl } = await import('@/lib/drive');

        // --- Cleanup: Delete old hero image if it exists in Drive ---
        try {
            const currentSettings = await prisma.schoolSettings.findUnique({
                where: { schoolId },
                select: { heroImage: true }
            });

            if (currentSettings?.heroImage) {
                const oldFileId = extractFileIdFromUrl(currentSettings.heroImage);
                if (oldFileId) {
                    console.log(`[HeroUpload] Cleaning up old file: ${oldFileId}`);
                    await deleteFileFromDrive(oldFileId);
                }
            }
        } catch (cleanupErr) {
            console.warn('[HeroUpload] Old file cleanup failed (non-fatal):', cleanupErr);
        }

        const fullPath = `${orgLabel}/website/hero`;
        console.log(`[HeroUpload] Uploading to Drive path: ${fullPath}`);

        const targetFolderId = await resolveFolderPath(ROOT_FOLDER_ID, fullPath);
        console.log(`[HeroUpload] Target folder ID: ${targetFolderId}`);

        const driveFile = await uploadToDrive(file, targetFolderId);

        if (!driveFile || !driveFile.id) {
            throw new Error('Drive returned no file ID after upload.');
        }

        console.log(`[HeroUpload] Drive file ID: ${driveFile.id}`);

        // Make publicly accessible
        await makeFilePublic(driveFile.id);

        const imageUrl = `/api/files/${driveFile.id}`;
        console.log(`[HeroUpload] Success! Proxy URL: ${imageUrl}`);

        // 6. Update Database
        await (prisma.schoolSettings as any).upsert({
            where: { schoolId },
            create: { schoolId, heroImage: imageUrl, schoolName: 'School' },
            update: { heroImage: imageUrl }
        });

        // Forced revalidation
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/admin/settings/website');
        revalidatePath('/public-school'); // Revalidate the shared route
        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');

        // Also revalidate for subdomains
        if (school?.subdomain) {
            revalidatePath(`/${school.subdomain}`, 'page');
        }

        return NextResponse.json({
            success: true,
            url: imageUrl,
            driveFileId: driveFile.id,
            drivePath: fullPath,
        });

    } catch (error: any) {
        console.error('[HeroUpload] CRITICAL ERROR:', error);
        // Return the actual error so the user/developer sees it
        return NextResponse.json({
            error: error.message || 'Upload failed',
            detail: error.errors ? JSON.stringify(error.errors) : undefined,
        }, { status: 500 });
    }
}
