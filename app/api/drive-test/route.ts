import { NextResponse } from 'next/server';

/**
 * Diagnostic endpoint — call GET /api/drive-test to verify Google Drive credentials and folder access.
 * Remove this file after credentials are confirmed working.
 */
export async function GET() {
    const results: Record<string, any> = {};

    // 1. Check env vars
    const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
    const clientEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL?.trim();
    const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

    results.env = {
        GOOGLE_DRIVE_FOLDER_ID: ROOT_FOLDER_ID ? `✅ Set (${ROOT_FOLDER_ID})` : '❌ MISSING',
        GOOGLE_DRIVE_CLIENT_EMAIL: clientEmail ? `✅ Set (${clientEmail})` : '❌ MISSING',
        GOOGLE_DRIVE_PRIVATE_KEY: privateKey
            ? (privateKey.includes('BEGIN RSA PRIVATE KEY') || privateKey.includes('BEGIN PRIVATE KEY')
                ? '✅ Valid PEM format'
                : '⚠️ Set but may be malformed — must be a PEM key')
            : '❌ MISSING',
    };

    if (!ROOT_FOLDER_ID || !clientEmail || !privateKey) {
        return NextResponse.json({
            status: 'CREDENTIALS_MISSING',
            results,
        });
    }

    // 2. Try Drive connection
    try {
        const { getDriveClient } = await import('@/lib/drive');
        const drive = getDriveClient();

        // Try to get the root folder metadata
        const folderMeta = await drive.files.get({
            fileId: ROOT_FOLDER_ID,
            fields: 'id, name, mimeType',
            supportsAllDrives: true,
        });

        results.rootFolder = {
            status: '✅ Accessible',
            id: folderMeta.data.id,
            name: folderMeta.data.name,
            type: folderMeta.data.mimeType,
        };

        // 3. Try creating a test subfolder
        const testFolderRes = await drive.files.create({
            requestBody: {
                name: `__drive_test_${Date.now()}`,
                mimeType: 'application/vnd.google-apps.folder',
                parents: [ROOT_FOLDER_ID],
            },
            fields: 'id, name',
            supportsAllDrives: true,
        });

        results.writeTest = {
            status: '✅ Can create folders',
            testFolderId: testFolderRes.data.id,
        };

        // Clean up test folder
        if (testFolderRes.data.id) {
            await drive.files.delete({ fileId: testFolderRes.data.id, supportsAllDrives: true });
            results.writeTest.cleanup = '✅ Cleaned up';
        }

        return NextResponse.json({ status: 'OK', results });
    } catch (err: any) {
        results.driveError = {
            status: '❌ Drive API Error',
            message: err.message,
            code: err.code,
            detail: err.errors,
        };
        return NextResponse.json({ status: 'DRIVE_ERROR', results }, { status: 500 });
    }
}
