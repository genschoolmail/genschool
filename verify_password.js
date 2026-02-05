const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function verifyPassword() {
    try {
        const email = 'admin@school.com';
        const password = 'password123';

        console.log(`Checking user: ${email}`);
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('User found:', user.id);
        console.log('Stored Hash:', user.password);

        const isValid = await bcrypt.compare(password, user.password);
        console.log(`Password '${password}' valid?`, isValid ? '✅ YES' : '❌ NO');

        // Also try to hash it again to see what it looks like
        const newHash = await bcrypt.hash(password, 10);
        console.log('New Hash would be:', newHash);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

verifyPassword();
