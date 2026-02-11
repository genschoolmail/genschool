
import { google } from 'googleapis';

// Initialize Google Drive Client (OAuth 2.0 or JWT for Service Account)
export const getDriveClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

    // Try OAuth 2.0 first (usually has storage quota and permissions for user uploads)
    if (clientId && clientSecret && refreshToken) {
        const auth = new google.auth.OAuth2(clientId, clientSecret);
        auth.setCredentials({ refresh_token: refreshToken });
        return google.drive({ version: 'v3', auth });
    }

    // Fallback to Service Account (useful for shared drive scenarios)
    if (email && keyRaw) {
        const key = keyRaw.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        return google.drive({ version: 'v3', auth });
    }

    throw new Error('Missing Google Drive credentials');
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
