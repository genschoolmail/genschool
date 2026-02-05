import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);

        const user = await prisma.user.create({
            data: {
                name: 'Test Teacher',
                email: 'uploadtest12@school.com',
                password: hashedPassword,
                role: 'TEACHER'
            }
        });
        console.log('User created successfully:', user.id);

        // Clean up
        await prisma.user.delete({
            where: { id: user.id }
        });
        console.log('User deleted successfully.');
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
