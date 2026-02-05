import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Users, BookOpen, ChevronRight, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default async function MyClassesPage() {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
            classes: {
                include: {
                    _count: {
                        select: { students: true }
                    }
                }
            },
            classTeachers: {
                include: {
                    class: {
                        include: {
                            _count: {
                                select: { students: true }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!teacher) {
        return <div>Teacher profile not found.</div>;
    }

    // Combine classes where teacher is main teacher (classes) and assigned teacher (classTeachers)
    const classMap = new Map();

    teacher.classes.forEach(cls => {
        classMap.set(cls.id, { ...cls, role: 'Class Teacher' });
    });

    teacher.classTeachers.forEach(ct => {
        if (!classMap.has(ct.class.id)) {
            classMap.set(ct.class.id, { ...ct.class, role: 'Subject Teacher' });
        }
    });

    const allClasses = Array.from(classMap.values());

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-purple-50/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-6 lg:p-8 shadow-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white mb-1 md:mb-2">
                                My Classes
                            </h1>
                            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">
                                Manage your assigned classes and students
                            </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white px-4 py-2 md:px-5 md:py-2.5 rounded-xl shadow-lg">
                                <span className="text-lg md:text-xl font-bold">{allClasses.length}</span>
                                <span className="text-xs md:text-sm ml-2 opacity-90">Classes</span>
                            </div>
                        </div>
                    </div>
                </div>

                {allClasses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {allClasses.map((cls) => (
                            <div
                                key={cls.id}
                                className="group bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Gradient Header */}
                                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                                <div className="p-5 md:p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {/* Class Badge */}
                                            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-lg group-hover:scale-110 transition-transform">
                                                {cls.name}
                                            </div>
                                            <div>
                                                <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">
                                                    Class {cls.name}
                                                </h3>
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-md font-medium">
                                                    Section {cls.section}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role Badge */}
                                    <div className="mb-4">
                                        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${cls.role === 'Class Teacher'
                                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                            }`}>
                                            <GraduationCap className="w-3 h-3 mr-1.5" />
                                            {cls.role}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
                                                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Students</p>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{cls._count.students}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                            <div className="p-2 bg-purple-50 dark:bg-purple-500/10 rounded-lg">
                                                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">Year</p>
                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{cls.academicYear}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <Link
                                        href={`/teacher/classes/${cls.id}`}
                                        className="flex items-center justify-between w-full px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg hover:shadow-xl group"
                                    >
                                        <span>View Class Details</span>
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 md:py-20 bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-full mb-4 md:mb-6">
                            <BookOpen className="w-8 h-8 md:w-10 md:h-10 text-slate-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-2">No Classes Assigned</h3>
                        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto px-4">
                            You haven't been assigned to any classes yet. Please contact your administrator.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
