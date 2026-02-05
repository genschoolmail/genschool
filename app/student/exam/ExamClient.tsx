'use client';

import React, { useState } from 'react';
import ExamTabs from './ExamTabs';
import { FileText, Award, Download, Calendar, Clock, AlertCircle, CheckCircle, BookOpen, TrendingUp, ClipboardList } from 'lucide-react';
import Link from 'next/link';

interface ExamClientProps {
    admitCards: any[];
    results: any[];
    student: any;
    marksheetData: {
        latestExamGroup: any;
        hasResults: boolean;
    } | null;
}

export default function ExamClient({ admitCards, results, student, marksheetData }: ExamClientProps) {
    const [activeTab, setActiveTab] = useState('admit-cards');

    // Group results by academic year
    const resultsByYear: { [key: string]: any[] } = {};
    results.forEach(result => {
        const year = result.examSchedule?.class?.academicYear || '2024-2025';
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
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-xl">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">📝 Exam Center</h1>
                <p className="text-sm md:text-base text-indigo-100">Admit cards, results & marksheets - all in one place</p>
            </div>

            {/* Tabs */}
            <ExamTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* Content */}
            <div className="min-h-[400px]">
                {/* Admit Cards Tab */}
                {activeTab === 'admit-cards' && (
                    <div className="space-y-4">
                        {admitCards.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No Admit Cards Found</h3>
                                <p className="text-slate-500">You don't have any admit cards issued yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                {admitCards.map((card) => {
                                    const now = new Date();
                                    const isIssued = card.status === 'ISSUED';
                                    const isBlocked = card.status === 'BLOCKED';
                                    const start = card.downloadStartDate ? new Date(card.downloadStartDate) : null;
                                    const end = card.downloadEndDate ? new Date(card.downloadEndDate) : null;
                                    const isStarted = !start || now >= start;
                                    const isEnded = end && now > end;
                                    const canDownload = isIssued && !isBlocked && isStarted && !isEnded;

                                    let statusMessage = '';
                                    let statusColor = '';

                                    if (isBlocked) {
                                        statusMessage = 'Blocked';
                                        statusColor = 'text-red-600 bg-red-50 border-red-200';
                                    } else if (!isIssued) {
                                        statusMessage = 'Not Issued';
                                        statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-200';
                                    } else if (!isStarted) {
                                        statusMessage = `Available ${start?.toLocaleDateString()}`;
                                        statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
                                    } else if (isEnded) {
                                        statusMessage = 'Expired';
                                        statusColor = 'text-slate-600 bg-slate-50 border-slate-200';
                                    } else {
                                        statusMessage = 'Available';
                                        statusColor = 'text-green-600 bg-green-50 border-green-200';
                                    }

                                    return (
                                        <div key={card.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition-all">
                                            <div className="p-5">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                                            {card.examGroup?.name || 'Exam'}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">{card.examGroup?.academicYear}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                                                        {statusMessage}
                                                    </span>
                                                </div>

                                                <div className="space-y-2 mb-4">
                                                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                        <Calendar className="w-4 h-4 mr-2" />
                                                        <span>Starts: {card.examGroup?.examStartDate ? new Date(card.examGroup.examStartDate).toLocaleDateString() : 'TBA'}</span>
                                                    </div>
                                                </div>

                                                {canDownload ? (
                                                    <Link
                                                        href={`/student/admit-card/${card.id}`}
                                                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        View & Download
                                                    </Link>
                                                ) : (
                                                    <button disabled className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 text-slate-400 rounded-lg font-medium cursor-not-allowed">
                                                        <Download className="w-4 h-4" />
                                                        Unavailable
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Results Tab */}
                {activeTab === 'results' && (
                    <div className="space-y-6">
                        {/* Student Info Card */}
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 md:p-6 text-white shadow-lg">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm text-purple-100">Student Name</p>
                                    <p className="text-lg font-bold">{student?.user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-100">Class</p>
                                    <p className="text-lg font-bold">
                                        {student?.class ? `${student.class.name}-${student.class.section}` : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-purple-100">Admission No</p>
                                    <p className="text-lg font-bold">{student?.admissionNo || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {Object.keys(resultsByYear).length > 0 ? (
                            Object.entries(resultsByYear).map(([year, yearResults]) => {
                                const totalMarks = yearResults.reduce((sum, r) => sum + (r.marksObtained || 0), 0);
                                const totalMaxMarks = yearResults.reduce((sum, r) => sum + (r.examSchedule?.maxMarks || 0), 0);
                                const avgPercentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks * 100).toFixed(2) : '0';

                                return (
                                    <div key={year} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                        <div className="bg-slate-50 dark:bg-slate-700/50 px-4 md:px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <div>
                                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Academic Year: {year}</h2>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">{yearResults.length} exams</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                                <span className="text-xl md:text-2xl font-bold text-indigo-600">{avgPercentage}%</span>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Exam</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-600 dark:text-slate-300">Subject</th>
                                                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">Marks</th>
                                                        <th className="px-4 py-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {yearResults.map(result => {
                                                        const gradeInfo = calculateGrade(result.marksObtained || 0, result.examSchedule?.maxMarks || 100);
                                                        const isPassing = (result.marksObtained || 0) >= (result.examSchedule?.passingMarks || 0);

                                                        return (
                                                            <tr key={result.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white text-sm">
                                                                    {result.examSchedule?.examGroup?.name || 'Exam'}
                                                                </td>
                                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-sm">
                                                                    <div className="flex items-center gap-2">
                                                                        <BookOpen className="w-4 h-4 text-purple-600" />
                                                                        {result.examSchedule?.subject?.name || 'Subject'}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`font-bold ${isPassing ? 'text-green-600' : 'text-red-600'}`}>
                                                                        {result.marksObtained || 0}
                                                                    </span>
                                                                    <span className="text-slate-500 text-sm"> / {result.examSchedule?.maxMarks || 0}</span>
                                                                </td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${gradeInfo.color}`}>
                                                                        {result.grade || gradeInfo.grade}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                                <Award className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Results Yet</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Your exam results will appear here once they are published.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Marksheet Tab */}
                {activeTab === 'marksheet' && (
                    <div className="space-y-6">
                        {marksheetData?.hasResults ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                                <ClipboardList className="w-16 h-16 mx-auto text-indigo-500 mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                    {marksheetData.latestExamGroup?.name || 'Exam'} - Report Card
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    View and download your official report card / marksheet
                                </p>
                                <Link
                                    href="/student/result"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors shadow-lg"
                                >
                                    <Download className="w-5 h-5" />
                                    View Marksheet
                                </Link>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 p-12 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                                <AlertCircle className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No Marksheet Available</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Your marksheet will appear here once exam results are published.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
