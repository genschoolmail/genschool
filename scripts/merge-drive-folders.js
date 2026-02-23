const fs = require('fs');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Manual .env loader
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log('[Merge] Loading .env from', envPath);
    const env = fs.readFileSync(envPath, 'utf8');
    env.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
            const key = match[1];
            let value = (match[2] || '').trim();
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            process.env[key] = value.replace(/\\n/g, '\n');
        }
    });
}

const prisma = new PrismaClient();

async function getDriveClient() {
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (email && keyRaw) {
        const key = keyRaw.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        return google.drive({ version: 'v3', auth });
    }

    if (clientId && clientSecret && refreshToken) {
        const auth = new google.auth.OAuth2(clientId, clientSecret);
        auth.setCredentials({ refresh_token: refreshToken });
        return google.drive({ version: 'v3', auth });
    }

    throw new Error('Missing Google Drive credentials');
}

async function moveContent(drive, sourceFolderId, targetFolderId) {
    console.log(`[Merge] Moving content from ${sourceFolderId} to ${targetFolderId}`);

    let pageToken = null;
    do {
        const res = await drive.files.list({
            q: `'${sourceFolderId}' in parents and trashed = false`,
            fields: 'nextPageToken, files(id, name, parents)',
            pageToken: pageToken,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        const files = res.data.files;
        if (files && files.length > 0) {
            for (const file of files) {
                console.log(`[Merge] Moving file: ${file.name} (${file.id})`);

                // If it's a folder, we might want to merge recursively or just move it.
                // Simple approach: just move it by updating parents.
                const previousParents = file.parents.join(',');
                await drive.files.update({
                    fileId: file.id,
                    addParents: targetFolderId,
                    removeParents: previousParents,
                    fields: 'id, parents',
                    supportsAllDrives: true,
                });
            }
        }
        pageToken = res.data.nextPageToken;
    } while (pageToken);
}

async function mergeFolders() {
    const drive = await getDriveClient();
    const schools = await prisma.school.findMany();
    const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!rootId) throw new Error('GOOGLE_DRIVE_FOLDER_ID is missing');

    for (const school of schools) {
        if (!school.subdomain) continue;

        console.log(`--- Processing School: ${school.name} (Subdomain: ${school.subdomain}, ID: ${school.id}) ---`);

        // 1. Find the UUID folder
        const qId = `'${rootId}' in parents and name = '${school.id}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const resId = await drive.files.list({ q: qId, supportsAllDrives: true });
        const uuidFolder = resId.data.files && resId.data.files[0];

        // 2. Find or Create Subdomain folder
        const qSub = `'${rootId}' in parents and name = '${school.subdomain}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const resSub = await drive.files.list({ q: qSub, supportsAllDrives: true });
        let subFolder = resSub.data.files && resSub.data.files[0];

        if (uuidFolder) {
            console.log(`[Merge] Found UUID folder: ${uuidFolder.id}`);

            if (!subFolder) {
                console.log(`[Merge] Subdomain folder not found. Renaming UUID folder...`);
                await drive.files.update({
                    fileId: uuidFolder.id,
                    requestBody: { name: school.subdomain },
                    supportsAllDrives: true,
                });
                console.log(`[Merge] Renamed ${school.id} to ${school.subdomain}`);
            } else {
                console.log(`[Merge] Subdomain folder already exists: ${subFolder.id}. Merging...`);
                await moveContent(drive, uuidFolder.id, subFolder.id);

                // Delete the now-empty UUID folder
                console.log(`[Merge] Deleting empty UUID folder...`);
                await drive.files.delete({ fileId: uuidFolder.id, supportsAllDrives: true });
            }
        } else {
            console.log(`[Merge] No UUID folder found. skipping.`);
        }
    }

    console.log('Migration Complete.');
}

mergeFolders().catch(console.error);
