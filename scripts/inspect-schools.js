const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- SEARCHING BY SUBDOMAIN: successmission ---');
        const school = await prisma.school.findUnique({
            where: { subdomain: 'successmission' },
            include: { schoolSettings: true }
        });

        if (school) {
            console.log('School Found: ' + school.name + ' (ID: ' + school.id + ')');
            console.log('SchoolSettings Data:');
            console.log(JSON.stringify(school.schoolSettings, null, 2));

            // Check if there are any orphaned SchoolSettings with this schoolId
            const allSettings = await prisma.schoolSettings.findMany({
                where: { schoolId: school.id }
            });
            console.log('\nTotal SchoolSettings records for this ID: ' + allSettings.length);
        } else {
            console.log('School NOT FOUND by subdomain');
        }

        console.log('\n--- LISTING ALL SCHOOLS ---');
        const schools = await prisma.school.findMany({
            select: { id: true, name: true, subdomain: true }
        });
        console.table(schools);

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
