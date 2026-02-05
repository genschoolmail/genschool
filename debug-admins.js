const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, email: true, name: true, schoolId: true, createdAt: true }
        });
        const output = {
            timestamp: new Date().toISOString(),
            admins: admins
        };
        fs.writeFileSync('admins_list.json', JSON.stringify(output, null, 2));
        console.log('Admins list written to admins_list.json');
    } catch (error) {
        console.error('Prisma Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
