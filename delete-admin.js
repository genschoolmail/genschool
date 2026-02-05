const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const deletedUser = await prisma.user.delete({
            where: { email: 'admin1@gmail.com' }
        });
        console.log('Deleted duplicate admin:', deletedUser.email);
    } catch (error) {
        if (error.code === 'P2025') {
            console.log('Admin not found (already deleted?)');
        } else {
            console.error('Error deleting admin:', error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
