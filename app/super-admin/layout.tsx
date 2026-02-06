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
            <div className="flex h-screen bg-white dark:bg-[#0a0c10] font-sans overflow-hidden">
                {/* Desktop Sidebar - Premium Platinum Design */}
                <aside className="hidden lg:flex w-72 bg-slate-950 flex-col shadow-[10px_0_40px_-15px_rgba(0,0,0,0.5)] z-40 relative group/sidebar">
                    {/* Glossy Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                    <div className="p-8 flex items-center justify-center border-b border-slate-800/50 backdrop-blur-sm relative z-10">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.3)] transform transition-transform group-hover/sidebar:rotate-3">
                                <ShieldCheck className="text-white w-7 h-7" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-white tracking-tight">Platform<span className="text-indigo-400">HQ</span></h1>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] leading-none mt-1.5 overflow-hidden">
                                    <span className="inline-block animate-in slide-in-from-left duration-500">Premium Core</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto py-8 px-4 space-y-8 custom-scrollbar relative z-10">
                        <section>
                            <p className="px-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-4 opacity-50">Operations Control</p>
                            <div className="space-y-1.5">
                                <NavLink href="/super-admin" icon={<LayoutDashboard />} label="Intelligence" />
                                <NavLink href="/super-admin/schools" icon={<School />} label="School Ecosystem" />
                                <NavLink href="/super-admin/admins" icon={<Users />} label="Global Authority" />
                                <NavLink href="/super-admin/kyc" icon={<ShieldCheck />} label="Verification" />
                            </div>
                        </section>

                        <section>
                            <p className="px-5 text-[11px] font-bold text-slate-500 uppercase tracking-[0.25em] mb-4 opacity-50">Platform Matrix</p>
                            <div className="space-y-1.5">
                                <NavLink href="/super-admin/subscriptions" icon={<CreditCard />} label="Financials" />
                                <NavLink href="/super-admin/analytics" icon={<TrendingUp />} label="Performance" />
                                <NavLink href="/super-admin/health" icon={<Activity />} label="System Pulse" />
                                <NavLink href="/super-admin/settings" icon={<Settings />} label="Infrastructure" />
                            </div>
                        </section>
                    </nav>

                    <div className="p-6 border-t border-slate-800/80 bg-slate-950/50 relative z-10">
                        <form action={signOutAction}>
                            <button className="flex items-center w-full px-5 py-4 text-sm text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-2xl transition-all group border border-transparent hover:border-red-500/20 shadow-sm">
                                <LogOut className="w-5 h-5 mr-4 group-hover:-translate-x-1.5 transition-transform" />
                                <span className="font-extrabold tracking-tight">Disconnect</span>
                            </button>
                        </form>
                    </div>
                </aside>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Header - Floating Crystalline Design */}
                    <header className="sticky top-0 bg-white/70 dark:bg-[#0a0c10]/70 backdrop-blur-2xl border-b border-slate-200 dark:border-slate-800/50 p-4 lg:px-10 z-30 flex justify-between items-center h-20 lg:h-24 transition-all">
                        <div className="flex items-center gap-4 lg:gap-8 flex-1">
                            {/* Mobile Nav Button (Trapped in Portal) */}
                            <MobileNav userName={session?.user?.name || 'Super Admin'} signOutAction={signOutAction} />

                            <div className="h-8 w-[1.5px] bg-slate-200 dark:bg-slate-800/50 hidden lg:block" />

                            {/* Search Bar - More premium */}
                            <div className="relative max-w-xl w-full hidden md:block group/search">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within/search:text-indigo-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search ecosystem intelligence..."
                                    className="w-full pl-12 pr-6 py-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-800 focus:border-indigo-500/50 rounded-2xl text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none font-medium text-slate-700 dark:text-slate-300"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-4 lg:gap-8">
                            <button className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-2xl relative transition-all group">
                                <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                <span className="absolute top-3 right-3 w-2 h-2 bg-indigo-600 rounded-full ring-4 ring-white dark:ring-[#0a0c10]" />
                            </button>

                            <div className="h-10 w-[1.5px] bg-slate-200 dark:bg-slate-800/50" />

                            <div className="flex items-center gap-4 group/profile cursor-pointer">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">{session?.user?.name || 'Super Admin'}</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Authority Unit</p>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                    {session?.user?.name?.[0] || 'A'}
                                </div>
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#0a0c10] relative custom-scrollbar">
                        {/* Immersive Background Glow */}
                        <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-500/5 via-purple-500/2 to-transparent pointer-events-none" />
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
                        <div className="absolute top-1/2 -right-48 w-[500px] h-[500px] bg-purple-500/5 blur-[150px] rounded-full pointer-events-none" />

                        <div className="p-6 lg:p-12 max-w-[1700px] mx-auto relative z-10">
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                {children}
                            </div>
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
            className="flex items-center px-5 py-3.5 text-slate-400 hover:text-white hover:bg-indigo-500/10 rounded-2xl transition-all duration-300 group relative overflow-hidden"
        >
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/5 transition-colors" />

            <span className="mr-4 text-slate-500 group-hover:text-indigo-400 transform group-hover:scale-110 transition-all duration-300 relative z-10">{icon}</span>
            <span className="font-extrabold text-sm tracking-tight relative z-10">{label}</span>

            {/* Premium Active Indicator */}
            <div className="absolute left-0 w-1.5 h-0 bg-indigo-500 rounded-r-full group-hover:h-8 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
        </Link>
    );
}
