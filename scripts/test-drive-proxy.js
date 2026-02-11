
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Manual .env parsing
const envPath = path.join(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
        let key = line.substring(0, eqIndex).trim();
        let value = line.substring(eqIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
    }
});

const getDriveClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;

    if (clientId && clientSecret && refreshToken) {
        console.log("Testing with OAuth 2.0...");
        const auth = new google.auth.OAuth2(clientId, clientSecret);
        auth.setCredentials({ refresh_token: refreshToken });
        return google.drive({ version: 'v3', auth });
    }

    if (email && keyRaw) {
        console.log("Testing with Service Account...");
        const key = keyRaw.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT({
            email,
            key,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        return google.drive({ version: 'v3', auth });
    }

    throw new Error('Missing credentials');
};

async function testFile(fileId) {
    try {
        const drive = getDriveClient();
        console.log(`Checking file metadata for: ${fileId}`);

        const metadata = await drive.files.get({
            fileId: fileId,
            fields: 'name, mimeType, size, permissions',
            supportsAllDrives: true,
        });

        console.log("Metadata Success:", metadata.data);

        console.log("Attempting to get media stream...");
        const response = await drive.files.get(
            { fileId, alt: 'media' },
            { responseType: 'stream' }
        );

        console.log("Stream Success! Status:", response.status);
        console.log("Headers:", response.headers);

        return true;
    } catch (error) {
        console.error("TEST FAILED:", error.message);
        if (error.response) {
            console.error("Error Status:", error.response.status);
            console.error("Error Data:", error.response.data);
        }
        return false;
    }
}

const fileIdToTest = process.argv[2] || '1EZkG9ov4HB2_43LvLYmP-j2kIVFDAN2R'; // Use the logo ID
testFile(fileIdToTest);
