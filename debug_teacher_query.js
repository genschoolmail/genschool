const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Fetch ID dynamically first
        const teacherByEmail = await prisma.teacher.findFirst({
            where: { user: { email: 'dr.test.unique@school.com' } },
            select: { id: true }
        });

        if (!teacherByEmail) {
            console.log('Teacher not found by email!');
            return;
        }

        const id = teacherByEmail.id;
        console.log(`Fetched dynamic ID: ${id}`);

        console.log(`Checking simple existence for ID: ${id}`);
        const simpleTeacher = await prisma.teacher.findUnique({
            where: { id }
        });
        console.log('Simple check result:', simpleTeacher ? 'Found' : 'Not Found');

        if (simpleTeacher) {
            console.log('Now checking with includes...');
            const teacher = await prisma.teacher.findUnique({
                where: { id },
                include: {
                    user: true,
                    teacherDocuments: {
                        orderBy: { uploadedAt: 'desc' }
                    },
                    classTeachers: {
                        include: {
                            class: true
                        }
                    },
                    salaries: {
                        orderBy: { month: 'desc' },
                        take: 12
                    }
                }
            });

            if (!teacher) {
                console.log('Teacher not found with includes (null returned)');
            } else {
                console.log('Teacher found with includes!');
                console.log('User:', teacher.user.name);
                console.log('Documents:', teacher.teacherDocuments.length);
                console.log('Salaries:', teacher.salaries.length);
            }
        }

    } catch (e) {
        console.error('Error executing query:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
