import { NextResponse } from 'next/server';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

export async function GET() {
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    const status = {
        env_vars: {
            email_exists: !!email,
            key_exists: !!keyRaw,
            folder_exists: !!folderId,
            key_length: keyRaw ? keyRaw.length : 0,
        },
        auth: 'Pending',
        folder_access: 'Pending',
        error: null as string | null
    };

    try {
        if (!email || !keyRaw) throw new Error('Missing Credentials');

        // Robust Key Handling
        const key = keyRaw.replace(/\\n/g, '\n').replace(/"/g, '').trim();

        const auth = new google.auth.JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        status.auth = 'Attempting...';
        await auth.authorize();
        status.auth = 'Success';

        const drive = google.drive({ version: 'v3', auth });

        if (folderId) {
            status.folder_access = `Checking Folder: ${folderId}`;
            const res = await drive.files.get({
                fileId: folderId,
                fields: 'name, trashed'
            });
            status.folder_access = `Success! Connected to Folder: "${res.data.name}"`;
        } else {
            status.folder_access = 'Skipped (No Folder ID)';
        }

        return NextResponse.json({ success: true, status });

    } catch (error: any) {
        status.error = error.message;
        return NextResponse.json({ success: false, status }, { status: 500 });
    }
}
