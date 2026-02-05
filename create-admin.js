const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Check if admin already exists
        const existing = await prisma.user.findFirst({
            where: { email: 'admin@school.com' }
        });

        if (existing) {
            // Update password to password123
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.update({
                where: { id: existing.id },
                data: { password: hashedPassword }
            });
            console.log('✅ Admin password updated to: password123');
        } else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await prisma.user.create({
                data: {
                    email: 'admin@school.com',
                    name: 'Admin User',
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            });
            console.log('✅ Admin user created successfully!');
        }

        console.log('\n📧 Email: admin@school.com');
        console.log('🔑 Password: password123');
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createAdmin()
    .finally(async () => {
        await prisma.$disconnect();
    });
