import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ExamClient from './ExamClient';

export default async function StudentExamPage() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'STUDENT') {
            redirect('/login');
        }

        // Find student record
        const student = await prisma.student.findFirst({
            where: { userId: session.user.id },
            include: {
                user: true,
                class: true
            }
        });

        if (!student) {
            return (
                <div className="p-8 text-center">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Student Profile Not Found</h2>
                    <p className="text-slate-500 mt-2">Could not find student details associated with your account.</p>
                </div>
            );
        }

        // Fetch admit cards    // Find admit cards - only issued ones
        const admitCards = await prisma.admitCard.findMany({
            where: { studentId: student.id, status: 'ISSUED' },
            include: {
                examGroup: true
            },
            orderBy: {
                generatedAt: 'desc'
            }
        });

        // Fetch published results
        const results = await prisma.examResult.findMany({
            where: {
                studentId: student.id,
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
            },
            orderBy: { enteredAt: 'desc' }
        });

        // Check for marksheet data
        let marksheetData = null;
        if (student.classId) {
            const activeExamGroups = await prisma.examGroup.findMany({
                where: {
                    examSchedules: {
                        some: { classId: student.classId }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            const latestExamGroup = activeExamGroups[0];
            if (latestExamGroup) {
                const hasResults = await prisma.examResult.count({
                    where: {
                        studentId: student.id,
                        examSchedule: {
                            examGroupId: latestExamGroup.id
                        }
                    }
                });
                marksheetData = {
                    latestExamGroup,
                    hasResults: hasResults > 0
                };
            }
        }

        return (
            <ExamClient
                admitCards={admitCards}
                results={results}
                student={student}
                marksheetData={marksheetData}
            />
        );
    } catch (error) {
        console.error('Exam Page Error:', error);
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Unable to Load Exam Center</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-4">Something went wrong. Please try again.</p>
                    <a href="/student/exam" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                        Retry
                    </a>
                </div>
            </div>
        );
    }
}
