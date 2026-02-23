
const { google } = require('googleapis');

async function getDriveClient() {
    const email = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const keyRaw = process.env.GOOGLE_DRIVE_PRIVATE_KEY;
    if (!email || !keyRaw) throw new Error('Missing Drive credentials');
    const key = keyRaw.replace(/\\n/g, '\n');
    const auth = new google.auth.JWT({
        email,
        key,
        scopes: ['https://www.googleapis.com/auth/drive'],
    });
    return google.drive({ version: 'v3', auth });
}

async function findHeroFiles() {
    try {
        const drive = await getDriveClient();
        const rootId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        // Find successmission folder
        const q1 = `'${rootId}' in parents and name = 'successmission' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res1 = await drive.files.list({ q: q1, fields: 'files(id, name)' });
        if (!res1.data.files.length) return console.log('successmission folder not found');
        const smId = res1.data.files[0].id;

        // Find website folder
        const q2 = `'${smId}' in parents and name = 'website' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res2 = await drive.files.list({ q: q2, fields: 'files(id, name)' });
        if (!res2.data.files.length) return console.log('website folder not found');
        const webId = res2.data.files[0].id;

        // Find hero folder
        const q3 = `'${webId}' in parents and name = 'hero' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res3 = await drive.files.list({ q: q3, fields: 'files(id, name)' });
        if (!res3.data.files.length) return console.log('hero folder not found');
        const heroId = res3.data.files[0].id;

        // List files in hero folder
        const q4 = `'${heroId}' in parents and trashed = false`;
        const res4 = await drive.files.list({ q: q4, fields: 'files(id, name, createdTime)', orderBy: 'createdTime desc' });

        console.log('Files in hero folder:');
        console.log(JSON.stringify(res4.data.files, null, 2));
    } catch (err) {
        console.error(err);
    }
}

findHeroFiles();
