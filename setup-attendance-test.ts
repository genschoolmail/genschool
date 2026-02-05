const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Setting up attendance test data...');

    // 1. Find the teacher
    const teacherUser = await prisma.user.findUnique({
        where: { email: 'uploadtest13@school.com' },
        include: { teacherProfile: true }
    });

    if (!teacherUser || !teacherUser.teacherProfile) {
        console.error('Teacher not found. Please run the previous verification step first.');
        return;
    }

    const teacherId = teacherUser.teacherProfile.id;
    console.log('Found teacher:', teacherId);

    // 2. Create a Class
    const className = '10';
    const section = 'Z';

    let cls = await prisma.class.findUnique({
        where: {
            name_section: {
                name: className,
                section: section
            }
        }
    });

    if (!cls) {
        cls = await prisma.class.create({
            data: {
                name: className,
                section: section,
                academicYear: '2024-2025',
                teacherId: teacherId // Assign as main teacher
            }
        });
        console.log('Created Class 10-Z:', cls.id);
    } else {
        // Update teacher if class exists
        await prisma.class.update({
            where: { id: cls.id },
            data: { teacherId: teacherId }
        });
        console.log('Updated Class 10-Z with teacher');
    }

    // 3. Create Students
    const studentsData = [
        { name: 'Student A', email: 'studentA@test.com', rollNo: '101', phone: `99${Math.floor(Math.random() * 100000000)}` },
        { name: 'Student B', email: 'studentB@test.com', rollNo: '102', phone: `99${Math.floor(Math.random() * 100000000)}` }
    ];

    for (const s of studentsData) {
        try {
            let user = await prisma.user.findUnique({ where: { email: s.email } });
            if (!user) {
                user = await prisma.user.create({
                    data: {
                        name: s.name,
                        email: s.email,
                        phone: s.phone,
                        password: 'password123',
                        role: 'STUDENT'
                    }
                });
            }

            const student = await prisma.student.upsert({
                where: { userId: user.id },
                update: {
                    classId: cls.id,
                    rollNo: s.rollNo,
                    admissionNo: `ADM-${s.rollNo}`
                },
                create: {
                    userId: user.id,
                    classId: cls.id,
                    rollNo: s.rollNo,
                    admissionNo: `ADM-${s.rollNo}`,
                    admissionYear: '2024-2025'
                }
            });
            console.log(`Upserted student: ${s.name}`);
        } catch (error) {
            console.error(`Error creating student ${s.name}:`, error);
        }
    }

    console.log('Setup complete.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
