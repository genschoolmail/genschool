/**
 * Data transformation helpers for Exam Module
 * 
 * These functions provide a centralized way to transform database
 * query results into the format expected by UI components.
 * 
 * This ensures consistency and prevents type mismatches across the application.
 */

import type {
    StudentForAdmitCard,
    AdmitCardData,
    ExamScheduleData,
    StudentForMarksheet
} from '@/types/exam';

/**
 * Transforms a Prisma Student object (with user relation) into StudentForAdmitCard
 * 
 * @param student - Prisma Student with user and class relations included
 * @returns Formatted student data for admit card display
 */
export function formatStudentForAdmitCard(student: any): StudentForAdmitCard {
    return {
        name: student.user?.name || student.name || 'N/A',
        rollNo: student.rollNo || 'N/A',
        email: student.user?.email || student.email || '',
        class: {
            name: student.class?.name || 'N/A',
            section: student.class?.section || 'N/A'
        },
        profileImage: student.profileImage || student.user?.image || null,
        admissionNo: student.admissionNo || 'N/A',
        fatherName: student.fatherName || undefined
    };
}

/**
 * Transforms a Prisma AdmitCard object into AdmitCardData
 * 
 * @param admitCard - Prisma AdmitCard with examGroup and student relations
 * @returns Formatted admit card data ready for component consumption
 */
export function formatAdmitCardData(admitCard: any): AdmitCardData {
    return {
        id: admitCard.id,
        examGroup: {
            name: admitCard.examGroup.name,
            academicYear: admitCard.examGroup.academicYear
        },
        student: formatStudentForAdmitCard(admitCard.student)
    };
}

/**
 * Transforms Prisma ExamSchedule objects into ExamScheduleData array
 * 
 * @param schedules - Array of Prisma ExamSchedule with subject relation
 * @returns Formatted schedule data array
 */
export function formatExamSchedules(schedules: any[]): ExamScheduleData[] {
    return schedules.map(schedule => ({
        id: schedule.id,
        subject: {
            name: schedule.subject.name,
            code: schedule.subject.code || undefined
        },
        examDate: schedule.examDate,
        startTime: schedule.startTime,
        duration: schedule.duration,
        maxMarks: schedule.maxMarks,
        passingMarks: schedule.passingMarks
    }));
}

/**
 * Transforms a Prisma Student object for marksheet display
 * Same as formatStudentForAdmitCard but kept separate for semantic clarity
 * 
 * @param student - Prisma Student with user and class relations
 * @returns Formatted student data for marksheet display
 */
export function formatStudentForMarksheet(student: any): StudentForMarksheet {
    return formatStudentForAdmitCard(student);
}

/**
 * Safely extracts student name from various possible structures
 * Handles cases where data might come from different sources
 * 
 * @param student - Student object in any format
 * @returns Student name or fallback
 */
export function getStudentName(student: any): string {
    return student?.user?.name || student?.name || 'Unknown Student';
}

/**
 * Safely extracts student email from various possible structures
 * 
 * @param student - Student object in any format
 * @returns Student email or empty string
 */
export function getStudentEmail(student: any): string {
    return student?.user?.email || student?.email || '';
}

/**
 * Safely extracts student profile image from various possible structures
 * 
 * @param student - Student object in any format
 * @returns Profile image URL or null
 */
export function getStudentProfileImage(student: any): string | null {
    return student?.profileImage || student?.user?.image || null;
}

/**
 * Validates that required student data is present for admit card generation
 * 
 * @param student - Student object to validate
 * @returns true if student has all required fields
 */
export function validateStudentForAdmitCard(student: any): boolean {
    return !!(
        student &&
        (student.user?.name || student.name) &&
        student.rollNo &&
        student.admissionNo &&
        student.class
    );
}

/**
 * Gets student's full class designation (e.g., "10-A")
 * 
 * @param student - Student object with class relation
 * @returns Class designation or 'N/A'
 */
export function getStudentClassDesignation(student: any): string {
    if (!student?.class) return 'N/A';
    return `${student.class.name}-${student.class.section}`;
}
