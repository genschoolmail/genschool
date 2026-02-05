import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Award, TrendingUp, BookOpen, Calendar, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function StudentResultsPage() {
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
                },
                orderBy: { examSchedule: { examDate: 'desc' } }
            }
        }
    });

    if (!student) {
        return <div className="p-4">Student profile not found.</div>;
    }

    // Group results by academic year
    const resultsByYear: { [key: string]: typeof student.examResults } = {};
    student.examResults.forEach(result => {
        const year = result.examSchedule.class.academicYear || '2024-2025';
        if (!resultsByYear[year]) {
            resultsByYear[year] = [];
        }
        resultsByYear[year].push(result);
    });

    const calculateGrade = (marksObtained: number, maxMarks: number) => {
        const percentage = (marksObtained / maxMarks) * 100;
        if (percentage >= 90) return { grade: 'A+', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' };
        if (percentage >= 80) return { grade: 'A', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300' };
        if (percentage >= 70) return { grade: 'B+', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' };
        if (percentage >= 60) return { grade: 'B', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300' };
        if (percentage >= 50) return { grade: 'C', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' };
        if (percentage >= 40) return { grade: 'D', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' };
        return { grade: 'F', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Exam Results</h1>
                <p className="text-slate-500">View your published exam results and performance</p>
            </div>

            {/* Student Info Card */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-indigo-100">Student Name</p>
                        <p className="text-lg font-bold">{session.user.name}</p>
                    </div>
                    <div>
                        <p className="text-sm text-indigo-100">Class</p>
                        <p className="text-lg font-bold">
                            {student.class ? `${student.class.name}-${student.class.section}` : 'N/A'}
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-indigo-100">Admission No</p>
                        <p className="text-lg font-bold">{student.admissionNo}</p>
                    </div>
                </div>
            </div>

            {/* Results by Academic Year */}
            {Object.keys(resultsByYear).length > 0 ? (
                <div className="space-y-6">
                    {Object.entries(resultsByYear).map(([year, yearResults]) => {
                        const totalMarks = yearResults.reduce((sum, r) => sum + r.marksObtained, 0);
                        const totalMaxMarks = yearResults.reduce((sum, r) => sum + r.examSchedule.maxMarks, 0);
                        const avgPercentage = (totalMarks / totalMaxMarks * 100).toFixed(2);

                        return (
                            <div key={year} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="bg-slate-50 dark:bg-slate-700/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academic Year: {year}</h2>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{yearResults.length} exams</p>
                                    </div>
                                    <div className="text-right flex items-center gap-4">
                                        <div className="flex flex-col items-end">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                                <span className="text-2xl font-bold text-indigo-600">{avgPercentage}%</span>
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Average</p>
                                        </div>
                                        <a
                                            href={`/student/results/print?year=${year}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Marksheet
                                        </a>
                                    </div>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Exam</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Subject</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Date</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">Marks</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">Grade</th>
                                                <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">%</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {yearResults.map(result => {
                                                const percentage = (result.marksObtained / result.examSchedule.maxMarks) * 100;
                                                const gradeInfo = result.grade || calculateGrade(result.marksObtained, result.examSchedule.maxMarks).grade;
                                                const colorClass = calculateGrade(result.marksObtained, result.examSchedule.maxMarks).color;
                                                const isPassing = result.marksObtained >= result.examSchedule.passingMarks;

                                                return (
                                                    <tr key={result.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                                                            {result.examSchedule.examGroup.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                                                            <div className="flex items-center gap-2">
                                                                <BookOpen className="w-4 h-4 text-purple-600" />
                                                                {result.examSchedule.subject.name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                                                            <div className="flex items-center gap-2">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(result.examSchedule.examDate).toLocaleDateString()}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`font-bold ${isPassing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                                                {result.marksObtained}
                                                            </span>
                                                            <span className="text-slate-500 text-sm"> / {result.examSchedule.maxMarks}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center">
                                                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${colorClass}`}>
                                                                {gradeInfo}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-semibold text-slate-900 dark:text-white">
                                                            {percentage.toFixed(1)}%
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                    <Award className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Results Yet</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Your exam results will appear here once they are published by your teachers.
                    </p>
                </div>
            )}
        </div>
    );
}
