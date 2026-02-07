
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET() {
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    const status = {
        step: 'Initializing',
        error: null as string | null,
        details: null as any
    };

    try {
        if (!email || !keyRaw || !folderId) throw new Error('Missing Credentials');

        // Robust Key Handling
        const key = keyRaw.replace(/\\n/g, '\n').replace(/^"|"$/g, '').trim();

        const auth = new google.auth.JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });

        status.step = 'Authenticating';
        await auth.authorize();

        const drive = google.drive({ version: 'v3', auth });

        // 1. Try to CREATE a file (Write Permission Test)
        status.step = 'Uploading Test File';

        const fileMetadata = {
            name: `test_upload_${Date.now()}.txt`,
            parents: [folderId],
        };

        const media = {
            mimeType: 'text/plain',
            body: Readable.from(['Hello World! verification id: ' + Date.now()]),
        };

        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webContentLink',
            supportsAllDrives: true,
        });

        return NextResponse.json({
            success: true,
            message: 'Write permission confirmed!',
            fileId: file.data.id,
            fileName: file.data.name
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            step: status.step,
            error: error.message,
            full_error: JSON.stringify(error, Object.getOwnPropertyNames(error))
        }, { status: 500 });
    }
}
