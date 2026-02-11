
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Manual .env parsing
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=["']?([^"'\r\n]+)["']?$/);
    if (match) {
        process.env[match[1]] = match[2];
    }
});

// Initialize Google Drive Client
const getDriveClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        throw new Error('Missing Google Drive OAuth credentials in .env');
    }

    const auth = new google.auth.OAuth2(clientId, clientSecret);
    auth.setCredentials({ refresh_token: refreshToken });

    return google.drive({ version: 'v3', auth });
};

async function uploadToDrive(filePath, fileName, mimeType, folderId) {
    try {
        const drive = getDriveClient();
        const fileMetadata = {
            name: fileName,
            parents: folderId ? [folderId] : undefined,
            mimeType: mimeType,
        };
        const media = {
            mimeType: mimeType,
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: 'id, webContentLink, webViewLink',
            supportsAllDrives: true,
        });

        return response.data;
    } catch (error) {
        console.error(`Failed to upload ${fileName}:`, error.message);
        throw error;
    }
}

async function main() {
    try {
        const publicDir = path.join(process.cwd(), 'public', 'images');
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // Optional

        const assets = [
            { name: 'gsm-logo.png', path: path.join(publicDir, 'gsm-logo.png'), mimeType: 'image/png' },
            { name: 'dashboard-preview.png', path: path.join(publicDir, 'dashboard-preview.png'), mimeType: 'image/png' }
        ];

        console.log("Starting upload...");

        for (const asset of assets) {
            if (fs.existsSync(asset.path)) {
                console.log(`Uploading ${asset.name}...`);
                const result = await uploadToDrive(asset.path, asset.name, asset.mimeType, folderId);
                console.log(`SUCCESS: ${asset.name}`);
                console.log(`  ID: ${result.id}`);
                console.log(`  View: ${result.webViewLink}`);
                console.log('-----------------------------------');
            } else {
                console.error(`File not found: ${asset.path}`);
            }
        }
    } catch (error) {
        console.error('Script failed:', error);
    }
}

main();
