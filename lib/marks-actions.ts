'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTeacherExamSchedules(userId: string) {
    try {
        const teacher = await prisma.teacher.findUnique({
            where: { userId }
        });

        if (!teacher) {
            return [];
        }

        return await prisma.examSchedule.findMany({
            where: {
                teacherId: teacher.id
            },
            include: {
                examGroup: true,
                class: true,
                subject: true
            },
            orderBy: {
                examDate: 'desc'
            }
        });
    } catch (error) {
        console.error("[GET_TEACHER_EXAM_SCHEDULES]", error);
        return [];
    }
}

export async function getExamStudents(examScheduleId: string) {
    try {
        const examSchedule = await prisma.examSchedule.findUnique({
            where: { id: examScheduleId },
            include: {
                class: true,
                examGroup: true,
                subject: true
            }
        });

        if (!examSchedule) {
            throw new Error("Exam schedule not found");
        }

        const students = await prisma.student.findMany({
            where: {
                classId: examSchedule.classId,
                schoolId: examSchedule.schoolId
            },
            include: {
                user: true,
                examResults: {
                    where: {
                        examScheduleId: examScheduleId
                    }
                }
            },
            orderBy: {
                rollNo: 'asc'
            }
        });

        return {
            examSchedule,
            students: students.map(student => ({
                id: student.id,
                name: student.user.name,
                rollNo: student.rollNo,
                image: student.user.image,
                marksObtained: student.examResults[0]?.marksObtained ?? null,
                remarks: student.examResults[0]?.remarks ?? ''
            }))
        };
    } catch (error) {
        console.error("[GET_EXAM_STUDENTS]", error);
        throw error;
    }
}

export async function saveMarks(
    examScheduleId: string,
    marksData: { studentId: string; marksObtained: number; remarks?: string }[],
    userId: string
) {
    try {
        const examSchedule = await prisma.examSchedule.findUnique({
            where: { id: examScheduleId }
        });

        if (!examSchedule) {
            throw new Error("Exam schedule not found");
        }

        // Use a transaction for bulk upsert
        await prisma.$transaction(
            marksData.map(data => 
                prisma.examResult.upsert({
                    where: {
                        schoolId_examScheduleId_studentId: {
                            schoolId: examSchedule.schoolId,
                            examScheduleId: examScheduleId,
                            studentId: data.studentId
                        }
                    },
                    update: {
                        marksObtained: data.marksObtained,
                        remarks: data.remarks,
                        enteredBy: userId,
                        enteredAt: new Date()
                    },
                    create: {
                        schoolId: examSchedule.schoolId,
                        examScheduleId: examScheduleId,
                        studentId: data.studentId,
                        marksObtained: data.marksObtained,
                        remarks: data.remarks,
                        enteredBy: userId
                    }
                })
            )
        );

        revalidatePath('/teacher/marks');
        return { success: true };
    } catch (error: any) {
        console.error("[SAVE_MARKS]", error);
        throw new Error(error.message || "Failed to save marks");
    }
}