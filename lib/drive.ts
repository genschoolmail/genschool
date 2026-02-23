
import { google } from 'googleapis';

// Initialize Google Drive Client — Service Account first (never expires), OAuth fallback
export const getDriveClient = () => {
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    // Service Account (JWT) — preferred, never expires
    if (email && keyRaw) {
        const key = keyRaw.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        return google.drive({ version: 'v3', auth });
    }

    // OAuth 2.0 fallback
    if (clientId && clientSecret && refreshToken) {
        const auth = new google.auth.OAuth2(clientId, clientSecret);
        auth.setCredentials({ refresh_token: refreshToken });
        return google.drive({ version: 'v3', auth });
    }

    throw new Error('Missing Google Drive credentials');
};

// Cache for folder IDs to avoid repeated API calls
const folderCache = new Map<string, string>();

/**
 * Find or create a subfolder inside a parent folder.
 * Uses an in-memory cache to avoid redundant API calls.
 */
export async function ensureFolder(drive: any, parentId: string, folderName: string): Promise<string> {
    const cacheKey = `${parentId}/${folderName}`;
    if (folderCache.has(cacheKey)) {
        return folderCache.get(cacheKey)!;
    }

    // Search for existing folder
    const query = `'${parentId}' in parents AND name='${folderName}' AND mimeType='application/vnd.google-apps.folder' AND trashed=false`;
    const res = await drive.files.list({
        q: query,
        fields: 'files(id, name)',
        supportsAllDrives: true,
    });

    if (res.data.files && res.data.files.length > 0) {
        const folderId = res.data.files[0].id;
        folderCache.set(cacheKey, folderId);
        return folderId;
    }

    // Create the folder
    const createRes = await drive.files.create({
        requestBody: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [parentId],
        },
        fields: 'id',
        supportsAllDrives: true,
    });

    const newId = createRes.data.id;
    folderCache.set(cacheKey, newId);
    return newId;
}

/**
 * Resolve a nested folder path like "schoolId/students" into a Drive folder ID.
 * Creates any missing folders along the way.
 */
export async function resolveFolderPath(rootFolderId: string, folderPath: string): Promise<string> {
    const drive = getDriveClient();
    const parts = folderPath.split('/').filter(Boolean);
    let currentId = rootFolderId;

    for (const part of parts) {
        currentId = await ensureFolder(drive, currentId, part);
    }

    return currentId;
}

// Upload File to Google Drive (into the correct subfolder)
export async function uploadToDrive(file: File, folderId: string) {
    const drive = getDriveClient();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[Drive] uploadToDrive: ${file.name} | ${buffer.length} bytes | mimeType: ${file.type} | folder: ${folderId}`);

    if (buffer.length === 0) {
        throw new Error('File buffer is empty — no data to upload.');
    }

    const { PassThrough } = require('stream');
    const stream = new PassThrough();
    stream.end(buffer);

    try {
        const response = await drive.files.create({
            requestBody: {
                name: file.name,
                parents: [folderId],
                mimeType: file.type || 'application/octet-stream',
            },
            media: {
                mimeType: file.type || 'application/octet-stream',
                body: stream,
            },
            fields: 'id, name, webContentLink, webViewLink, size',
            supportsAllDrives: true,
        });

        console.log(`[Drive] Upload complete: id=${response.data.id} name=${response.data.name} size=${response.data.size}`);
        return response.data;
    } catch (error: any) {
        console.error('[Drive] Upload failed:', error.message);
        console.error('[Drive] Details:', JSON.stringify(error.errors || []));
        throw new Error(`Drive Upload Failed: ${error.message || 'Unknown error'}`);
    }
}

// Get File Stream (for proxying via /api/files/[id])
export async function getFileStream(fileId: string) {
    const drive = getDriveClient();
    const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );
    return response.data;
}

/**
 * Make a Drive file publicly readable so <img> tags work without auth.
 * Creates an "anyone with the link can view" permission.
 */
export async function makeFilePublic(fileId: string): Promise<void> {
    try {
        const drive = getDriveClient();
        await drive.permissions.create({
            fileId,
            requestBody: {
                role: 'reader',
                type: 'anyone',
            },
            supportsAllDrives: true,
        });
    } catch (err: any) {
        // Non-fatal: if permission already exists, ignore
        if (!err.message?.includes('already exists')) {
            console.warn(`[Drive] Could not make file public (${fileId}):`, err.message);
        }
    }
}
