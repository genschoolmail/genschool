import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';
import { DeleteDocumentButton } from './DeleteDocumentButton';
import DeleteTeacherButton from './DeleteTeacherButton';
import { FileText, Download, Trash2, Calendar, UserCircle, Mail, Phone, Briefcase, BookOpen, Files } from 'lucide-react';

export default async function TeacherProfilePage({
    params
}: {
    params: Promise<{ id: string }> | { id: string }
}) {
    // Handle Next.js 15 Promise params
    const resolvedParams = params instanceof Promise ? await params : params;

    const teacher = await prisma.teacher.findUnique({
        where: { id: resolvedParams.id },
        include: {
            user: true,
            teacherDocuments: {
                orderBy: { uploadedAt: 'desc' }
            },
            classTeachers: {
                include: {
                    class: true
                }
            },
            salaries: {
                orderBy: { month: 'desc' },
                take: 12
            }
        }
    });

    if (!teacher) {
        return (
            <div className="p-6">
                <h1 className="text-2xl font-bold text-red-600">Teacher Not Found</h1>
            </div>
        );
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <BackButton href="/admin/teachers" />
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Teacher Profile</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Complete profile and documents
                    </p>
                </div>
                <div className="flex gap-3">
                    <DeleteTeacherButton id={teacher.id} teacherName={teacher.user.name || undefined} />
                    <Link
                        href={`/admin/teachers/${teacher.id}/edit`}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Edit Profile
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <div className="flex flex-col items-center">
                            {teacher.user.image ? (
                                <img
                                    src={teacher.user.image}
                                    alt={teacher.user.name || 'Teacher'}
                                    className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100 dark:border-indigo-900"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center border-4 border-indigo-100 dark:border-indigo-900">
                                    <UserCircle className="w-20 h-20 text-white" />
                                </div>
                            )}
                            <h2 className="mt-4 text-xl font-bold text-slate-800 dark:text-white">
                                {teacher.user.name}
                            </h2>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                {teacher.designation || 'Teacher'}
                            </p>
                            {teacher.subject && (
                                <span className="mt-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-medium">
                                    {teacher.subject}
                                </span>
                            )}
                        </div>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-300">{teacher.user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-300">{teacher.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Briefcase className="w-4 h-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-300">{teacher.designation || 'N/A'}</span>
                            </div>
                            {teacher.subject && (
                                <div className="flex items-center gap-3 text-sm">
                                    <BookOpen className="w-4 h-4 text-slate-400" />
                                    <span className="text-slate-600 dark:text-slate-300">{teacher.subject}</span>
                                </div>
                            )}
                            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                                <Link
                                    href={`/admin/teachers/${teacher.id}/id-card`}
                                    className="w-full block text-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    View ID Card
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details & Documents */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Assigned Classes */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            Assigned Classes
                        </h3>
                        {teacher.classTeachers.length > 0 ? (
                            <div className="space-y-3">
                                {teacher.classTeachers.map((ct) => (
                                    <div key={ct.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-slate-700 dark:text-slate-200">Class {ct.class.name} - {ct.class.section}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400 text-center py-4">No classes assigned yet</p>
                        )}
                    </div>

                    {/* Documents */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Files className="w-5 h-5 text-indigo-600" />
                            Uploaded Documents ({teacher.teacherDocuments.length})
                        </h3>

                        {teacher.teacherDocuments.length > 0 ? (
                            <div className="space-y-3">
                                {teacher.teacherDocuments.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded">
                                                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-800 dark:text-white truncate">
                                                    {doc.fileName}
                                                </p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {formatFileSize(doc.fileSize)}
                                                    </span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">
                                                        <Calendar className="w-3 h-3 inline mr-1" />
                                                        {formatDate(doc.uploadedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <a
                                                href={doc.filePath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                title="View"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </a>
                                            <a
                                                href={doc.filePath}
                                                download
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
                                                title="Download"
                                            >
                                                <Download className="w-5 h-5" />
                                            </a>
                                            <DeleteDocumentButton docId={doc.id} teacherId={teacher.id} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Files className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    No documents uploaded yet
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Salary History */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="text-green-600 font-bold">₹</span>
                            Salary History
                        </h3>
                        {teacher.salaries.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-700/50">
                                        <tr>
                                            <th className="px-4 py-3">Month</th>
                                            <th className="px-4 py-3">Basic</th>
                                            <th className="px-4 py-3">Allowances</th>
                                            <th className="px-4 py-3">Deductions</th>
                                            <th className="px-4 py-3">Net Salary</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Paid Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {teacher.salaries.map((salary) => (
                                            <tr key={salary.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                                                    {new Date(salary.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                                </td>
                                                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">₹{salary.basicSalary.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-green-600">+₹{salary.allowances.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-red-600">-₹{salary.deductions.toLocaleString()}</td>
                                                <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">₹{salary.netSalary.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${salary.status === 'PAID'
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        }`}>
                                                        {salary.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                                    {salary.paidDate ? new Date(salary.paidDate).toLocaleDateString('en-IN') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    No salary records found
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
