import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync, appendFileSync } from 'fs';

const DEBUG_LOG = join(process.cwd(), 'public', 'uploads', 'upload_debug.log');

function logDebug(message: string) {
    try {
        const timestamp = new Date().toISOString();
        const logLine = `[${timestamp}] [Upload] ${message}\n`;
        appendFileSync(DEBUG_LOG, logLine);
    } catch (e) {
        console.error('Upload logging failed:', e);
    }
    console.log(`[CRITICAL_LOG] [Upload] ${message}`);
}

const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

export async function saveFile(file: File, folder: string = 'uploads'): Promise<string> {
    logDebug(`[Upload] Starting saveFile for: ${file.name}, Folder: ${folder}`);

    // 1. Try Google Drive Upload (If credentials exist)
    if (process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY && FOLDER_ID) {
        try {
            logDebug(`[Upload] Attempting Google Drive upload...`);
            const { uploadToDrive } = await import('./drive');
            const driveFile = await uploadToDrive(file, FOLDER_ID);

            if (driveFile && driveFile.id) {
                const publicUrl = `/api/files/${driveFile.id}`;
                logDebug(`[Upload] Google Drive Success! Public Proxy URL: ${publicUrl}`);
                return publicUrl;
            }
        } catch (error: any) {
            logDebug(`[Upload] Google Drive Failed: ${error.message}. Falling back to local storage.`);
            console.error('Google Drive Upload Failed:', error);
            // Fallback to local storage if Drive fails
        }
    }

    // 2. Fallback to Local Storage (Development / No Credentials)
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension = extname(file.name);
        // Sanitize filename for local storage
        const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${sanitizedOriginalName}`;

        // Normalize folder for Windows
        const isWindows = process.platform === 'win32' || join(' ', ' ').includes('\\');
        const normalizedFolder = folder.replace(/\//g, isWindows ? '\\' : '/');

        // Ensure the directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', normalizedFolder);
        logDebug(`[Upload] Saving to physical path: ${uploadDir}`);

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
            logDebug(`[Upload] Created directory: ${uploadDir}`);
        }

        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);
        logDebug(`[Upload] File written to disk: ${filePath}`);

        // Return the public URL - URLs MUST use forward slashes
        const publicUrl = `/uploads/${folder.replace(/\\/g, '/')}/${filename}`;
        logDebug(`[Upload] Success! Public URL: ${publicUrl}`);
        return publicUrl;
    } catch (error: any) {
        logDebug(`[Upload] ERROR in saveFile: ${error.message}`);
        console.error('Error saving file:', error);
        throw error;
    }
}