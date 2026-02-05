const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
    try {
        const userId = 'cmjjpavkz001j13gfnyv7xol8';
        console.log(`Fetching data for userId: ${userId}`);

        const student = await prisma.student.findUnique({
            where: { userId: userId },
            include: {
                class: true,
                parent: {
                    include: {
                        user: true
                    }
                },
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

        const output = {
            success: true,
            data: student
        };
        fs.writeFileSync('debug_result.json', JSON.stringify(output, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
            , 2));
        console.log('Result written to debug_result.json');

    } catch (error) {
        const errorLog = {
            success: false,
            message: error.message,
            stack: error.stack,
            errorObj: error
        };
        fs.writeFileSync('debug_result.json', JSON.stringify(errorLog, null, 2));
        console.error('Error written to debug_result.json');
    } finally {
        await prisma.$disconnect();
    }
}

main();
