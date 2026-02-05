
import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import BackButton from '@/components/ui/BackButton';
import {
    FileText, Download, Calendar, UserCircle, Mail, Phone,
    BookOpen, FileBarChart, GraduationCap, Home, Users, ArrowRight, CheckCircle2, IndianRupee
} from 'lucide-react';

export default async function StudentProfilePage({
    params
}: {
    params: Promise<{ id: string }> | { id: string }
}) {
    const resolvedParams = params instanceof Promise ? await params : params;

    const student: any = await prisma.student.findUnique({
        where: { id: resolvedParams.id },
        include: {
            user: true,
            class: true,
            parent: true,
            attendances: {
                orderBy: { date: 'desc' },
                take: 30
            },
            studentFees: {
                include: {
                    feeStructure: true,
                    payments: {
                        orderBy: { date: 'desc' }
                    }
                }
            },
            examResults: {
                include: {
                    examSchedule: {
                        include: {
                            examGroup: true,
                            subject: true
                        }
                    }
                },
                orderBy: { enteredAt: 'desc' },
                take: 10
            },
            wallet: true
        }
    });

    if (!student) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">Student Not Found</h1>
            </div>
        );
    }

    // Calculate attendance percentage
    const attendance = student.attendances || [];
    const totalDays = attendance.length;
    const presentDays = attendance.filter((a: any) => a.status === 'PRESENT').length;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

    // Calculate fee status
    const studentFees = student.studentFees || [];
    const totalFees = studentFees.reduce((sum: number, fa: any) => sum + (fa.feeStructure?.amount || 0), 0);
    const totalPaid = studentFees.reduce((sum: number, fa: any) =>
        sum + (fa.payments || []).reduce((pSum: number, p: any) => pSum + (p.amount || 0), 0), 0
    );
    const pendingFees = totalFees - totalPaid;
    const walletBalance = student.wallet?.balance || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <BackButton href="/admin/students" />
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">Student Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Complete academic and personal information
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href={`/admin/students/${student.id}/edit`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors touch-target"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 rounded-xl w-full justify-start overflow-x-auto scrollbar-hide">
                    <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-600 dark:data-[state=active]:bg-indigo-900/20 dark:data-[state=active]:text-indigo-400 whitespace-nowrap">
                        <Users className="w-4 h-4 mr-2" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="finance" className="rounded-lg data-[state=active]:bg-green-50 data-[state=active]:text-green-600 dark:data-[state=active]:bg-green-900/20 dark:data-[state=active]:text-green-400 whitespace-nowrap">
                        <IndianRupee className="w-4 h-4 mr-2" />
                        Finance & Fees
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6 sticky top-6">
                                <div className="flex flex-col items-center text-center">
                                    {student.user.image ? (
                                        <img
                                            src={student.user.image}
                                            alt={student.user.name || 'Student'}
                                            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900 shadow-lg"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border-4 border-indigo-100 dark:border-indigo-900 shadow-lg">
                                            <UserCircle className="w-20 h-20 text-white" />
                                        </div>
                                    )}
                                    <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
                                        {student.user?.name || 'Unknown Student'}
                                    </h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Roll No: {student.rollNumber || 'N/A'}
                                    </p>
                                    <span className="mt-2 px-4 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                                        {student.class ? `Class ${student.class.name} - ${student.class.section}` : 'Unassigned Class'}
                                    </span>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center gap-3 text-sm">
                                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-300 truncate">{student.user?.email || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-300">{student.user?.phone || 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-300">
                                            {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <Home className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-300 text-xs">{student.address || 'N/A'}</span>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
                                        <Link
                                            href={`/admin/students/${student.id}/id-card`}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            <UserCircle className="w-4 h-4" />
                                            View ID Card
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Details & Records */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-90">Attendance</p>
                                            <p className="text-2xl font-bold">{attendancePercentage}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className={`bg-gradient-to-br ${pendingFees > 0 ? 'from-red-500 to-red-600' : 'from-green-500 to-green-600'} rounded-xl p-4 text-white shadow-lg`}>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <IndianRupee className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-90">Pending Fees</p>
                                            <p className="text-2xl font-bold">₹{pendingFees.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs opacity-90">Exams Taken</p>
                                            <p className="text-2xl font-bold">{student.examResults?.length || 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Parent Information */}
                            {student.parent ? (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                            <Users className="w-5 h-5 text-indigo-600" />
                                            Parent/Guardian Information
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Father's Name</p>
                                                <p className="font-semibold text-slate-800 dark:text-white">{student.parent.fatherName || 'Not Provided'}</p>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Mother's Name</p>
                                                <p className="font-semibold text-slate-800 dark:text-white">{student.parent.motherName || 'Not Provided'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/20">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Phone Number</p>
                                                <div className="flex items-center gap-2">
                                                    <Phone className="w-4 h-4 text-indigo-600" />
                                                    <a href={`tel:${student.parent.phone}`} className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                                                        {student.parent.phone || 'N/A'}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Email Address</p>
                                                <div className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-800 dark:text-white truncate">{student.parent.email || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {student.parent.address && (
                                        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-100 dark:border-slate-600">
                                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">Home Address</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300">{student.parent.address}</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-indigo-600" />
                                        Parent Information
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm">No parent information available.</p>
                                </div>
                            )}

                            {/* Recent Exam Results */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <FileBarChart className="w-5 h-5 text-purple-600" />
                                    Recent Exam Results
                                </h3>
                                {(student.examResults || []).length > 0 ? (
                                    <div className="space-y-3">
                                        {(student.examResults || []).slice(0, 5).map((result: any) => {
                                            const examName = result.examSchedule?.examGroup?.name || 'Unknown Exam';
                                            const subjectName = result.examSchedule?.subject?.name || '';
                                            return (
                                                <div key={result.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                                    <div className="min-w-0 pr-2">
                                                        <p className="font-medium text-slate-800 dark:text-white truncate">
                                                            {subjectName ? `${examName} - ${subjectName}` : examName}
                                                        </p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {result.enteredAt ? new Date(result.enteredAt).toLocaleDateString('en-IN') : 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="font-bold text-lg text-indigo-600">{result.marksObtained}/{result.examSchedule?.maxMarks || 100}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                                            {result.examSchedule?.maxMarks > 0 ? Math.round((result.marksObtained / result.examSchedule.maxMarks) * 100) : 0}%
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-center text-slate-500 dark:text-slate-400 py-4">No exam results yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="finance">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1 space-y-6">
                            {/* Finance Summary Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Financial Status</h3>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-600">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Fees Assigned</p>
                                        <p className="text-2xl font-bold text-slate-800 dark:text-white">₹{totalFees.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                                        <p className="text-sm text-green-600 dark:text-green-400">Total Paid</p>
                                        <p className="text-2xl font-bold text-green-700 dark:text-green-300">₹{totalPaid.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                                        <p className="text-sm text-red-600 dark:text-red-400">Pending Dues</p>
                                        <p className="text-2xl font-bold text-red-700 dark:text-green-300">₹{pendingFees.toLocaleString()}</p>
                                    </div>

                                    {walletBalance > 0 && (
                                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20">
                                            <p className="text-sm text-indigo-600 dark:text-indigo-400">Advance Balance</p>
                                            <div className="flex items-center justify-between">
                                                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">₹{walletBalance.toLocaleString()}</p>
                                                <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">Wallet</Badge>
                                            </div>
                                            <p className="text-[10px] text-indigo-500 mt-1 italic">Automatically applied to future fees</p>
                                        </div>
                                    )}

                                    <Link
                                        href={`/admin/finance/fees/collect?studentId=${student.id}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 mt-4 font-semibold"
                                    >
                                        <IndianRupee className="w-5 h-5" />
                                        Collect New Payment
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {/* Fee Records */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-soft border border-slate-200 dark:border-slate-700 p-6">
                                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-indigo-600" />
                                    Fee History & Assignment
                                </h3>
                                {student.studentFees.length > 0 ? (
                                    <div className="space-y-4">
                                        {student.studentFees.map((fa: any) => {
                                            const payments = fa.payments || [];
                                            const feeStructure = fa.feeStructure || { name: 'Unknown Fee', amount: 0 };
                                            const paid = payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
                                            const pending = feeStructure.amount - paid;
                                            return (
                                                <div key={fa.id} className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-bold text-slate-800 dark:text-white">{feeStructure.name}</p>
                                                                {fa.academicYear && (
                                                                    <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold uppercase tracking-wider">
                                                                        {fa.academicYear.name}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                                Assigned: {new Date(fa.createdAt).toLocaleDateString('en-IN')}
                                                            </p>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${pending === 0
                                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                            }`}>
                                                            {pending === 0 ? 'Paid' : 'Pending'}
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Amount</p>
                                                            <p className="font-bold text-slate-900 dark:text-white">₹{feeStructure.amount.toLocaleString()}</p>
                                                        </div>
                                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Paid Amount</p>
                                                            <p className="font-bold text-green-600">₹{paid.toLocaleString()}</p>
                                                        </div>
                                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg">
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Balance Due</p>
                                                            <p className="font-bold text-red-600">₹{pending.toLocaleString()}</p>
                                                        </div>
                                                    </div>

                                                    {payments.length > 0 && (
                                                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-600">
                                                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Transaction History</p>
                                                            <div className="space-y-2">
                                                                {payments.map((payment: any) => (
                                                                    <div key={payment.id} className="flex justify-between items-center text-xs p-2 hover:bg-white dark:hover:bg-slate-800 rounded transition-colors">
                                                                        <div className="flex items-center gap-2">
                                                                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                                            <span className="font-mono text-slate-600 dark:text-slate-300">{payment.receiptNo}</span>
                                                                            <span className="text-slate-400">|</span>
                                                                            <span className="text-slate-600 dark:text-slate-300">{new Date(payment.date).toLocaleDateString('en-IN')}</span>
                                                                        </div>
                                                                        <span className="font-medium text-slate-800 dark:text-white">₹{payment.amount.toLocaleString()}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                            <IndianRupee className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No Payment Records</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                                            This student hasn't been assigned any fee structures yet.
                                        </p>
                                        <Link
                                            href="/admin/finance/fees/assign"
                                            className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                        >
                                            Assign Fee Now
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div >
    );
}
