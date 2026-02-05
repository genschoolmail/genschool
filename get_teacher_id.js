const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const teacher = await prisma.teacher.findFirst({
            where: { user: { email: 'dr.test.unique@school.com' } },
            select: { id: true }
        });
        console.log('TEACHER_ID:', teacher?.id);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
