import Link from 'next/link';
import {
    LayoutDashboard, School, CreditCard, Settings,
    LogOut, TrendingUp, Users, Bell, Search,
    ShieldCheck, Activity, Globe
} from 'lucide-react';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { Providers } from '@/components/Providers';
import { MobileNav } from './MobileNav';

export default async function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if ((session?.user as any)?.role !== 'SUPER_ADMIN') {
        redirect('/login');
    }

    const signOutAction = async () => {
        'use server';
        await signOut({ redirectTo: '/' });
    };

    return (
        <Providers>
            <div className="flex h-screen bg-slate-50 dark:bg-slate-900 font-sans overflow-hidden">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex w-64 lg:w-72 bg-slate-900 dark:bg-slate-950 flex-col shadow-2xl z-20 border-r border-slate-800">
                    <div className="p-6 lg:p-8 flex items-center justify-center border-b border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                <ShieldCheck className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-lg lg:text-xl font-black text-white tracking-tight">Platform<span className="text-indigo-400">HQ</span></h1>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Enterprise SaaS</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
                        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Operations</p>
                        <NavLink href="/super-admin" icon={<LayoutDashboard />} label="Overview" />
                        <NavLink href="/super-admin/schools" icon={<School />} label="School Directory" />
                        <NavLink href="/super-admin/admins" icon={<Users />} label="Global Admins" />
                        <NavLink href="/super-admin/kyc" icon={<ShieldCheck />} label="KYC Requests" />

                        <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-8 mb-4">Platform</p>
                        <NavLink href="/super-admin/subscriptions" icon={<CreditCard />} label="Subscriptions" />
                        <NavLink href="/super-admin/analytics" icon={<TrendingUp />} label="Performance" />
                        <NavLink href="/super-admin/health" icon={<Activity />} label="System Health" />
                        <NavLink href="/super-admin/settings" icon={<Settings />} label="Global Settings" />
                    </nav>

                    <div className="p-4 border-t border-slate-800">
                        <form action={signOutAction}>
                            <button className="flex items-center w-full px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all group">
                                <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                                <span className="font-bold">Sign Out</span>
                            </button>
                        </form>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Header */}
                    <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 p-4 lg:px-8 z-30 flex justify-between items-center h-16 lg:h-20">
                        <div className="flex items-center gap-3 lg:gap-4 flex-1">
                            {/* Mobile Menu Button */}
                            <MobileNav userName={session?.user?.name || 'Super Admin'} signOutAction={signOutAction} />

                            {/* Search Bar */}
                            <div className="relative max-w-md w-full hidden md:block">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search across schools..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 lg:gap-6">
                            <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl relative">
                                < Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
                            </button>

                            <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 block" />

                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{session?.user?.name || 'Super Admin'}</p>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">Super Admin</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200">
                                    {session?.user?.name?.[0] || 'A'}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 relative">
                        {/* Background Glow */}
                        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />

                        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto relative z-10 font-medium">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </Providers>
    );
}

function NavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
    return (
        <Link
            href={href}
            className="flex items-center px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 group relative"
        >
            <span className="mr-3 text-slate-500 group-hover:text-indigo-400 transition-colors">{icon}</span>
            <span className="font-bold text-sm">{label}</span>
            {/* Indicator */}
            <div className="absolute left-0 w-1 h-0 bg-indigo-500 rounded-r-full group-hover:h-6 transition-all duration-300" />
        </Link>
    );
}
