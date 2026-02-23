
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Manual .env loader
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
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


async function getDriveClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });
    return google.drive({ version: 'v3', auth });
}

async function listFiles(drive, folderId, indent = '') {
    const res = await drive.files.list({
        q: `'${folderId}' in parents and trashed = false`,
        fields: 'files(id, name, mimeType)',
        supportsAllDrives: true,
    });

    for (const file of res.data.files || []) {
        console.log(`${indent}${file.name} (${file.id}) [${file.mimeType}]`);
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            await listFiles(drive, file.id, indent + '  ');
        }
    }
}

async function run() {
    const drive = await getDriveClient();
    const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    console.log('--- Listing Root Contents ---');
    const res = await drive.files.list({
        q: `'${rootId}' in parents and name = 'successmission' and trashed = false`,
        supportsAllDrives: true,
    });

    const schoolFolder = res.data.files?.[0];
    if (schoolFolder) {
        console.log(`Found successmission folder: ${schoolFolder.id}`);
        await listFiles(drive, schoolFolder.id);
    } else {
        console.log('successmission folder not found.');
    }
}

run().catch(console.error);
