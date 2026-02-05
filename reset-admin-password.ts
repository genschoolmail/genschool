import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    await prisma.user.updateMany({
        where: { phone: '9999999999' },
        data: { password: hashedPassword }
    });
    console.log('Admin password reset to password123');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
