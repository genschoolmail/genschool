import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getActiveAnnouncements } from '@/lib/actions/global-notifications';
import Link from 'next/link';
import {
    Calendar, BookOpen, Clock, User, GraduationCap,
    ClipboardCheck, TrendingUp, FileText, Award,
    ChevronRight, Users, Check, Megaphone, Bell, Image as ImageIcon
} from 'lucide-react';
import { getAnnouncements } from '@/lib/actions/announcement-actions';
import { format } from 'date-fns';

export default async function TeacherDashboard() {
    const session = await auth();
    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    const announcements = await getActiveAnnouncements();
    const schoolNotices = await getAnnouncements({ targetRole: 'TEACHER', isPublic: false });
    const allNotices = [...announcements, ...schoolNotices];

    const teacher = await prisma.teacher.findUnique({
        where: { userId: session.user.id },
        include: {
            classes: { // Classes where they are the main Class Teacher
                include: { _count: { select: { students: true } } }
            },
            subjects: { // Subjects they teach (linked to classes)
                include: {
                    class: {
                        include: { _count: { select: { students: true } } }
                    }
                }
            },
            classTeachers: { // Explicit ClassTeacher assignments
                include: {
                    class: {
                        include: { _count: { select: { students: true } } }
                    }
                }
            },
            user: true
        }
    });

    if (!teacher) {
        return <div>Teacher profile not found.</div>;
    }

    // Aggregate unique classes from all sources
    const uniqueClassesMap = new Map();

    // 1. From 'classes' relation (Main Class Teacher)
    teacher.classes.forEach(cls => {
        uniqueClassesMap.set(cls.id, cls);
    });

    // 2. From 'classTeachers' relation (Explicit assignments)
    teacher.classTeachers.forEach(ct => {
        if (ct.class) uniqueClassesMap.set(ct.class.id, ct.class);
    });

    // 3. From 'subjects' relation (Teaching a subject in a class)
    teacher.subjects.forEach(subj => {
        if (subj.class) uniqueClassesMap.set(subj.class.id, subj.class);
    });

    const allClasses = Array.from(uniqueClassesMap.values());

    // Calculate stats
    const totalStudents = allClasses.reduce((sum, cls) => sum + (cls._count?.students || 0), 0);
    const totalClasses = allClasses.length;
    const totalSubjects = teacher.subjects.length;

    // Get greeting based on time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
            <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">

                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-2xl">
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                            <div className="flex items-center gap-4 md:gap-6">
                                {/* Profile Picture */}
                                <div className="relative group">
                                    {teacher.user.image ? (
                                        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl overflow-hidden ring-4 ring-white/30 shadow-xl group-hover:ring-white/50 transition-all">
                                            <img
                                                src={teacher.user.image}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-3xl md:text-4xl ring-4 ring-white/30 shadow-xl">
                                            {(teacher.user.name || 'T').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-1 -right-1 bg-green-400 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-white/50"></div>
                                </div>

                                {/* Greeting & Info */}
                                <div>
                                    <p className="text-white/90 text-sm md:text-base font-medium mb-1">{greeting},</p>
                                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-white mb-1 md:mb-2">
                                        {teacher.user.name}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs md:text-sm font-semibold">
                                            <GraduationCap className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                            {teacher.designation || 'Teacher'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Pills */}
                            <div className="flex flex-wrap gap-2 md:gap-3">
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                    <p className="text-white/80 text-xs font-medium">Classes</p>
                                    <p className="text-white text-xl md:text-2xl font-bold">{totalClasses}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                    <p className="text-white/80 text-xs font-medium">Students</p>
                                    <p className="text-white text-xl md:text-2xl font-bold">{totalStudents}</p>
                                </div>
                                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                                    <p className="text-white/80 text-xs font-medium">Subjects</p>
                                    <p className="text-white text-xl md:text-2xl font-bold">{totalSubjects}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    <StatsCard
                        icon={<Users className="w-6 h-6" />}
                        title="Total Students"
                        value={totalStudents.toString()}
                        description="Across all classes"
                        gradient="from-blue-500 to-cyan-500"
                        iconBg="bg-blue-50 dark:bg-blue-500/20"
                        iconColor="text-blue-600 dark:text-blue-400"
                    />
                    <StatsCard
                        icon={<BookOpen className="w-6 h-6" />}
                        title="Classes"
                        value={totalClasses.toString()}
                        description="Teaching this semester"
                        gradient="from-purple-500 to-pink-500"
                        iconBg="bg-purple-50 dark:bg-purple-500/20"
                        iconColor="text-purple-600 dark:text-purple-400"
                    />
                    <StatsCard
                        icon={<GraduationCap className="w-6 h-6" />}
                        title="Subjects"
                        value={totalSubjects.toString()}
                        description="Teaching this year"
                        gradient="from-emerald-500 to-teal-500"
                        iconBg="bg-emerald-50 dark:bg-emerald-500/20"
                        iconColor="text-emerald-600 dark:text-emerald-400"
                    />
                    <StatsCard
                        icon={<TrendingUp className="w-6 h-6" />}
                        title="Attendance"
                        value="94%"
                        description="Average this month"
                        gradient="from-orange-500 to-red-500"
                        iconBg="bg-orange-50 dark:bg-orange-500/20"
                        iconColor="text-orange-600 dark:text-orange-400"
                    />
                </div>

                {/* Quick Actions */}
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        <QuickActionCard
                            icon={<ClipboardCheck className="w-7 h-7" />}
                            title="Mark Attendance"
                            description="Take attendance for your classes"
                            href="/teacher/attendance"
                            gradient="from-blue-500 to-indigo-600"
                        />
                        <QuickActionCard
                            icon={<FileText className="w-7 h-7" />}
                            title="Upload Marks"
                            description="Enter student marks and grades"
                            href="/teacher/marks"
                            gradient="from-purple-500 to-pink-600"
                        />
                        <QuickActionCard
                            icon={<Calendar className="w-7 h-7" />}
                            title="View Timetable"
                            description="Check your class schedule"
                            href="/teacher/timetable"
                            gradient="from-emerald-500 to-teal-600"
                        />
                        <QuickActionCard
                            icon={<Award className="w-7 h-7" />}
                            title="View Results"
                            description="Check student results"
                            href="/teacher/results"
                            gradient="from-orange-500 to-red-600"
                        />
                        <QuickActionCard
                            icon={<Users className="w-7 h-7" />}
                            title="My Classes"
                            description="View all your classes"
                            href="/teacher/classes"
                            gradient="from-cyan-500 to-blue-600"
                        />
                        <QuickActionCard
                            icon={<User className="w-7 h-7" />}
                            title="My Profile"
                            description="View and download ID card"
                            href="/teacher/id-card"
                            gradient="from-pink-500 to-rose-600"
                        />
                        <QuickActionCard
                            icon={<div className="text-white">₹</div>}
                            title="My Salary"
                            description="Check payment status"
                            href="/teacher/finance"
                            gradient="from-emerald-600 to-green-600"
                        />
                    </div>
                </div>

                {/* Classes Overview */}
                {allClasses.length > 0 && (
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></span>
                            My Classes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                            {allClasses.map((cls) => (
                                <ClassCard
                                    key={cls.id}
                                    className={`${cls.name}-${cls.section}`}
                                    students={cls._count?.students || 0}
                                    classId={cls.id}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// Stats Card Component
function StatsCard({
    icon,
    title,
    value,
    description,
    gradient,
    iconBg,
    iconColor
}: {
    icon: React.ReactNode;
    title: string;
    value: string;
    description: string;
    gradient: string;
    iconBg: string;
    iconColor: string;
}) {
    return (
        <div className="group bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700 hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
                <div className={`${iconBg} ${iconColor} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white mb-1">
                {value}
            </h3>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
        </div>
    );
}

// Quick Action Card Component
function QuickActionCard({
    icon,
    title,
    description,
    href,
    gradient
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    gradient: string;
}) {
    return (
        <Link href={href} className="group">
            <div className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>

                <div className="relative z-10">
                    <div className="bg-white/20 backdrop-blur-sm w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2">{title}</h3>
                    <p className="text-sm text-white/90 mb-4">{description}</p>
                    <div className="flex items-center text-white font-medium text-sm group-hover:gap-2 transition-all">
                        <span>Get started</span>
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

// Class Card Component
function ClassCard({
    className,
    students,
    classId
}: {
    className: string;
    students: number;
    classId: string;
}) {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-lg border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {className.split('-')[0]}
                </div>
                <span className="text-xs font-semibold px-3 py-1 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                    Active
                </span>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                Class {className}
            </h3>
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 mb-4">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">{students} Students</span>
            </div>
            <Link
                href={`/teacher/classes/${classId}`}
                className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold text-sm group"
            >
                View Details
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
