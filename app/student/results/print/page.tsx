import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import MarksheetTemplate from '@/components/MarksheetTemplate';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function StudentResultPrintPage({
    searchParams
}: {
    searchParams: { year?: string }
}) {
    const session = await auth();
    if (!session || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            class: true,
            examResults: {
                where: {
                    examSchedule: {
                        examGroup: {
                            resultsPublished: true
                        }
                    }
                },
                include: {
                    examSchedule: {
                        include: {
                            examGroup: true,
                            subject: true,
                            class: true
                        }
                    }
                }
            }
        }
    });

    if (!student || !searchParams.year) {
        notFound();
    }

    // Filter results for the specific year
    const yearResults = student.examResults.filter(r =>
        (r.examSchedule.class.academicYear || '2024-2025') === searchParams.year
    );

    if (yearResults.length === 0) {
        notFound();
    }

    // Since we group by year, we can take the first exam's group info or aggregate
    // For a single "Marksheet", we usually represent one Exam Term or the whole year
    // The current template expects ONE examGroup. Let's group by examGroup as well if needed.
    // For now, let's just use the first exam group found for that year to get the year string.

    const examGroup = yearResults[0].examSchedule.examGroup;
    const schoolSettings = await prisma.school.findFirst({
        where: { id: student.schoolId }
    });

    const gradingSystem = await prisma.gradeSystem.findMany({
        where: {
            schoolId: student.schoolId,
            // Optional: academicYear match if needed, but usually global for now or matches exam group
            academicYear: examGroup.academicYear || '2024-2025'
        },
        orderBy: { order: 'asc' }
    });

    const results = yearResults.map(r => ({
        subject: {
            name: r.examSchedule.subject.name,
            code: r.examSchedule.subject.code || undefined
        },
        maxMarks: r.examSchedule.maxMarks,
        marksObtained: r.marksObtained,
        grade: r.grade,
        remarks: r.remarks
    }));

    const totalMax = results.reduce((sum, r) => sum + r.maxMarks, 0);
    const totalObtained = results.reduce((sum, r) => sum + r.marksObtained, 0);
    const percentage = (totalObtained / totalMax) * 100;

    const summary = {
        totalMax,
        totalObtained,
        percentage,
        division: percentage >= 60 ? 'First' : percentage >= 45 ? 'Second' : percentage >= 33 ? 'Third' : 'Fail',
        result: percentage >= 33 ? 'PASS' as const : 'FAIL' as const
    };

    return (
        <div className="bg-slate-50 min-h-screen p-0 md:p-8">
            <div className="max-w-[210mm] mx-auto bg-white">
                <MarksheetTemplate
                    student={{
                        ...student,
                        profileImage: student.image,
                        class: student.class!
                    }}
                    examGroup={{
                        name: `Academic Report - ${searchParams.year}`,
                        academicYear: searchParams.year
                    }}
                    results={results}
                    summary={summary}
                    schoolSettings={{
                        ...(schoolSettings as any),
                        gradingSystem
                    }}
                />
            </div>

            {/* Auto Print Script */}
            <script dangerouslySetInnerHTML={{ __html: 'window.onload = () => { setTimeout(() => window.print(), 500); }' }} />
        </div>
    );
}
