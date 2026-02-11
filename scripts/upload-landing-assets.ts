
import { uploadToDrive } from '@/lib/drive';
import fs from 'fs';
import path from 'path';

async function uploadAssets() {
    try {
        const publicDir = path.join(process.cwd(), 'public', 'images');

        // Define assets to upload
        const assets = [
            { name: 'gsm-logo.png', path: path.join(publicDir, 'gsm-logo.png'), mimeType: 'image/png' },
            { name: 'dashboard-preview.png', path: path.join(publicDir, 'dashboard-preview.png'), mimeType: 'image/png' }
        ];

        console.log("Starting upload to Google Drive...");

        // We need a folder ID. Usually this is in env or we can create one/use root. 
        // For now, let's assume we can upload to root or a specific folder if known.
        // Checking env for a default folder or just using root (if allow).
        // Providing a specific folder ID if you have one, otherwise it might fail if parents is required.
        // Let's try to find a folder ID from env or similar, or just assume root if not strict.
        // Actually, let's look at .env to see if there's a folder ID.
        // If not, we might need to create one.

        // Mocking env process for script execution context if needed, but tsx should handle it if .env is loaded.
        // We'll trust the lib/drive to handle auth.

        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'; // Fallback to root or specific ID

        for (const asset of assets) {
            if (fs.existsSync(asset.path)) {
                console.log(`Uploading ${asset.name}...`);

                // Create a File-like object or stream for the upload function if it expects a browser File.
                // lib/drive.ts 'uploadToDrive' expects a 'File' object (Web API). 
                // In Node.js, we need to polyfill or adapt it.
                // However, seeing lib/drive.ts: it uses `file.arrayBuffer()`. 
                // We can construct a simple object that mimics the necessary interface.

                const fileBuffer = fs.readFileSync(asset.path);
                const fileObj = {
                    name: asset.name,
                    type: asset.mimeType,
                    arrayBuffer: async () => fileBuffer.buffer
                } as unknown as File;

                const result = await uploadToDrive(fileObj, folderId);
                console.log(`Uploaded ${asset.name}:`, result);
                console.log(`File ID: ${result.id}`);
                console.log(`View Link: ${result.webViewLink}`);
                console.log(`Content Link: ${result.webContentLink}`);
                console.log('-----------------------------------');
            } else {
                console.error(`File not found: ${asset.path}`);
            }
        }
    } catch (error) {
        console.error("Upload failed:", error);
    }
}

uploadAssets();
