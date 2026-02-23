
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testUpsert() {
    const schoolId = 'cml9lmkey000114a36rwqnf4p';
    const testUrl = 'https://drive.google.com/thumbnail?id=TEST_ID_' + Date.now();

    console.log('Testing upsert for schoolId:', schoolId);
    try {
        const result = await prisma.schoolSettings.upsert({
            where: { schoolId },
            create: {
                schoolId,
                heroImage: testUrl,
                schoolName: 'Test School',
                contactNumber: 'N/A',
                email: 'N/A',
                address: 'N/A'
            },
            update: { heroImage: testUrl }
        });
        console.log('Upsert Success! New Hero:', result.heroImage);

        const verify = await prisma.schoolSettings.findUnique({ where: { schoolId } });
        console.log('Verified from DB:', verify.heroImage);
    } catch (e) {
        console.error('Upsert FAILED:', e.message);
    }
}

testUpsert().catch(console.error).finally(() => prisma.$disconnect());
