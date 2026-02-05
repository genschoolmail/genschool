const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const students = await prisma.student.findMany({
            take: 1,
            include: {
                user: {
                    select: { id: true, email: true, name: true }
                }
            }
        });
        fs.writeFileSync('students_list.json', JSON.stringify(students, null, 2));
        console.log('Students list written to students_list.json');
    } catch (error) {
        console.error('Error listing students:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
