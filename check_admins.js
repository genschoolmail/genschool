
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: {
                name: true,
                email: true,
                tempPassword: true
            }
        });

        console.log("Found " + admins.length + " admins:");
        console.log(JSON.stringify(admins, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
