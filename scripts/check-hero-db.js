
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const school = await prisma.school.findUnique({
        where: { subdomain: 'successmission' },
        include: { schoolSettings: true }
    });

    if (school) {
        console.log('School Found:', school.name);
        console.log('Hero Image URL in DB:', school.schoolSettings?.heroImage);
    } else {
        console.log('School not found.');
    }
}

check().catch(console.error);
