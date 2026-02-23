
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const school = await prisma.school.findUnique({
        where: { subdomain: 'successmission' },
        select: { id: true, name: true, subdomain: true }
    });

    if (school) {
        console.log('School Found:', school);
        const settings = await prisma.schoolSettings.findUnique({
            where: { schoolId: school.id }
        });
        console.log('Settings for this ID:', settings?.heroImage);
    } else {
        console.log('School not found.');
    }
}

check().catch(console.error);
