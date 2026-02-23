import { NextResponse } from 'next/server';

/**
 * Direct file upload test — uploads a tiny 1KB file to Drive and reports the result.
 * GET /api/upload-test
 */
export async function GET() {
    const results: Record<string, any> = {};
    const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    try {
        const { getDriveClient, resolveFolderPath } = await import('@/lib/drive');
        const drive = getDriveClient();

        // Step 1: Resolve target folder
        results.step1 = 'Resolving folder: _test/upload-test...';
        const targetFolderId = await resolveFolderPath(ROOT_FOLDER_ID!, '_test/upload-test');
        results.step1 = `✅ Folder resolved: ${targetFolderId}`;

        // Step 2: Create a tiny test file
        results.step2 = 'Creating test file buffer...';
        const testContent = `Upload test at ${new Date().toISOString()}\nThis is a 1KB test file.`;
        const buffer = Buffer.from(testContent, 'utf-8');
        results.step2 = `✅ Buffer created: ${buffer.length} bytes`;

        // Step 3: Upload to Drive using PassThrough stream
        results.step3 = 'Uploading to Drive...';
        const { PassThrough } = require('stream');
        const stream = new PassThrough();
        stream.end(buffer);

        const createRes = await drive.files.create({
            requestBody: {
                name: `test-upload-${Date.now()}.txt`,
                parents: [targetFolderId],
                mimeType: 'text/plain',
            },
            media: {
                mimeType: 'text/plain',
                body: stream,
            },
            fields: 'id, name, size, webViewLink',
            supportsAllDrives: true,
        });

        results.step3 = {
            status: '✅ File uploaded!',
            fileId: createRes.data.id,
            fileName: createRes.data.name,
            fileSize: createRes.data.size,
            webViewLink: createRes.data.webViewLink,
        };

        // Step 4: Make it public
        results.step4 = 'Making file public...';
        await drive.permissions.create({
            fileId: createRes.data.id!,
            requestBody: { role: 'reader', type: 'anyone' },
            supportsAllDrives: true,
        });
        results.step4 = '✅ File made public';

        // Step 5: Clean up test file
        results.step5 = 'Cleaning up test file...';
        await drive.files.delete({
            fileId: createRes.data.id!,
            supportsAllDrives: true,
        });
        results.step5 = '✅ Test file deleted';

        return NextResponse.json({
            status: 'UPLOAD_WORKS',
            message: 'Drive file upload is working correctly!',
            results,
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'UPLOAD_FAILED',
            error: error.message,
            code: error.code,
            detail: JSON.stringify(error.errors || []),
            results,
        }, { status: 500 });
    }
}
