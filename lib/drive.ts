
import { google } from 'googleapis';

// Initialize Google Drive Client (OAuth 2.0)
const getDriveClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing Google Drive OAuth credentials');
    }

    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });

    return google.drive({ version: 'v3', auth });
};

// Upload File to Google Drive
export async function uploadToDrive(file: File, folderId: string) {
    try {
        const drive = getDriveClient();
        const buffer = Buffer.from(await file.arrayBuffer());

        // Create a stream from the buffer
        const { Readable } = require('stream');
        const stream = Readable.from(buffer);

        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: [folderId],
                mimeType: file.type,
            },
            media: {
                mimeType: file.type,
                body: stream,
            },
            fields: 'id, webContentLink, webViewLink',
            supportsAllDrives: true,
        });

        return response.data;
    } catch (error: any) {
        console.error('Google Drive Upload Error:', error);
        console.error('Error Details:', {
            message: error.message,
            code: error.code,
            errors: error.errors
        });
        throw new Error(`Drive Upload Failed: ${error.message || 'Unknown error'}`);
    }
}

// Get File Stream (for proxying)
export async function getFileStream(fileId: string) {
    const drive = getDriveClient();
    const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );
    return response.data;
}
