const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('=== Setting up comprehensive Teacher Module test data ===\n');

    // 1. Find the teacher
    const teacherUser = await prisma.user.findUnique({
        where: { email: 'uploadtest13@school.com' },
        include: { teacherProfile: true }
    });

    if (!teacherUser || !teacherUser.teacherProfile) {
        console.error('Teacher not found. Please create teacher first.');
        return;
    }

    const teacherId = teacherUser.teacherProfile.id;
    console.log('✓ Found teacher:', teacherId);

    // 2. Ensure Class 10-Z exists with students (for Attendance)
    let cls = await prisma.class.findFirst({
        where: { name: '10', section: 'Z' }
    });

    if (!cls) {
        cls = await prisma.class.create({
            data: {
                name: '10',
                section: 'Z',
                academicYear: '2024-2025',
                teacherId: teacherId
            }
        });
        console.log('✓ Created Class 10-Z');
    }

    // 3. Create a Subject for the teacher
    let subject = await prisma.subject.findFirst({
        where: {
            name: 'Physics',
            classId: cls.id
        }
    });

    if (!subject) {
        subject = await prisma.subject.create({
            data: {
                name: 'Physics',
                type: 'CORE',
                classId: cls.id,
                teacherId: teacherId,
                credits: 5
            }
        });
        console.log('✓ Created Physics subject');
    }

    // 4. Create Time Slots for Timetable
    const timeSlots = [
        { label: 'Period 1', startTime: '09:00', endTime: '10:00', order: 1 },
        { label: 'Period 2', startTime: '10:00', endTime: '11:00', order: 2 },
        { label: 'Period 3', startTime: '11:15', endTime: '12:15', order: 3 },
        { label: 'Period 4', startTime: '12:15', endTime: '13:15', order: 4 }
    ];

    for (const slot of timeSlots) {
        await prisma.timeSlot.upsert({
            where: { label: slot.label },
            update: {},
            create: slot
        });
    }
    console.log('✓ Created time slots');

    // 5. Create Timetable Entries
    const mondaySlot = await prisma.timeSlot.findFirst({ where: { label: 'Period 1' } });
    if (mondaySlot) {
        await prisma.timetableEntry.upsert({
            where: {
                classId_day_timeSlotId: {
                    classId: cls.id,
                    day: 'MONDAY',
                    timeSlotId: mondaySlot.id
                }
            },
            update: {},
            create: {
                classId: cls.id,
                day: 'MONDAY',
                timeSlotId: mondaySlot.id,
                subjectId: subject.id,
                teacherId: teacherId,
                room: 'Room 101'
            }
        });
        console.log('✓ Created timetable entry');
    }

    // 6. Create Exam Group and Schedule for Marks Upload
    let examGroup = await prisma.examGroup.findFirst({
        where: { name: 'Mid Term 2024' }
    });

    if (!examGroup) {
        examGroup = await prisma.examGroup.create({
            data: {
                name: 'Mid Term 2024',
                academicYear: '2024-2025',
                description: 'Mid term examination',
                order: 1
            }
        });
        console.log('✓ Created exam group');
    }

    // 7. Create Exam Schedule
    let examSchedule = await prisma.examSchedule.findFirst({
        where: {
            examGroupId: examGroup.id,
            classId: cls.id,
            subjectId: subject.id
        }
    });

    if (!examSchedule) {
        examSchedule = await prisma.examSchedule.create({
            data: {
                examGroupId: examGroup.id,
                classId: cls.id,
                subjectId: subject.id,
                examDate: new Date('2024-12-01'),
                startTime: '09:00',
                duration: 120,
                maxMarks: 100,
                passingMarks: 40
            }
        });
        console.log('✓ Created exam schedule');
    }

    // 8. Ensure students exist
    const studentsData = [
        { name: 'Student A', email: 'studentA@test.com', rollNo: '101', phone: `99${Math.floor(Math.random() * 100000000)}` },
        { name: 'Student B', email: 'studentB@test.com', rollNo: '102', phone: `99${Math.floor(Math.random() * 100000000)}` },
        { name: 'Student C', email: 'studentC@test.com', rollNo: '103', phone: `99${Math.floor(Math.random() * 100000000)}` }
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

            await prisma.student.upsert({
                where: { userId: user.id },
                update: {
                    classId: cls.id,
                    rollNo: s.rollNo
                },
                create: {
                    userId: user.id,
                    classId: cls.id,
                    rollNo: s.rollNo,
                    admissionNo: `ADM-${s.rollNo}`,
                    admissionYear: '2024-2025'
                }
            });
            console.log(`✓ Ensured student: ${s.name}`);
        } catch (error: any) {
            console.error(`Error with student ${s.name}:`, error.message);
        }
    }

    console.log('\n=== Test Data Setup Complete ===');
    console.log('\nVerification URLs:');
    console.log('1. My Classes:    http://localhost:3000/teacher/classes');
    console.log('2. Attendance:    http://localhost:3000/teacher/attendance');
    console.log('3. Upload Marks:  http://localhost:3000/teacher/marks');
    console.log('4. Timetable:     http://localhost:3000/teacher/timetable');
    console.log('\nLogin: uploadtest13@school.com / password123');
}

main()
    .catch(e => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
