const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDb() {
    try {
        console.log('Testing DB connection...');
        const count = await prisma.user.count();
        console.log('Connection successful! User count:', count);
    } catch (error) {
        console.error('DB Connection Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkDb();
