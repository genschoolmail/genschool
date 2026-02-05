import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const results = await prisma.result.findMany({
        where: { examId: 'cmiihzdyl0004ycdkk6estwbr' },
        include: {
            student: {
                include: { user: true }
            }
        }
    });

    console.log('=== Results for Mid Term Exam ===');
    results.forEach(result => {
        console.log(`Student: ${result.student.user.name}, Marks: ${result.marks}, Status: ${result.status}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
