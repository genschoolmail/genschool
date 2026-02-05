const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userId = 'cmjjpavkz001j13gfnyv7xol8';
        console.log(`Verifying data fetch for userId: ${userId}`);

        const student = await prisma.student.findUnique({
            where: { userId: userId },
            include: {
                class: true,
                parent: true, // Fixed: removed nested include
                attendances: {
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 30))
                        }
                    },
                    orderBy: { date: 'desc' }
                },
                studentFees: {
                    include: { feeStructure: true },
                    orderBy: { dueDate: 'asc' },
                    take: 1
                },
                admitCards: {
                    where: { status: 'ISSUED' },
                    include: { examGroup: true },
                    orderBy: { generatedAt: 'desc' }
                }
            }
        });

        if (student) {
            console.log('✅ Fetch successful!');
            console.log(`Student Name: ${student.userId} (linked)`); // Name is in User model, not explicitly fetched here but relation integrity is ok
            console.log(`Parent Data: ${student.parent ? 'Present' : 'None'}`);
        } else {
            console.log('❌ Student not found (but query ran)');
        }

    } catch (error) {
        console.error('❌ Error fetching student:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
