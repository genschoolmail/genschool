import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const examId = 'cmiihzdyl0004ycdkk6estwbr';
    const exam = await prisma.exam.findUnique({
        where: { id: examId }
    });
    console.log('Exam details:', exam);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
