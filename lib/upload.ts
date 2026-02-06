import { writeFile, mkdir } from 'fs/promises';
import { join, extname } from 'path';
import { existsSync, appendFileSync } from 'fs';

const DEBUG_LOG = join(process.cwd(), 'upload_debug.log');

function logDebug(message: string) {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    try {
        appendFileSync(DEBUG_LOG, logLine);
    } catch (e) {
        console.error('Failed to write to debug log:', e);
    }
    console.log(message);
}

export async function saveFile(file: File, folder: string = 'uploads'): Promise<string> {
    logDebug(`[Upload] Starting saveFile for: ${file.name}, Folder: ${folder}`);
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const extension = extname(file.name);
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${extension}`;

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