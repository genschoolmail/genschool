const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking models in Prisma Client...');
    console.log('admissionEnquiry exists:', !!prisma.admissionEnquiry);
    console.log('schoolSettings exists:', !!prisma.schoolSettings);
    console.log('school exists:', !!prisma.school);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
