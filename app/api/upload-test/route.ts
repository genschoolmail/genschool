import { NextResponse } from 'next/server';

/**
 * Direct file upload test — uploads a tiny file to Drive using OAuth (user quota).
 * GET /api/upload-test
 * Delete this file after confirming uploads work.
 */
export async function GET() {
    const results: Record<string, any> = {};
    const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    // Step 0: Show which env vars are present
    results.envCheck = {
        GOOGLE_DRIVE_FOLDER_ID: ROOT_FOLDER_ID ? `✅ ${ROOT_FOLDER_ID}` : '❌ MISSING',
        GOOGLE_DRIVE_CLIENT_EMAIL: process.env.GOOGLE_DRIVE_CLIENT_EMAIL ? `✅ ${process.env.GOOGLE_DRIVE_CLIENT_EMAIL}` : '❌ MISSING',
        GOOGLE_DRIVE_PRIVATE_KEY: process.env.GOOGLE_DRIVE_PRIVATE_KEY ? '✅ Set' : '❌ MISSING',
        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? `✅ ${process.env.GOOGLE_CLIENT_ID?.slice(0, 20)}...` : '❌ MISSING — OAUTH WILL FAIL',
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ MISSING — OAUTH WILL FAIL',
        GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? '✅ Set' : '❌ MISSING — OAUTH WILL FAIL',
    };

    try {
        // Step 1: Get upload client (OAuth)
        results.step1 = 'Getting upload client (OAuth)...';
        const { getUploadClient, resolveFolderPath } = await import('@/lib/drive');
        const uploadDrive = getUploadClient(); // OAuth, has quota
        results.step1 = '✅ Upload client created (OAuth)';

        // Step 2: Resolve folder using Service Account (has permission to manage folders)
        results.step2 = 'Resolving folder...';
        const targetFolderId = await resolveFolderPath(ROOT_FOLDER_ID!, '_test/upload-test');
        results.step2 = `✅ Folder: ${targetFolderId}`;

        // Step 3: Upload tiny file using OAuth client
        results.step3 = 'Uploading 64-byte test file via OAuth...';
        const testContent = `Upload test at ${new Date().toISOString()}`;
        const buffer = Buffer.from(testContent, 'utf-8');

        const { PassThrough } = require('stream');
        const stream = new PassThrough();
        stream.end(buffer);

        const createRes = await uploadDrive.files.create({
            requestBody: {
                name: `test-${Date.now()}.txt`,
                parents: [targetFolderId],
                mimeType: 'text/plain',
            },
            media: { mimeType: 'text/plain', body: stream },
            fields: 'id, name, size',
            supportsAllDrives: true,
        });

        results.step3 = {
            status: '✅ File uploaded via OAuth!',
            fileId: createRes.data.id,
            fileName: createRes.data.name,
            fileSize: createRes.data.size,
        };

        // Step 4: Clean up
        await uploadDrive.files.delete({ fileId: createRes.data.id!, supportsAllDrives: true });
        results.step4 = '✅ Cleaned up';

        return NextResponse.json({ status: 'UPLOAD_WORKS ✅', results });

    } catch (error: any) {
        return NextResponse.json({
            status: 'UPLOAD_FAILED ❌',
            error: error.message,
            code: error.code,
            results,
            hint: !process.env.GOOGLE_CLIENT_ID
                ? 'GOOGLE_CLIENT_ID is missing in Vercel environment variables. Add it in Vercel Dashboard → Project → Settings → Environment Variables.'
                : 'OAuth credentials present but upload failed. Check error message above.',
        }, { status: 500 });
    }
}
