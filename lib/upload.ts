import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function saveFile(file: File, folder: string = 'uploads'): Promise<string> {
    try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create the unique filename
        const originalName = file.name || 'unnamed-file';
        const ext = originalName.split('.').pop() || 'bin';
        const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

        // Normalize folder for Windows (replace forward slashes with platform separator)
        const normalizedFolder = folder.replace(/\//g, join(' ', ' ').trim().includes('\\') ? '\\' : '/');

        // Ensure the directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads', normalizedFolder);
        console.log(`[Upload] Saving to: ${uploadDir}`);

        await mkdir(uploadDir, { recursive: true });

        const path = join(uploadDir, filename);
        await writeFile(path, buffer);

        // Return the public URL - URLs MUST use forward slashes
        const publicUrl = `/uploads/${folder.replace(/\\/g, '/')}/${filename}`;
        console.log(`[Upload] Success: ${publicUrl}`);

        return publicUrl;
    } catch (error) {
        console.error('[Upload] CRITICAL ERROR:', error);
        throw new Error('Failed to save file');
    }
}