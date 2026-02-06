import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive'];

// Initialize Google Drive Client
const getDriveClient = () => {
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;

    // Robust Key Handling:
    // 1. Handle json-escaped newlines (\n)
    // 2. Remove accidental quotes around the key
    // 3. Trim whitespace
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const key = keyRaw
        ?.replace(/\\n/g, '\n')
        ?.replace(/^"|"$/g, '')
        ?.trim();

    if (!email || !key) {
        throw new Error('Missing Google Drive credentials');
    }

    const auth = new google.auth.JWT({
        email,
        key,
        scopes: SCOPES,
    });

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
            errors: error.errors,
            stack: error.stack
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
