import React from 'react';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Calendar, Download, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default async function StudentAdmitCardPage() {
    const session = await auth();
    const user = session?.user;

    if (!user) {
        return <div>Please log in to view admit cards.</div>;
    }

    // Find student record
    const student = await prisma.student.findFirst({
        where: { userId: user.id }
    });

    if (!student) {
        return (
            <div className="p-8 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Student Profile Not Found</h2>
                <p className="text-slate-500 mt-2">Could not find student details associated with your account.</p>
            </div>
        );
    }

    // Find admit cards
    const admitCards = await prisma.admitCard.findMany({
        where: { studentId: student.id },
        include: {
            examGroup: true
        },
        orderBy: {
            examGroup: {
                examStartDate: 'desc' // Show upcoming/recent exams first
            }
        }
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">My Admit Cards</h1>
                <p className="text-slate-500 mt-1">View and download your exam admit cards</p>
            </div>

            {admitCards.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-700">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">No Admit Cards Found</h3>
                    <p className="text-slate-500">You don't have any admit cards issued yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {admitCards.map((card) => {
                        const now = new Date();
                        const isIssued = card.status === 'ISSUED';
                        const isBlocked = card.status === 'BLOCKED';

                        // Check download window
                        const start = card.downloadStartDate ? new Date(card.downloadStartDate) : null;
                        const end = card.downloadEndDate ? new Date(card.downloadEndDate) : null;

                        const isStarted = !start || now >= start;
                        const isEnded = end && now > end;

                        const canDownload = isIssued && !isBlocked && isStarted && !isEnded;

                        let statusMessage = '';
                        let statusColor = '';

                        if (isBlocked) {
                            statusMessage = 'Blocked by Admin';
                            statusColor = 'text-red-600 bg-red-50 border-red-200';
                        } else if (!isIssued) {
                            statusMessage = 'Not Issued Yet';
                            statusColor = 'text-yellow-600 bg-yellow-50 border-yellow-200';
                        } else if (!isStarted) {
                            statusMessage = `Available from ${start?.toLocaleDateString()}`;
                            statusColor = 'text-blue-600 bg-blue-50 border-blue-200';
                        } else if (isEnded) {
                            statusMessage = 'Download Expired';
                            statusColor = 'text-slate-600 bg-slate-50 border-slate-200';
                        } else {
                            statusMessage = 'Available for Download';
                            statusColor = 'text-green-600 bg-green-50 border-green-200';
                        }

                        return (
                            <div key={card.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                                                {card.examGroup.name}
                                            </h3>
                                            <p className="text-sm text-slate-500">{card.examGroup.academicYear}</p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                                            {statusMessage}
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span>
                                                Exam Starts: {card.examGroup.examStartDate ? new Date(card.examGroup.examStartDate).toLocaleDateString() : 'TBA'}
                                            </span>
                                        </div>
                                        {end && (
                                            <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
                                                <Clock className="w-4 h-4 mr-2" />
                                                <span>
                                                    Download until: {end.toLocaleDateString()}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {canDownload ? (
                                        <Link
                                            href={`/student/admit-card/${card.id}`}
                                            className="block w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-center rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            View & Download
                                        </Link>
                                    ) : (
                                        <button
                                            disabled
                                            className="block w-full py-2.5 bg-slate-100 text-slate-400 text-center rounded-lg font-medium cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download Unavailable
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
