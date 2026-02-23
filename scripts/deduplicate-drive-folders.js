
const fs = require('fs');
const { google } = require('googleapis');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Manual .env loader
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
    console.log('[Dedupe] Loading .env from', envPath);
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

async function getDriveClient(isUpload = false) {
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (isUpload || (clientId && clientSecret && refreshToken)) {
        if (clientId && clientSecret && refreshToken) {
            const auth = new google.auth.OAuth2(clientId, clientSecret);
            auth.setCredentials({ refresh_token: refreshToken });
            return google.drive({ version: 'v3', auth });
        }
    }

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
}

async function moveContent(drive, sourceFolderId, targetFolderId) {
    console.log(`[Dedupe] Moving content from ${sourceFolderId} to ${targetFolderId}`);

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
                console.log(`[Dedupe] Moving: ${file.name} (${file.id})`);

                const previousParents = file.parents ? file.parents.join(',') : '';
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

async function deduplicateRecursively(drive, parentFolderId, parentPath = '') {
    const res = await drive.files.list({
        q: `'${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name, createdTime)',
        supportsAllDrives: true,
        orderBy: 'createdTime asc'
    });

    const folders = res.data.files || [];
    const grouped = {};

    // Group by name
    for (const f of folders) {
        if (!grouped[f.name]) grouped[f.name] = [];
        grouped[f.name].push(f);
    }

    // Process each group
    for (const name in grouped) {
        const group = grouped[name];
        let primaryFolder = group[0];

        if (group.length > 1) {
            console.log(`[Dedupe] Found ${group.length} duplicates for "${parentPath}/${name}"`);
            for (let i = 1; i < group.length; i++) {
                const sourceFolder = group[i];
                console.log(`[Dedupe] Merging ${sourceFolder.id} into ${primaryFolder.id}...`);
                try {
                    await moveContent(drive, sourceFolder.id, primaryFolder.id);
                    await drive.files.delete({ fileId: sourceFolder.id, supportsAllDrives: true });
                } catch (err) {
                    console.warn(`[Dedupe] Could not delete ${sourceFolder.id}, renaming.`, err.message);
                    await drive.files.update({
                        fileId: sourceFolder.id,
                        requestBody: { name: `${name}_OLD_DUPE_${Date.now()}` },
                        supportsAllDrives: true
                    });
                }
            }
        }

        // Recurse into the primary folder
        await deduplicateRecursively(drive, primaryFolder.id, `${parentPath}/${name}`);
    }
}

async function deduplicateFolders() {
    const drive = await getDriveClient(true);
    const schools = await prisma.school.findMany();
    const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (!rootId) throw new Error('GOOGLE_DRIVE_FOLDER_ID is missing');

    for (const school of schools) {
        if (!school.subdomain) continue;
        console.log(`--- Deduplicating School: ${school.subdomain} ---`);

        const q = `'${rootId}' in parents and name = '${school.subdomain}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res = await drive.files.list({ q, supportsAllDrives: true });
        const schoolFolder = res.data.files?.[0];

        if (schoolFolder) {
            await deduplicateRecursively(drive, schoolFolder.id, school.subdomain);
        }
    }

    console.log('Deduplication Complete.');
}

deduplicateFolders().catch(console.error);
