const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    const output = { log: [] };
    const log = (msg) => {
        console.log(msg);
        output.log.push(msg);
    };

    try {
        const userId = 'cmjjpavkz001j13gfnyv7xol8';
        log(`Checking admit cards for userId: ${userId}`);

        const student = await prisma.student.findUnique({
            where: { userId: userId },
            include: { user: true }
        });

        if (!student) {
            log('Student not found');
        } else {
            log(`Student ID: ${student.id}, Name: ${student.user.name}`);

            const admitCards = await prisma.admitCard.findMany({
                where: { studentId: student.id },
                include: { examGroup: true }
            });

            log(`Total Admit Cards found: ${admitCards.length}`);
            output.admitCards = admitCards.map(c => ({
                id: c.id,
                examName: c.examGroup.name,
                status: c.status,
                generatedAt: c.generatedAt
            }));
        }

        fs.writeFileSync('exam_debug.json', JSON.stringify(output, null, 2));
        log('Output written to exam_debug.json');

    } catch (error) {
        log(`Error: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
