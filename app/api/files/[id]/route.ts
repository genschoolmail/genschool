import { NextRequest, NextResponse } from 'next/server';
import { getFileStream } from '@/lib/drive';
import { google } from 'googleapis';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const fileId = params.id;
        if (!fileId) {
            return new NextResponse('File ID required', { status: 400 });
        }

        // Get file metadata to determine MIME type
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!clientId || !clientSecret || !refreshToken) {
            console.error('Missing Google Drive credentials');
            return new NextResponse('Server configuration error', { status: 500 });
        }

        const auth = new google.auth.OAuth2(clientId, clientSecret);
        auth.setCredentials({ refresh_token: refreshToken });
        const drive = google.drive({ version: 'v3', auth });

        // Get file metadata
        const metadata = await drive.files.get({
            fileId: fileId,
            fields: 'mimeType, name',
            supportsAllDrives: true,
        });

        const mimeType = metadata.data.mimeType || 'application/octet-stream';

        // Get file stream from Google Drive
        const stream = await getFileStream(fileId);

        // Create a new response with the stream
        // @ts-ignore - ReadableStream type mismatch workaround
        return new NextResponse(stream, {
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: any) {
        console.error('Error serving file from Drive:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            errors: error.errors,
        });
        return new NextResponse(`File not found: ${error.message}`, { status: 404 });
    }
}
