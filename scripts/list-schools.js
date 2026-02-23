const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const schools = await prisma.school.findMany({
            select: {
                id: true,
                name: true,
                subdomain: true
            }
        });
        console.log('--- Schools List ---');
        console.log(JSON.stringify(schools, null, 2));
        console.log('--------------------');
    } catch (error) {
        console.error('Error fetching schools:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
