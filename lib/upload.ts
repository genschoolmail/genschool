import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync } from 'fs';

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();

/**
 * Save a file to Google Drive (organized by school).
 * Falls back to local disk ONLY in development (when Drive is not configured).
 *
 * @param file      - The file to save
 * @param folder    - e.g. "students", "teachers/profiles", "website/hero"
 * @param schoolId  - School subdomain or ID for folder organization
 */
export async function saveFile(file: File, folder: string = 'uploads', schoolId?: string): Promise<string> {
    const hasSA = process.env.GOOGLE_DRIVE_CLIENT_EMAIL && process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const hasOAuth = process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN;
    const isDriveConfigured = (hasSA || hasOAuth) && ROOT_FOLDER_ID;

    console.log(`[saveFile] file="${file.name}" size=${file.size} folder="${folder}" school="${schoolId || 'platform'}" driveConfigured=${!!isDriveConfigured}`);

    // ── 1. Google Drive (primary — required on Vercel) ──────────────────────
    if (isDriveConfigured) {
        const { uploadToDrive, resolveFolderPath, makeFilePublic } = await import('./drive');

        const orgPrefix = schoolId || '_platform';
        const fullPath = `${orgPrefix}/${folder}`;
        console.log(`[saveFile] Uploading to Drive path: ${fullPath}`);

        // Let errors propagate — do NOT catch here silently
        const targetFolderId = await resolveFolderPath(ROOT_FOLDER_ID!, fullPath);
        console.log(`[saveFile] Resolved folder ID: ${targetFolderId}`);

        const driveFile = await uploadToDrive(file, targetFolderId);

        if (!driveFile?.id) {
            throw new Error('Google Drive returned no file ID after upload.');
        }

        console.log(`[saveFile] Drive upload success: id=${driveFile.id}`);

        // Make publicly readable so <img> tags work everywhere
        await makeFilePublic(driveFile.id);

        // Use internal proxy URL — works everywhere, no proxy/timeout issues
        const publicUrl = `/api/files/${driveFile.id}`;
        console.log(`[saveFile] Public Proxy URL: ${publicUrl}`);
        return publicUrl;
    }

    // ── 2. Local Storage (dev-only fallback — NOT available on Vercel) ───────
    console.warn('[saveFile] WARNING: Google Drive is not configured. Saving to local disk (will NOT persist on Vercel).');

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${Date.now()}-${sanitizedOriginalName}`;

    const isWindows = process.platform === 'win32';
    const normalizedFolder = folder.replace(/\//g, isWindows ? '\\' : '/');

    const uploadDir = join(process.cwd(), 'public', 'uploads', normalizedFolder);

    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${folder.replace(/\\/g, '/')}/${filename}`;
    console.log(`[saveFile] Local fallback URL: ${publicUrl}`);
    return publicUrl;
}