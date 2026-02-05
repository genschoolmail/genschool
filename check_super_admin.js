const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bcrypt = require('bcryptjs');

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('superadmin123', 10);
        const updated = await prisma.user.updateMany({
            where: { role: 'SUPER_ADMIN' },
            data: { password: hashedPassword }
        });

        console.log(`✅ Reset password for ${updated.count} Super Admins to: superadmin123`);

        const superAdmins = await prisma.user.findMany({
            where: {
                role: 'SUPER_ADMIN'
            },
            include: {
                school: true
            }
        });

        console.log("Super Admin Details:");
        console.log(JSON.stringify(superAdmins, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
