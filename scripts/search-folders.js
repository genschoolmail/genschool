
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

async function searchFolders(name) {
    const drive = await getDriveClient();
    const res = await drive.files.list({
        q: `name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id, name, parents, createdTime)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: true,
    });

    console.log(`Found ${res.data.files.length} folders named "${name}":`);
    for (const file of res.data.files) {
        console.log(`- ID: ${file.id}, Created: ${file.createdTime}, Parents: ${file.parents?.join(', ')}`);
        // If it has parents, list parent name
        if (file.parents) {
            for (const pid of file.parents) {
                try {
                    const p = await drive.files.get({ fileId: pid, fields: 'name', supportsAllDrives: true });
                    console.log(`  Child of: ${p.data.name} (${pid})`);
                } catch (e) { }
            }
        }
    }
}

searchFolders('successmission').catch(console.error);
