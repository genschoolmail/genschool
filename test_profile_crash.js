
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProfileLogic() {
    try {
        console.log("Fetching first student...");
        const student = await prisma.student.findFirst({
            include: {
                user: true,
                class: true,
                parent: true,
                attendances: { orderBy: { date: 'desc' }, take: 30 },
                studentFees: {
                    include: {
                        feeStructure: true,
                        payments: { orderBy: { date: 'desc' } }
                    }
                },
                examResults: {
                    include: {
                        examSchedule: {
                            include: {
                                examGroup: true,
                                subject: true
                            }
                        }
                    },
                    orderBy: { enteredAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!student) {
            console.log("No student found to test.");
            return;
        }

        console.log("Student found:", student.id);

        // --- MIMIC PAGE COMPONENT LOGIC ---

        // 1. Attendance Calculation
        console.log("Calculating attendance...");
        const attendance = student.attendances || [];
        const totalDays = attendance.length;
        const presentDays = attendance.filter((a) => a.status === 'PRESENT').length;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
        console.log({ totalDays, presentDays, attendancePercentage });

        // 2. Fee Status Calculation
        console.log("Calculating fees...");
        const studentFees = student.studentFees || [];
        const totalFees = studentFees.reduce((sum, fa) => sum + (fa.feeStructure?.amount || 0), 0);
        const totalPaid = studentFees.reduce((sum, fa) =>
            sum + (fa.payments || []).reduce((pSum, p) => pSum + (p.amount || 0), 0), 0
        );
        const pendingFees = totalFees - totalPaid;
        console.log({ totalFees, totalPaid, pendingFees });

        // 3. User & Safe Access Checks
        console.log("Checking user fields...");
        const userName = student.user?.name || 'Unknown';
        const userEmail = student.user?.email || 'N/A';
        const userPhone = student.user?.phone || 'N/A';
        const className = student.class ? `${student.class.name}-${student.class.section}` : 'Unassigned';
        console.log({ userName, userEmail, userPhone, className });

        // 4. Map Over Fees (Reflecting JSX Logic)
        console.log("Mapping fees...");
        studentFees.forEach((fa) => {
            const payments = fa.payments || [];
            const feeStructure = fa.feeStructure || { name: 'Unknown', amount: 0 };
            const paid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
            const pending = feeStructure.amount - paid;
            console.log(`Fee: ${feeStructure.name}, Paid: ${paid}, Pending: ${pending}`);
        });

        // 5. Map Over Exams
        console.log("Mapping exams...");
        (student.examResults || []).forEach((result) => {
            const examName = result.examSchedule?.examGroup?.name || 'Unknown Exam';
            const subjectName = result.examSchedule?.subject?.name || '';
            const display = subjectName ? `${examName} - ${subjectName}` : examName;
            console.log(`Exam: ${display}, Marks: ${result.marksObtained}/${result.examSchedule?.maxMarks}`);
        });

        console.log("SUCCESS: No crash detected in logic.");

    } catch (error) {
        console.error("CRASH DETECTED:", error);
        require('fs').writeFileSync('crash.log', JSON.stringify(error, null, 2) + "\n" + error.toString());
    } finally {
        await prisma.$disconnect();
    }
}

testProfileLogic();
