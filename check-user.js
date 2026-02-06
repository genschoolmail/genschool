
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'sweatpllv@gmail.com';
    const password = 'password123';

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { school: true }
        });

        if (!user) {
            console.log(`User ${email} NOT FOUND in the database.`);
            return;
        }

        console.log('User Found:');
        console.log(`- ID: ${user.id}`);
        console.log(`- Role: ${user.role}`);
        console.log(`- School ID: ${user.schoolId}`);
        console.log(`- School Name: ${user.school?.name}`);
        console.log(`- School Subdomain: ${user.school?.subdomain}`);
        console.log(`- School Status: ${user.school?.status}`);

        const passwordMatch = await bcrypt.compare(password, user.password);
        console.log(`- Password Match for '${password}': ${passwordMatch ? 'YES' : 'NO'}`);

    } catch (error) {
        console.error('Error checking user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
