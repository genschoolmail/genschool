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

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

/**
 * Save a file to Google Drive (organized by school) or local storage as fallback.
 *
 * @param file        - The file to save
 * @param folder      - Content-type path like "students", "teachers/profiles", "website/hero"
 * @param schoolId    - Optional school ID for multi-tenant organization.
 *                      If provided, files go to: ROOT / {schoolId} / {folder}
 *                      If omitted, files go to: ROOT / _platform / {folder}
 */
export async function saveFile(file: File, folder: string = 'uploads', schoolId?: string): Promise<string> {
    logDebug(`Starting saveFile for: ${file.name}, Folder: ${folder}, SchoolId: ${schoolId || 'platform'}`);

    // 1. Try Google Drive Upload
    const hasSA = process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const hasOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN;

    if ((hasSA || hasOAuth) && ROOT_FOLDER_ID) {
        try {
            logDebug('Attempting Google Drive upload...');
            const { uploadToDrive, resolveFolderPath, makeFilePublic } = await import('./drive');

            // Build the organized path: ROOT / {schoolOrPlatform} / {contentFolder}
            const orgPrefix = schoolId || '_platform';
            const fullPath = `${orgPrefix}/${folder}`;
            logDebug(`Resolving Drive folder path: ${fullPath}`);

            const targetFolderId = await resolveFolderPath(ROOT_FOLDER_ID, fullPath);
            logDebug(`Target folder resolved: ${targetFolderId}`);

            const driveFile = await uploadToDrive(file, targetFolderId);

            if (driveFile && driveFile.id) {
                // Make the file publicly readable so <img> tags work anywhere
                await makeFilePublic(driveFile.id);

                // Use direct Drive thumbnail URL — works without any proxy/auth
                const publicUrl = `https://drive.google.com/thumbnail?id=${driveFile.id}&sz=w1200`;
                logDebug(`Google Drive Success! URL: ${publicUrl} (Path: ${fullPath})`);
                return publicUrl;
            }
        } catch (error: any) {
            logDebug(`Google Drive Failed: ${error.message}. Falling back to local storage.`);
            console.error('Google Drive Upload Failed:', error);
        }
    }

    // 2. Fallback to Local Storage (development only — will NOT work on Vercel)
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension = extname(file.name);
        const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${sanitizedOriginalName}`;

        const isWindows = process.platform === 'win32' || join(' ', ' ').includes('\\');
        const normalizedFolder = folder.replace(/\//g, isWindows ? '\\' : '/');

        const uploadDir = join(process.cwd(), 'public', 'uploads', normalizedFolder);
        logDebug(`Saving to physical path: ${uploadDir}`);

        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
            logDebug(`Created directory: ${uploadDir}`);
        }

        const filePath = join(uploadDir, filename);
        await writeFile(filePath, buffer);
        logDebug(`File written to disk: ${filePath}`);

        const publicUrl = `/uploads/${folder.replace(/\\/g, '/')}/${filename}`;
        logDebug(`Success! Public URL: ${publicUrl}`);
        return publicUrl;
    } catch (error: any) {
        logDebug(`ERROR in saveFile: ${error.message}`);
        console.error('Error saving file:', error);
        throw error;
    }
}