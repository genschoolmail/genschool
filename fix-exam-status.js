const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userId = 'cmjjpavkz001j13gfnyv7xol8';
        const student = await prisma.student.findUnique({ where: { userId } });

        if (student) {
            const update = await prisma.admitCard.updateMany({
                where: { studentId: student.id },
                data: { status: 'ISSUED', issuedAt: new Date() }
            });
            console.log(`Updated ${update.count} admit cards to ISSUED.`);
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
