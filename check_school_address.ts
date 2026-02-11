
import { prisma } from './lib/prisma';

async function main() {
    const studentId = 'cmlb4uk3c0005jj18qj5nmn2h';
    console.log(`Checking for student ID: ${studentId}`);

    const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: {
            school: {
                include: {
                    schoolSettings: true
                }
            }
        }
    });

    if (!student) {
        console.log('Student not found');
        return;
    }

    console.log('Student School ID:', student.schoolId);
    console.log('School Name:', student.school.name);
    console.log('School Address (from School model):', student.school.address);

    if (student.school.schoolSettings) {
        console.log('School Settings found');
        console.log('School Settings Address:', student.school.schoolSettings.address);
    } else {
        console.log('School Settings NOT found');
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
