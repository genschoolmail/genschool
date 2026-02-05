const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUser() {
    const email = 'superadmin@school.com';
    const password = 'password123';

    console.log(`Checking user: ${email}`);

    const user = await prisma.user.findUnique({
        where: { email },
        include: { school: true }
    });

    if (!user) {
        console.log('❌ User not found in database!');
        return;
    }

    console.log('✅ User found:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
        schoolSubdomain: user.school?.subdomain
    });

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
        console.log('✅ Password matches!');
    } else {
        console.log('❌ Password does NOT match!');
        console.log('Stored Hash:', user.password);

        // Attempt to re-hash to see what it should be
        const newHash = await bcrypt.hash(password, 10);
        console.log('Expected Hash example:', newHash);
    }
}

checkUser()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
