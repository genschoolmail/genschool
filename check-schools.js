
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const schools = await prisma.school.findMany({
        select: {
            id: true,
            name: true,
            subdomain: true
        }
    });
    console.log('Schools in database:', JSON.stringify(schools, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
