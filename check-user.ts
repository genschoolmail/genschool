import { prisma } from './lib/prisma';

async function main() {
    const user = await prisma.user.findFirst({
        where: { phone: '9999999999' }
    });
    console.log('Admin User:', user);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
