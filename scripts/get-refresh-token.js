
const { google } = require('googleapis');
// const open = require('open'); // REMOVED
const readline = require('readline');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/drive'];

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function main() {
    const authorizeUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    });

    console.log('\n--- AUTHORIZATION REQUIRED ---');
    console.log('1. Open this URL in your browser:');
    console.log(`\n${authorizeUrl}\n`);
    console.log('2. Login with the Google Account that OWNS the Drive folder.');
    console.log('3. You will be redirected to OAuth Playground.');
    console.log('4. Copy the "Authorization code" from Step 2 box.');
    console.log('5. Paste it here 👇');

    rl.question('Enter Authorization Code: ', async (code) => {
        try {
            const { tokens } = await oauth2Client.getToken(code.trim());
            console.log('\n\n✅ SUCCESS! Here are your credentials:\n');
            console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
            console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
            console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
            console.log('\nCopy these 3 lines to your .env.local file.');
        } catch (error) {
            console.error('\n❌ Error retrieving token:', error.message);
        }
        rl.close();
    });
}

main();
