import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, IndianRupee, FileText, History, BookOpen, Calendar, LogOut, Book, Bell, CreditCard, Clock, Bus, User, ClipboardList } from 'lucide-react';
import { auth, signOut } from '@/auth';
import StudentMobileNav from './StudentMobileNav';
import { prisma } from '@/lib/prisma';
import { getAnnouncements } from '@/lib/actions/announcement-actions';
import { getActiveAnnouncements } from '@/lib/actions/global-notifications';
import NoticeBell from '@/components/NoticeBell';
import SignOutButton from '@/components/SignOutButton';

export default async function StudentLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    const user = session?.user;

    // Fetch internal notices only for the bell indicator
    let notices: any[] = [];
    if (user?.id) {
        const student = await prisma.student.findUnique({
            where: { userId: user.id },
            select: { id: true, classId: true }
        });

        if (student) {
            notices = await getAnnouncements({
                targetRole: 'STUDENT',
                classId: student.classId || undefined,
                recipientId: student.id,
                isPublic: false
            });
            // Sorting is already handled in getAnnouncements by date: 'desc'
        }
    }


    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="w-64 lg:w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col shadow-2xl z-20 print:hidden">
                <div className="p-4 lg:p-8 flex items-center justify-center border-b border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <span className="text-white font-bold text-xl">S</span>
                        </div>
                        <div>
                            <h1 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-white tracking-tight">Student Portal</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Gen School Mail</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-4 lg:py-6 px-3 lg:px-4 space-y-1">
                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
                    <NavItem href="/student" icon={<LayoutDashboard />} label="Dashboard" />
                    <NavItem href="/student/id-card" icon={<CreditCard />} label="My ID Card" />
                    <NavItem href="/student/exam" icon={<ClipboardList />} label="Exams" />
                    <NavItem href="/student/notices" icon={<Bell />} label="Notices" />

                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">My Finance</p>
                    <NavItem href="/student/finance" icon={<IndianRupee />} label="Overview" />
                    <NavItem href="/student/finance/fees" icon={<FileText />} label="My Fees" />



                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Academics</p>
                    <NavItem href="/student/academics" icon={<BookOpen />} label="My Classes" />
                    <NavItem href="/student/attendance" icon={<Calendar />} label="Attendance" />
                    <NavItem href="/student/timetable" icon={<Clock />} label="Timetable" />
                    <NavItem href="/student/library" icon={<Book />} label="My Books" />

                    <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Transport</p>
                    <NavItem href="/student/transport" icon={<Bus />} label="My Bus" />
                </nav>


                <div className="p-3 lg:p-4 border-t border-slate-200 dark:border-slate-700">
                    <SignOutButton
                        userRole={(user as any).role}
                        subdomain={(user as any).subdomain}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-950/20 pointer-events-none print:hidden" />

                <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md shadow-sm z-10 px-4 md:px-6 lg:px-8 py-3 md:py-4 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50 print:hidden">
                    <div className="flex items-center gap-3">
                        {/* Mobile Navigation & Hamburger Button */}
                        <StudentMobileNav
                            userRole={(user as any).role}
                            subdomain={(user as any).subdomain}
                        />

                        <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-white">Student Portal</h2>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-4">
                        <NoticeBell role="student" notices={notices} />
                        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-700">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name || 'Student'}</p>
                                <p className="text-xs text-slate-500">Student</p>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800">
                                {(user?.name || 'S').charAt(0)}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-0 scrollbar-hide">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-200 group text-slate-600 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-98 touch-target"
        >
            <span className="w-5 h-5 mr-3 transition-colors text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                {icon}
            </span>
            <span className="font-medium text-sm lg:text-base">{label}</span>
        </Link>
    );
}
