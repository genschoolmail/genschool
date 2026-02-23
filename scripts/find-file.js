
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

async function findFile(id) {
    const drive = await getDriveClient();
    try {
        const res = await drive.files.get({
            fileId: id,
            fields: 'id, name, parents, mimeType, trashed',
            supportsAllDrives: true,
        });
        console.log('File Found:', res.data);
        if (res.data.parents) {
            for (const parentId of res.data.parents) {
                const p = await drive.files.get({ fileId: parentId, fields: 'id, name', supportsAllDrives: true });
                console.log(`  Parent: ${p.data.name} (${p.data.id})`);
            }
        }
    } catch (e) {
        console.log('File not found or error:', e.message);
    }
}

const targetId = '154oNmCIve6h9bV-tejDIU29sTnN5LXBJ';
findFile(targetId).catch(console.error);
