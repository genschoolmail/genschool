
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';

export async function GET() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

    const status = {
        step: 'Initializing',
        error: null as string | null,
        details: null as any
    };

    try {
        if (!clientId || !clientSecret || !refreshToken || !folderId) {
            throw new Error('Missing OAuth Credentials');
        }

        status.step = 'Authenticating';

        const auth = new google.auth.OAuth2(clientId, clientSecret);
        auth.setCredentials({ refresh_token: refreshToken });

        const drive = google.drive({ version: 'v3', auth });

        // 1. Try to CREATE a file (Using User's Quota)
        status.step = 'Uploading Test File';

        const fileMetadata = {
            name: `oauth_test_${Date.now()}.txt`,
            parents: [folderId],
        };

        const media = {
            mimeType: 'text/plain',
            body: Readable.from(['Success! OAuth upload working. ' + Date.now()]),
        };

        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webContentLink',
            supportsAllDrives: true,
        });

        return NextResponse.json({
            success: true,
            message: 'Write permission confirmed with OAuth 2.0!',
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
