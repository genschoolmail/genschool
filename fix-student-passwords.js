const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function fixStudentPasswords() {
    console.log('Starting to fix student passwords...');

    try {
        // Get all users with role STUDENT
        const students = await prisma.user.findMany({
            where: { role: 'STUDENT' }
        });

        console.log(`Found ${students.length} students`);

        // Hash password for each student
        const hashedPassword = await bcrypt.hash('password123', 10);

        let fixed = 0;
        for (const student of students) {
            // Check if password is already hashed (starts with $2a$ or $2b$)
            if (!student.password.startsWith('$2')) {
                await prisma.user.update({
                    where: { id: student.id },
                    data: { password: hashedPassword }
                });
                console.log(`Fixed password for: ${student.email}`);
                fixed++;
            } else {
                console.log(`Password already hashed for: ${student.email}`);
            }
        }

        console.log(`\n✅ Fixed ${fixed} student passwords`);
        console.log(`All students can now login with: password123`);
    } catch (error) {
        console.error('Error fixing passwords:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixStudentPasswords();
