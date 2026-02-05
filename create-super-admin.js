const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const email = 'superadmin@school.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        // 1. Create the Default School FIRST
        const defaultSchool = await prisma.school.upsert({
            where: { id: 'default-school' }, // Use the ID that User model defaults to
            update: {},
            create: {
                id: 'default-school',
                name: 'Default School',
                subdomain: 'default', // Or whatever subdomain you want for the default/root
                contactEmail: 'admin@school.com',
                status: 'ACTIVE'
            }
        });
        console.log('✅ Default School created/verified:', defaultSchool.name);

        // 2. Create the Super Admin User
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                schoolId: 'default-school' // Explicitly link
            },
            create: {
                email,
                name: 'Super Admin',
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                schoolId: 'default-school'
            },
        });

        console.log(`✅ Created/Updated Super Admin: ${user.email} with password: ${password}`);

    } catch (error) {
        console.error('❌ Error creating super admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
