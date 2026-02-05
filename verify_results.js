
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyResultsModule() {
    console.log('🔍 Verifying Results Module Data...');

    try {
        const exams = await prisma.exam.findMany({
            include: {
                class: true,
                subject: true,
                results: true,
                _count: {
                    select: { results: true }
                }
            },
            orderBy: {
                date: 'desc'
            }
        });

        console.log(`✅ Found ${exams.length} exams.`);

        for (const exam of exams) {
            console.log(`\nExam: ${exam.name} (${exam.class.name}-${exam.class.section})`);
            console.log(`Subject: ${exam.subject.name}`);
            console.log(`Total Results: ${exam._count.results}`);

            if (exam.results.length > 0) {
                const firstResult = exam.results[0];
                console.log(`Sample Result: Marks=${firstResult.marks}, Status=${firstResult.status}`);
                console.log(`Published Status: ${firstResult.publishedStatus}`);
            } else {
                console.log('⚠️ No results found for this exam.');
            }
        }

    } catch (error) {
        console.error('❌ Error verifying results module:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyResultsModule();
