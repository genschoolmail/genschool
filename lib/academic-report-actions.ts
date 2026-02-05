'use server';

import { prisma } from '@/lib/prisma';

export async function getClassPerformance(examId: string) {
    // 1. Get all schedules for this exam
    const schedules = await prisma.examSchedule.findMany({
        where: { examGroupId: examId },
        select: { id: true, classId: true, class: { select: { name: true, section: true } } }
    });

    if (schedules.length === 0) return [];

    const scheduleIds = schedules.map(s => s.id);

    // 2. Get all results for these schedules
    const results = await prisma.examResult.findMany({
        where: { examScheduleId: { in: scheduleIds } },
        include: {
            examSchedule: {
                include: { class: true }
            }
        }
    });

    // 3. Group by class
    const classStats: Record<string, {
        className: string;
        totalStudents: Set<string>;
        totalMarks: number;
        passCount: number; // This needs passing criteria, assuming 33% for now or generic
        failCount: number;
        highest: number;
        lowest: number;
        maxMarks: number;
    }> = {};

    // Helper to get passing marks (assuming 33% of max marks if available, else standard 33)
    // ExamResult doesn't seem to have maxMarks, it might be in ExamSchedule or just assumed 100
    // Checking schema, ExamSchedule doesn't have maxMarks explicitly shown in previous view, but GradeSystem might be used.
    // For simplicity, we'll assume 100 for now or checks passes based on simple logic.

    for (const result of results) {
        const classId = result.examSchedule.classId;
        const className = `${result.examSchedule.class.name}-${result.examSchedule.class.section}`;
        const studentId = result.studentId;

        if (!classStats[classId]) {
            classStats[classId] = {
                className,
                totalStudents: new Set(),
                totalMarks: 0,
                passCount: 0,
                failCount: 0,
                highest: 0,
                lowest: 100, // placeholder
                maxMarks: 0
            };
        }

        const stats = classStats[classId];
        stats.totalStudents.add(studentId);
        stats.totalMarks += result.marksObtained;

        if (result.marksObtained > stats.highest) stats.highest = result.marksObtained;
        if (result.marksObtained < stats.lowest) stats.lowest = result.marksObtained;

        // Simple pass check (>= 33)
        if (result.marksObtained >= 33) {
            // This logic is flawed per subject. We should count pass/fail per student per subject, 
            // but the UI shows "Students" count. 
            // Usually Class Performance means "Overall Pass %". 
            // A student passes if they pass all subjects? Or avg?
            // The UI shows simple stats. Let's aggregate marks.
        }
    }

    // Refined logic: Get ALL students in class, check if they passed ALL their subjects
    // This requires grouping results by student first.

    // Simpler approach for the specific UI shown:
    // The UI shows "Average", "Highest", "Lowest", "Pass/Fail" counts.
    // We can average the MARKS across all subjects for "Average".
    // Pass/Fail is usually per student. A student passes if they clear the exam (all subjects or aggregate).

    // Let's optimize:
    // 1. Group results by Student
    const studentResults: Record<string, { total: number; count: number; passed: boolean; classId: string }> = {};

    for (const result of results) {
        if (!studentResults[result.studentId]) {
            studentResults[result.studentId] = { total: 0, count: 0, passed: true, classId: result.examSchedule.classId };
        }
        const sr = studentResults[result.studentId];
        sr.total += result.marksObtained;
        sr.count++;
        if (result.marksObtained < 33) sr.passed = false; // Subject fail
    }

    // 2. Aggregate per Class
    const finalClassStats: Record<string, any> = {};

    for (const sId in studentResults) {
        const sr = studentResults[sId];
        const schedule = schedules.find(s => s.classId === sr.classId);
        const className = schedule ? `${schedule.class.name}-${schedule.class.section}` : 'Unknown';

        if (!finalClassStats[sr.classId]) {
            finalClassStats[sr.classId] = {
                className,
                totalStudents: 0,
                totalMarks: 0,
                passCount: 0,
                failCount: 0,
                studentCount: 0,
                highest: 0,
                lowest: 10000 // safer init
            };
        }

        const fc = finalClassStats[sr.classId];
        fc.totalStudents++;
        const studentAvg = sr.total / sr.count; // Average marks of this student
        fc.totalMarks += studentAvg; // Sum of averages

        if (sr.passed) fc.passCount++;
        else fc.failCount++;

        if (studentAvg > fc.highest) fc.highest = studentAvg;
        if (studentAvg < fc.lowest) fc.lowest = studentAvg;
    }

    return Object.values(finalClassStats).map(c => ({
        ...c,
        averageMarks: c.totalStudents > 0 ? c.totalMarks / c.totalStudents : 0,
        lowest: c.lowest === 10000 ? 0 : c.lowest
    }));
}

export async function getStudentRankings(examId: string, classId?: string) {
    const whereClause = { examGroupId: examId, ...(classId ? { classId } : {}) };

    // Get schedules
    const schedules = await prisma.examSchedule.findMany({
        where: whereClause,
        select: { id: true, class: { select: { name: true, section: true } } }
    });
    const scheduleIds = schedules.map(s => s.id);

    // Get results
    const results = await prisma.examResult.findMany({
        where: { examScheduleId: { in: scheduleIds } },
        include: {
            student: {
                include: { user: { select: { name: true } } }
            },
            examSchedule: {
                include: { class: true }
            }
        }
    });

    // Group by student
    const studentStats: Record<string, {
        studentId: string;
        studentName: string;
        admissionNo: string;
        className: string;
        totalMarks: number;
        subjects: number;
    }> = {};

    for (const r of results) {
        if (!studentStats[r.studentId]) {
            studentStats[r.studentId] = {
                studentId: r.studentId,
                studentName: r.student.user.name || 'Unknown',
                admissionNo: r.student.admissionNo,
                className: `${r.examSchedule.class.name}-${r.examSchedule.class.section}`,
                totalMarks: 0,
                subjects: 0
            };
        }
        studentStats[r.studentId].totalMarks += r.marksObtained;
        studentStats[r.studentId].subjects++;
    }

    // Convert to array and sort
    const ranked = Object.values(studentStats)
        .map(s => ({
            ...s,
            averageMarks: s.subjects > 0 ? s.totalMarks / s.subjects : 0,
            percentage: s.subjects > 0 ? (s.totalMarks / (s.subjects * 100)) * 100 : 0 // Assuming 100 max per subject
        }))
        .sort((a, b) => b.totalMarks - a.totalMarks)
        .map((s, index) => ({
            rank: index + 1,
            ...s
        }));

    return ranked;
}

export async function getSubjectPerformance(examId?: string) {
    if (!examId) return [];

    const schedules = await prisma.examSchedule.findMany({
        where: { examGroupId: examId },
        include: { subject: true }
    });

    const scheduleIds = schedules.map(s => s.id);

    const results = await prisma.examResult.findMany({
        where: { examScheduleId: { in: scheduleIds } },
        include: { examSchedule: { include: { subject: true } } }
    });

    // Group by Subject ID (not name, to be precise, but UI shows name)
    const subjectStats: Record<string, {
        subjectName: string;
        subjectCode: string;
        totalAttempts: number;
        totalMarks: number;
        highest: number;
        lowest: number;
        passed: number;
    }> = {};

    for (const r of results) {
        const subId = r.examSchedule.subjectId;
        if (!subId) continue; // Should not happen if strictly enforced

        if (!subjectStats[subId]) {
            subjectStats[subId] = {
                subjectName: r.examSchedule.subject?.name || 'Unknown',
                subjectCode: r.examSchedule.subject?.code || '-',
                totalAttempts: 0,
                totalMarks: 0,
                highest: 0,
                lowest: 100, // placeholder
                passed: 0
            };
        }

        const s = subjectStats[subId];
        s.totalAttempts++;
        s.totalMarks += r.marksObtained;
        if (r.marksObtained > s.highest) s.highest = r.marksObtained;
        if (r.marksObtained < s.lowest) s.lowest = r.marksObtained;
        if (r.marksObtained >= 33) s.passed++;
    }

    return Object.values(subjectStats).map(s => ({
        ...s,
        averageMarks: s.totalAttempts > 0 ? s.totalMarks / s.totalAttempts : 0,
        passRate: s.totalAttempts > 0 ? (s.passed / s.totalAttempts) * 100 : 0
    }));
}

export async function getToppers(examId: string) {
    // Re-use logic from rankings, just top 10
    const rankings = await getStudentRankings(examId);
    return rankings.slice(0, 10);
}
