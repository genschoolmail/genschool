import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookOpen, TrendingUp, Award, BarChart3 } from 'lucide-react';

export default async function StudentAcademicsPage() {
    try {
        const session = await auth();

        if (!session || session.user.role !== 'STUDENT') {
            redirect('/login');
        }

        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            include: {
                class: {
                    include: {
                        subjects: true
                    }
                },
                examResults: {
                    include: {
                        examSchedule: {
                            include: {
                                subject: true,
                                examGroup: true
                            }
                        }
                    },
                    orderBy: { enteredAt: 'desc' },
                    take: 20
                }
            }
        });

        if (!student) {
            return <div className="p-8 text-center">Student profile not found</div>;
        }

        // Calculate overall statistics
        const totalExams = student.examResults.length;
        const totalMarks = student.examResults.reduce((sum: number, r: any) => sum + (r.marksObtained || 0), 0);
        const totalMaxMarks = student.examResults.reduce((sum: number, r: any) => sum + (r.examSchedule?.maxMarks || 0), 0);
        const overallPercentage = totalMaxMarks > 0 ? ((totalMarks / totalMaxMarks) * 100).toFixed(1) : 0;

        // Group by subject
        const resultsBySubject = student.examResults.reduce((acc: any, result: any) => {
            const subjectName = result.examSchedule?.subject?.name || 'Unknown';
            if (!acc[subjectName]) {
                acc[subjectName] = [];
            }
            acc[subjectName].push(result);
            return acc;
        }, {});

        return (
            <div className="space-y-4 md:space-y-6">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">My Academics</h1>
                    <p className="text-sm md:text-base text-purple-100">Track your performance & results</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-purple-200 dark:border-purple-700">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
                            <span className="text-xs font-medium text-purple-600">Overall</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-purple-600">{overallPercentage}%</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average Score</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center justify-between mb-2">
                            <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
                            <span className="text-xs font-medium text-blue-600">Subjects</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-blue-600">{student.class?.subjects.length || 0}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Subjects</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-green-200 dark:border-green-700">
                        <div className="flex items-center justify-between mb-2">
                            <Award className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                            <span className="text-xs font-medium text-green-600">Exams</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-bold text-green-600">{totalExams}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Completed</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-5 shadow-sm border border-orange-200 dark:border-orange-700">
                        <div className="flex items-center justify-between mb-2">
                            <BarChart3 className="w-6 h-6 md:w-8 md:h-8 text-orange-600" />
                            <span className="text-xs font-medium text-orange-600">Marks</span>
                        </div>
                        <p className="text-lg md:text-2xl font-bold text-orange-600">{totalMarks}/{totalMaxMarks}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Scored</p>
                    </div>
                </div>

                {/* Subject-wise Performance */}
                {Object.keys(resultsBySubject).length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 md:p-6 shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Subject-wise Performance</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(resultsBySubject).map(([subject, results]: [string, any]) => {
                                const subjectMarks = results.reduce((sum: number, r: any) => sum + r.obtainedMarks, 0);
                                const subjectMaxMarks = results.reduce((sum: number, r: any) => sum + r.maxMarks, 0);
                                const subjectPercentage = subjectMaxMarks > 0 ? ((subjectMarks / subjectMaxMarks) * 100).toFixed(1) : 0;

                                return (
                                    <div key={subject} className="p-4 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-700/50 dark:to-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-700">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-slate-800 dark:text-white">{subject}</h4>
                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${Number(subjectPercentage) >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                                                Number(subjectPercentage) >= 60 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                                                }`}>
                                                {subjectPercentage}%
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">Total Marks</span>
                                                <span className="font-semibold text-slate-900 dark:text-white">{subjectMarks} / {subjectMaxMarks}</span>
                                            </div>
                                            <div className="h-2 bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${Number(subjectPercentage) >= 80 ? 'bg-green-500' :
                                                        Number(subjectPercentage) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${subjectPercentage}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{results.length} exam(s) taken</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Exam Results */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Exam Results</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Last {Math.min(student.examResults.length, 20)} exams</p>
                    </div>

                    {student.examResults.length > 0 ? (
                        <div className="p-4 md:p-6">
                            <div className="space-y-3">
                                {student.examResults.map((result: any) => {
                                    const marksObtained = result.marksObtained || 0;
                                    const maxMarks = result.examSchedule?.maxMarks || 100;
                                    const percentage = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;

                                    return (
                                        <div key={result.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:shadow-md transition-all">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm md:text-base">
                                                        {result.examSchedule?.subject?.name || 'Subject'}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        {result.enteredAt ? new Date(result.enteredAt).toLocaleDateString('en-IN', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        }) : 'N/A'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                                                            {marksObtained} / {maxMarks}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {percentage.toFixed(1)}%
                                                        </p>
                                                    </div>
                                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg ${percentage >= 80
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                                                        : percentage >= 60
                                                            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                                                        }`}>
                                                        {result.grade || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No Exam Results</h3>
                            <p className="text-slate-500 dark:text-slate-400">Your exam results will appear here once published</p>
                        </div>
                    )}
                </div>
            </div>
        );
    } catch (error) {
        console.error('My Academics Error:', error);
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Unable to Load Academics</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-4">Something went wrong while loading your academic data. Please try again.</p>
                    <a href="/student/academics" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                        Retry
                    </a>
                </div>
            </div>
        );
    }
}
