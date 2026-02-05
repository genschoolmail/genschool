import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, Calendar, LogOut, ClipboardList, PenTool, FileText, Bus, UserPlus, Settings, BookOpen, Shield } from 'lucide-react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AdminMobileNav from './AdminMobileNav';
import { Providers } from '@/components/Providers';
import SignOutButton from '@/components/SignOutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || ((session.user as any)?.role !== 'ADMIN' && (session.user as any)?.role !== 'ACCOUNTANT')) {
    redirect('/login');
  }

  const user = session.user;


  const { getSubscription } = await import('@/lib/subscription');
  const subscription = await getSubscription((user as any).schoolId);
  const features = subscription?.plan?.features ? JSON.parse(subscription.plan.features) : {};

  return (
    <Providers>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="w-64 lg:w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col shadow-2xl z-20 print:hidden">
          <div className="p-4 lg:p-8 flex items-center justify-center border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-slate-800 dark:text-white tracking-tight">Admin Portal</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">School ERP</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 lg:py-6 px-3 lg:px-4 space-y-1">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
            <NavItem href="/admin" icon={<LayoutDashboard />} label="Dashboard" />
            <NavItem href="/admin/students" icon={<Users />} label="Students" />
            <NavItem href="/admin/teachers" icon={<Users />} label="Teachers" />
            <NavItem href="/admin/users" icon={<Shield />} label="Users & Passwords" />
            <NavItem href="/admin/admissions/enquiries" icon={<UserPlus />} label="Admission Enquiries" />

            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Academic</p>
            <NavItem href="/admin/attendance" icon={<Calendar />} label="Attendance" />
            <NavItem href="/admin/academics" icon={<BookOpen />} label="Academics" />
            {features.exam_module !== false && (
              <>
                <NavItem href="/admin/exams" icon={<FileText />} label="Examinations" />
              </>
            )}
            {features.library !== false && <NavItem href="/admin/library" icon={<BookOpen />} label="Library" />}

            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Administration</p>
            {features.finance_module !== false && <NavItem href="/admin/finance" icon={<FileText />} label="Finance" />}

            {features.inventory !== false && <NavItem href="/admin/inventory" icon={<ClipboardList />} label="Inventory" />}
            {features.transport !== false && <NavItem href="/admin/transport" icon={<Bus />} label="Transport" />}

            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Communication</p>
            <NavItem href="/admin/notices" icon={<FileText />} label="Notices" />

            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Reports</p>
            <NavItem href="/admin/reports" icon={<FileText />} label="Reports" />
            <NavItem href="/admin/settings" icon={<Settings />} label="Settings" />
            <NavItem href="/admin/settings/website" icon={<LayoutDashboard />} label="Website CMS" />
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

          <header className="sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-md z-10 px-4 md:px-6 lg:px-8 py-4 md:py-5 flex justify-between items-center border-b border-slate-200/80 dark:border-slate-700/80 print:hidden">
            <div className="flex items-center gap-3">
              {/* Mobile Navigation & Hamburger Button */}
              <AdminMobileNav
                userRole={(user as any).role}
                subdomain={(user as any).subdomain}
              />

              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">Admin Portal</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">Manage your school</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-slate-200 dark:border-slate-700">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white dark:ring-slate-800">
                  {(user?.name || 'A').charAt(0)}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto relative scrollbar-hide bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Top Gradient Decoration */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/40 via-purple-50/20 to-transparent dark:from-indigo-950/30 dark:via-purple-950/10 pointer-events-none z-0 print:hidden" />

            {/* Main Content Container */}
            <div className="relative z-10 p-4 md:p-6 lg:p-8 print:p-0">
              <div className="max-w-7xl mx-auto print:max-w-none">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </Providers>
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
