const { google } = require('googleapis');
const path = require('path');
require('dotenv').config();

const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID?.trim();
const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
const key = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!email || !key || !ROOT_FOLDER_ID) {
    console.error('Missing Drive credentials in .env');
    process.exit(1);
}

const auth = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

async function listFolder(folderId, indent = '') {
    try {
        const res = await drive.files.list({
            q: `'${folderId}' in parents and trashed = false`,
            fields: 'files(id, name, mimeType)',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        for (const file of res.data.files) {
            console.log(`${indent}${file.name} (${file.mimeType}) [${file.id}]`);
            if (file.mimeType === 'application/vnd.google-apps.folder') {
                await listFolder(file.id, indent + '  ');
            }
        }
    } catch (error) {
        console.error(`Error listing folder ${folderId}:`, error.message);
    }
}

console.log(`--- Inspecting Drive Root: ${ROOT_FOLDER_ID} ---`);
listFolder(ROOT_FOLDER_ID);
