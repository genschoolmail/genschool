import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BookOpen, Calendar, DollarSign, Users, Clock, ClipboardList, Download } from 'lucide-react';

export default async function StudentDashboard() {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    try {
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            include: {
                class: true,
                parent: true,
                attendances: {
                    where: {
                        date: {
                            gte: new Date(new Date().setDate(new Date().getDate() - 30))
                        }
                    },
                    orderBy: { date: 'desc' }
                },
                studentFees: {
                    include: { feeStructure: true },
                    orderBy: { dueDate: 'asc' },
                    take: 1
                },
                admitCards: {
                    where: { status: 'ISSUED' },
                    include: { examGroup: true },
                    orderBy: { generatedAt: 'desc' }
                }
            }
        });

        if (!student) {
            return <div className="p-4 md:p-8 text-center">Student profile not found. Please contact administration.</div>;
        }

        // Get library issues separately
        const libraryIssues = await prisma.issueRecord.findMany({
            where: {
                studentId: student.id,
                returnDate: null
            },
            include: {
                book: true
            }
        }).catch(() => []) as any[];

        // Calculate attendance percentage
        const studentAny = student as any;
        const totalDays = studentAny.attendances?.length || 0;
        const presentDays = studentAny.attendances?.filter((a: any) => a.status === 'PRESENT').length || 0;
        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        // Get pending fees
        const pendingFee = studentAny.studentFees?.[0];

        // Safe check for paidAmount in case it's not in schema yet
        const feeAmount = pendingFee?.feeStructure?.amount || 0;
        const paidAmount = (pendingFee as any)?.paidAmount || 0;
        const dueAmount = feeAmount - paidAmount;

        const issuedAdmitCards = studentAny.admitCards || [];

        return (
            <div className="space-y-4 md:space-y-6">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 lg:p-8 text-white shadow-xl">
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 md:mb-2">Welcome, {session.user.name}!</h1>
                    <p className="text-sm md:text-base text-indigo-100">
                        {studentAny.class ? `Class ${studentAny.class.name}-${studentAny.class.section}` : 'No class assigned'} • Admission No: {student.admissionNo}
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">Attendance</p>
                                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 md:mt-1">{attendancePercentage}%</p>
                            </div>
                            <div className="p-2 md:p-3 bg-green-100 text-green-600 rounded-lg self-start sm:self-auto shrink-0">
                                <Calendar className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">Books Issued</p>
                                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 md:mt-1">{libraryIssues.length}</p>
                            </div>
                            <div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-lg self-start sm:self-auto shrink-0">
                                <BookOpen className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">Pending Fee</p>
                                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 md:mt-1">
                                    ₹{dueAmount > 0 ? dueAmount.toLocaleString() : 0}
                                </p>
                            </div>
                            <div className="p-2 md:p-3 bg-yellow-100 text-yellow-600 rounded-lg self-start sm:self-auto shrink-0">
                                <DollarSign className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-4 md:p-5 lg:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 truncate">Class</p>
                                <p className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mt-0.5 md:mt-1">
                                    {studentAny.class ? `${studentAny.class.name}-${studentAny.class.section}` : 'N/A'}
                                </p>
                            </div>
                            <div className="p-2 md:p-3 bg-purple-100 text-purple-600 rounded-lg self-start sm:self-auto shrink-0">
                                <Users className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parent Information */}
                {studentAny.parent && (
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <Users className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                            Parent/Guardian Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                            {studentAny.parent.fatherName && (
                                <div className="p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Father's Name</p>
                                    <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">{studentAny.parent.fatherName}</p>
                                </div>
                            )}
                            {studentAny.parent.motherName && (
                                <div className="p-3 md:p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Mother's Name</p>
                                    <p className="text-sm md:text-base font-semibold text-slate-900 dark:text-white">{studentAny.parent.motherName}</p>
                                </div>
                            )}
                            {studentAny.parent.phone && (
                                <div className="p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Contact Number</p>
                                    <a href={`tel:${studentAny.parent.phone}`} className="text-sm md:text-base font-semibold text-green-600 dark:text-green-400 hover:underline">
                                        {studentAny.parent.phone}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Recent Attendance */}
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 md:w-5 md:h-5" />
                            Recent Attendance
                        </h3>
                        {studentAny.attendances?.length > 0 ? (
                            <div className="space-y-2 md:space-y-3">
                                {studentAny.attendances.slice(0, 5).map((attendance: any) => (
                                    <div key={attendance.id} className="flex items-center justify-between p-2 md:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <span className="text-xs md:text-sm text-slate-600 dark:text-slate-300 truncate pr-2">
                                            {new Date(attendance.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                        <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium shrink-0 ${attendance.status === 'PRESENT' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            attendance.status === 'ABSENT' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                            {attendance.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-xs md:text-sm">No attendance records yet</p>
                        )}
                    </div>

                    {/* Issued Books */}
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                            Currently Borrowed Books
                        </h3>
                        {libraryIssues.length > 0 ? (
                            <div className="space-y-2 md:space-y-3">
                                {libraryIssues.map((issue: any) => (
                                    <div key={issue.id} className="p-2 md:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white text-xs md:text-sm truncate">
                                                    {issue.book?.title || `Book ID: ${issue.bookId}`}
                                                </p>
                                                <p className="text-[10px] md:text-xs text-slate-500 mt-1">
                                                    Due: {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : 'N/A'}
                                                </p>
                                            </div>
                                            {issue.dueDate && new Date(issue.dueDate) < new Date() && (
                                                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Overdue</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-xs md:text-sm">No books currently borrowed</p>
                        )}
                    </div>
                </div>

                {/* Admit Cards Section */}
                {issuedAdmitCards.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                <ClipboardList className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                                Active Admit Cards
                            </h3>
                            <a href="/student/exam" className="text-xs font-medium text-indigo-600 hover:underline">View All Exams</a>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                            {issuedAdmitCards.map((card: any) => (
                                <div key={card.id} className="p-4 bg-gradient-to-br from-indigo-50 to-white dark:from-slate-700/50 dark:to-slate-800 border border-indigo-100 dark:border-slate-600 rounded-xl hover:shadow-md transition-all group">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="p-2 bg-white dark:bg-slate-700 rounded-lg shadow-sm group-hover:scale-110 transition-transform">
                                            <span className="text-xl">🎫</span>
                                        </div>
                                        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                            {card.examGroup.name}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{card.examGroup.name} Admit Card</h4>
                                    <p className="text-[10px] text-slate-500 mb-4 italic">Download and carry this card to the examination hall.</p>
                                    <a
                                        href={`/student/admit-card/${card.id}`}
                                        className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download Admit Card
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-lg md:rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <h3 className="text-base md:text-lg font-semibold text-slate-900 dark:text-white mb-3 md:mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 md:gap-3 lg:gap-4">
                        <a href="/student/id-card" className="p-3 md:p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all text-center touch-target border-2 border-blue-200 dark:border-blue-700 hover:shadow-md">
                            <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-xl md:text-2xl lg:text-3xl">🎫</span>
                            </div>
                            <p className="text-xs md:text-sm font-bold text-blue-700 dark:text-blue-400">My ID Card</p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">View & Download</p>
                        </a>
                        <a href="/student/finance/fees" className="p-3 md:p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors text-center touch-target">
                            <DollarSign className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto text-indigo-600 mb-1 md:mb-2" />
                            <p className="text-xs md:text-sm font-medium text-slate-900 dark:text-white">View Fees</p>
                        </a>
                        <a href="/student/library" className="p-3 md:p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors text-center touch-target">
                            <BookOpen className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto text-purple-600 mb-1 md:mb-2" />
                            <p className="text-xs md:text-sm font-medium text-slate-900 dark:text-white">My Books</p>
                        </a>
                        <a href="/student/attendance" className="p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-center touch-target">
                            <Calendar className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 mx-auto text-green-600 mb-1 md:mb-2" />
                            <p className="text-xs md:text-sm font-medium text-slate-900 dark:text-white">Attendance</p>
                        </a>
                    </div>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("DEBUG: Dashboard Error Full Object:", error);
        console.error("DEBUG: Dashboard Error Message:", error.message);
        console.error("DEBUG: Dashboard Error Stack:", error.stack);
        return (
            <div className="p-6 text-center text-red-600">
                <p className="font-bold">Failed to load dashboard.</p>
                <p className="text-sm mt-2">{error.message || 'Unknown error'}</p>
                <p className="text-xs text-slate-400 mt-4">Please contact administration.</p>
            </div>
        );
    }
}
