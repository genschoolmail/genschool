
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log(`Listing first 5 students...`);

    const students = await prisma.student.findMany({
        take: 5,
        include: {
            school: {
                include: {
                    schoolSettings: true
                }
            }
        }
    });

    if (students.length === 0) {
        console.log('No students found');
        return;
    }

    for (const student of students) {
        console.log('--------------------------------------------------');
        console.log('Student ID:', student.id);
        console.log('School ID:', student.schoolId);
        console.log('School Name:', student.school.name);
        console.log('School Address (from School model):', student.school.address);

        if (student.school.schoolSettings) {
            console.log('School Settings Address:', student.school.schoolSettings.address);
        } else {
            console.log('School Settings NOT found');
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
