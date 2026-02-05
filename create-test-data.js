const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function updateAndCreateData() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    console.log('🔧 Updating admin phone number...');
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (admin) {
        await prisma.user.update({
            where: { id: admin.id },
            data: { phone: '9999999999' }
        });
    }

    console.log('🏫 Creating comprehensive test data...\n');

    // Clear existing data except admin
    console.log('🗑️  Clearing old test data...');
    await prisma.student.deleteMany();
    await prisma.teacher.deleteMany();
    await prisma.driver.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.class.deleteMany();
    await prisma.vehicle.deleteMany();
    
    // Delete non-admin users
    await prisma.user.deleteMany({ where: { role: { not: 'ADMIN' } } });

    // Create Classes
    console.log('📚 Creating classes...');
    const class1A = await prisma.class.create({ data: { name: '1', section: 'A' } });
    const class2B = await prisma.class.create({ data: { name: '2', section: 'B' } });
    const class3A = await prisma.class.create({ data: { name: '3', section: 'A' } });

    // Create Subjects
    console.log('📖 Creating subjects...');
    await prisma.subject.create({ data: { name: 'Mathematics', code: 'MATH101', classId: class1A.id } });
    await prisma.subject.create({ data: { name: 'Science', code: 'SCI101', classId: class1A.id } });
    await prisma.subject.create({ data: { name: 'English', code: 'ENG101', classId: class2B.id } });

    // Create Teachers
    console.log('👨‍🏫 Creating teachers...');
    const teachers = [
        { name: 'Rajesh Kumar', email: 'rajesh@school.com', phone: '9876543210', designation: 'Senior Teacher' },
        { name: 'Priya Sharma', email: 'priya.teacher@school.com', phone: '9876543211', designation: 'Mathematics Teacher' },
        { name: 'Amit Singh', email: 'amit.teacher@school.com', phone: '9876543212', designation: 'Science Teacher' }
    ];

    for (const teacher of teachers) {
        const user = await prisma.user.create({
            data: {
                email: teacher.email,
                name: teacher.name,
                phone: teacher.phone,
                password: hashedPassword,
                role: 'TEACHER',
            },
        });

        await prisma.teacher.create({
            data: {
                userId: user.id,
                designation: teacher.designation,
                phone: teacher.phone
            }
        });
    }

    // Create Students
    console.log('👨‍🎓 Creating students...');
    const students = [
        { name: 'Amit Sharma', email: 'amit@school.com', phone: '9999999001', admissionNo: 'STU001', classId: class1A.id, rollNo: '1', gender: 'MALE' },
        { name: 'Priya Singh', email: 'priya@school.com', phone: '9999999002', admissionNo: 'STU002', classId: class1A.id, rollNo: '2', gender: 'FEMALE' },
        { name: 'Rahul Verma', email: 'rahul@school.com', phone: '9999999003', admissionNo: 'STU003', classId: class1A.id, rollNo: '3', gender: 'MALE' },
        { name: 'Sneha Patel', email: 'sneha@school.com', phone: '9999999004', admissionNo: 'STU004', classId: class2B.id, rollNo: '1', gender: 'FEMALE' },
        { name: 'Vikas Gupta', email: 'vikas@school.com', phone: '9999999005', admissionNo: 'STU005', classId: class2B.id, rollNo: '2', gender: 'MALE' },
        { name: 'Ananya Roy', email: 'ananya@school.com', phone: '9999999006', admissionNo: 'STU006', classId: class3A.id, rollNo: '1', gender: 'FEMALE' },
        { name: 'Arjun Mehta', email: 'arjun@school.com', phone: '9999999007', admissionNo: 'STU007', classId: class3A.id, rollNo: '2', gender: 'MALE' },
    ];

    for (const student of students) {
        const user = await prisma.user.create({ data: {
            email: student.email, name: student.name, phone: student.phone, password: hashedPassword, role: 'STUDENT',
        }});

        await prisma.student.create({ data: {
            userId: user.id, admissionNo: student.admissionNo, classId: student.classId, rollNo: student.rollNo,
            gender: student.gender, dob: new Date('2010-01-01'), address: 'Test Address, Delhi', phone: student.phone
        }});
    }

    // Create Drivers
    console.log('🚗 Creating drivers...');
    const drivers = [
        { name: 'Suresh Kumar', email: 'suresh@school.com', phone: '9876543220', licenseNo: 'DL1234567890' },
        { name: 'Ramesh Singh', email: 'ramesh@school.com', phone: '9876543221', licenseNo: 'DL0987654321' },
    ];

    for (const driver of drivers) {
        const user = await prisma.user.create({ data: {
            email: driver.email, name: driver.name, phone: driver.phone, password: hashedPassword, role: 'DRIVER',
        }});

        await prisma.driver.create({ data: {
            userId: user.id, licenseNo: driver.licenseNo, phone: driver.phone
        }});
    }

    // Create Vehicles
    console.log('🚌 Creating vehicles...');
    await prisma.vehicle.create({ data: { number: 'DL-01-AB-1234', capacity: 40, model: 'Tata School Bus' } });
    await prisma.vehicle.create({ data: { number: 'DL-01-CD-5678', capacity: 35, model: 'Ashok Leyland Bus' } });

    console.log('\n✨✨✨ DATA SUCCESSFULLY CREATED! ✨✨✨\n');
    console.log('═════════════════════════════════════════════════════════');
    console.log('          📋 LOGIN CREDENTIALS');
    console.log('═════════════════════════════════════════════════════════');
    console.log('\n👤 ADMIN:  admin@school.com  |  password123');
    console.log('\n👨‍🏫 TEACHERS:');
    console.log('   • rajesh@school.com  |  password123');
    console.log('   • priya.teacher@school.com  |  password123');
    console.log('   • amit.teacher@school.com  |  password123');
    console.log('\n👨‍🎓 STUDENTS:');  
    console.log('   • amit@school.com  |  password123');
    console.log('   • priya@school.com  |  password123');
    console.log('   • rahul@school.com, sneha@school.com');
    console.log('   • vikas@school.com, ananya@school.com, arjun@school.com');
    console.log('\n🚗 DRIVERS:');
    console.log('   • suresh@school.com  |  password123');
    console.log('   • ramesh@school.com  |  password123');
    console.log('\n═════════════════════════════════════════════════════════');
    console.log('\n📝 Admin Profile Update:');
    console.log('   Login → Profile Icon (top-right) → Settings\n');
}

updateAndCreateData()
    .catch((e) => { console.error('❌ Error:', e.message); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
