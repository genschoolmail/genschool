const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Update superadmin users to have no specific subdomain
        const result = await prisma.user.updateMany({
            where: { role: 'SUPER_ADMIN' },
            data: {
                schoolId: null  // Super admins don't belong to any specific school
            }
        });

        console.log(`✅ Updated ${result.count} SUPER_ADMIN user(s) - removed school association`);

        // Verify
        const superAdmins = await prisma.user.findMany({
            where: { role: 'SUPER_ADMIN' },
            include: { school: true }
        });

        console.log('\nSuper Admin Details:');
        superAdmins.forEach(admin => {
            console.log(`  Email: ${admin.email}`);
            console.log(`  School: ${admin.school?.name || 'None (Correct!)'}`);
            console.log(`  Subdomain: ${admin.school?.subdomain || 'None (Correct!)'}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
