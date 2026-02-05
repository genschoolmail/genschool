const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSettings() {
    const settings = [
        // SMTP Settings
        { key: 'SMTP_HOST', value: '', type: 'TEXT', category: 'SMTP', description: 'Outgoing mail server host' },
        { key: 'SMTP_PORT', value: '587', type: 'NUMBER', category: 'SMTP', description: 'Outgoing mail server port' },
        { key: 'SMTP_USER', value: '', type: 'TEXT', category: 'SMTP', description: 'SMTP username' },
        { key: 'SMTP_PASS', value: '', type: 'PASSWORD', category: 'SMTP', description: 'SMTP password' },
        { key: 'SMTP_FROM', value: 'noreply@platform.com', type: 'TEXT', category: 'SMTP', description: 'Sender email address' },

        // SMS Settings
        { key: 'SMS_PROVIDER', value: 'TWILIO', type: 'SELECT', category: 'SMS', description: 'SMS gateway provider' },
        { key: 'SMS_API_KEY', value: '', type: 'PASSWORD', category: 'SMS', description: 'SMS Provider API Key/SID' },
        { key: 'SMS_SENDER_ID', value: '', type: 'TEXT', category: 'SMS', description: 'Approved Sender ID' },

        // Google Maps
        { key: 'GOOGLE_MAPS_KEY', value: '', type: 'PASSWORD', category: 'MAPS', description: 'Google Maps JavaScript API Key' },

        // Storage
        { key: 'S3_BUCKET', value: '', type: 'TEXT', category: 'STORAGE', description: 'Cloud storage bucket name' },
        { key: 'S3_REGION', value: 'us-east-1', type: 'TEXT', category: 'STORAGE', description: 'Bucket region' },
        { key: 'S3_ACCESS_KEY', value: '', type: 'PASSWORD', category: 'STORAGE', description: 'AWS Access Key' },
        { key: 'S3_SECRET_KEY', value: '', type: 'PASSWORD', category: 'STORAGE', description: 'AWS Secret Key' },

        // Redis
        { key: 'REDIS_URL', value: 'redis://localhost:6379', type: 'TEXT', category: 'REDIS', description: 'Redis connection URL' },
        { key: 'REDIS_PASSWORD', value: '', type: 'PASSWORD', category: 'REDIS', description: 'Redis password' },
    ];

    console.log('Seeding System Settings...');

    for (const s of settings) {
        await prisma.systemSettings.upsert({
            where: { key: s.key },
            update: {},
            create: s
        });
    }

    console.log('✅ Seeded 15 settings.');
}

seedSettings()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
