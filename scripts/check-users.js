const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- USERS FOR Success Mission School ---');
        const school = await prisma.school.findUnique({
            where: { subdomain: 'successmission' }
        });

        if (school) {
            const users = await prisma.user.findMany({
                where: { schoolId: school.id },
                select: { id: true, email: true, role: true, schoolId: true }
            });
            console.table(users);
        } else {
            console.log('School NOT FOUND');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
