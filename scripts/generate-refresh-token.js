const https = require('https');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Manually read .env file
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        if (fs.existsSync(envPath)) {
            const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
            for (const line of lines) {
                const match = line.match(/^([^=]+)=(.*)$/);
                if (match) process.env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
            }
        }
    } catch (e) { /* .env not found, use existing env */ }
}
loadEnv();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set in your .env file');
    process.exit(1);
}

const REDIRECT_URI = 'http://localhost:8080';

// Step 1: Print the auth URL
const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent('https://www.googleapis.com/auth/drive')}` +
    `&access_type=offline` +
    `&prompt=consent`;

console.log('\n========================================');
console.log('STEP 1: Open this URL in your browser:');
console.log('========================================\n');
console.log(authUrl);
console.log('\n========================================');
console.log('STEP 2: Sign in with your Google account (the one that owns the Drive folder)');
console.log('STEP 3: Copy the authorization code shown');
console.log('========================================\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Paste the authorization code here: ', (code) => {
    rl.close();

    // Step 2: Exchange code for tokens
    const postData = new URLSearchParams({
        code: code.trim(),
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
    }).toString();

    const options = {
        hostname: 'oauth2.googleapis.com',
        path: '/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData),
        },
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                if (json.refresh_token) {
                    console.log('\n✅ SUCCESS! Your new refresh token:');
                    console.log('=====================================');
                    console.log(json.refresh_token);
                    console.log('=====================================\n');
                    console.log('NOW: Update GOOGLE_REFRESH_TOKEN in Vercel:');
                    console.log('  Vercel Dashboard → Project → Settings → Environment Variables');
                    console.log('  Find GOOGLE_REFRESH_TOKEN → Edit → Paste the new token above → Save');
                    console.log('\nAlso update your local .env file with this new token.\n');
                } else {
                    console.error('❌ Failed to get refresh token:');
                    console.error(JSON.stringify(json, null, 2));
                }
            } catch (e) {
                console.error('❌ Error parsing response:', data);
            }
        });
    });

    req.on('error', (e) => console.error('Request error:', e));
    req.write(postData);
    req.end();
});
