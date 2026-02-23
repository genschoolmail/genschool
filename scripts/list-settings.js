
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    const settings = await prisma.schoolSettings.findMany({
        select: { id: true, schoolId: true, heroImage: true }
    });
    console.log('Total Settings Records:', settings.length);
    for (const s of settings) {
        const school = await prisma.school.findUnique({
            where: { id: s.schoolId },
            select: { subdomain: true }
        });
        console.log(`- ID: ${s.id}, SchoolId: ${s.schoolId}, Subdomain: ${school?.subdomain}, Hero: ${s.heroImage}`);
    }
}

check().catch(console.error).finally(() => prisma.$disconnect());
