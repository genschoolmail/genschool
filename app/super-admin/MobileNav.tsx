'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
    LayoutDashboard, School, CreditCard, Settings,
    LogOut, TrendingUp, Users,
    ShieldCheck, Activity, Menu, X
} from 'lucide-react';
import { usePathname } from 'next/navigation';

import { createPortal } from 'react-dom';

export function MobileNav({ userName, signOutAction }: { userName: string; signOutAction: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const closeMenu = () => setIsOpen(false);

    const MenuContent = (
        <div className="fixed inset-0 z-[10000] lg:hidden">
            {/* Immersive Backdrop */}
            <div
                className="absolute inset-0 bg-[#0a0c10]/80 backdrop-blur-xl transition-opacity animate-in fade-in duration-500"
                onClick={closeMenu}
            />

            {/* Sidebar Drawer - Premium Design */}
            <aside className="absolute left-0 top-0 bottom-0 w-[300px] bg-slate-950 flex flex-col shadow-[25px_0_60px_-15px_rgba(0,0,0,0.7)] border-r border-slate-800 animate-in slide-in-from-left duration-500 ease-out overflow-hidden">
                {/* Internal Glows */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-3xl pointer-events-none" />

                {/* Header Section */}
                <div className="p-8 flex items-center justify-between border-b border-slate-800/50 bg-slate-900/20 relative z-10">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <ShieldCheck className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white tracking-tight">Platform<span className="text-indigo-400">HQ</span></h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em] leading-none mt-1.5">Management</p>
                        </div>
                    </div>
                    <button
                        onClick={closeMenu}
                        className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-2xl transition-all active:scale-90"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable Navigation - Categorized Modules */}
                <nav className="flex-1 overflow-y-auto pt-8 pb-4 px-5 space-y-10 custom-scrollbar relative z-10">
                    <div className="space-y-5">
                        <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] opacity-40">Operational Intel</p>
                        <div className="space-y-2">
                            <NavLink href="/super-admin" icon={<LayoutDashboard />} label="Intelligence Hub" onClick={closeMenu} pathname={pathname} />
                            <NavLink href="/super-admin/schools" icon={<School />} label="School Ecosystem" onClick={closeMenu} pathname={pathname} />
                            <NavLink href="/super-admin/admins" icon={<Users />} label="Global Authority" onClick={closeMenu} pathname={pathname} />
                            <NavLink href="/super-admin/kyc" icon={<ShieldCheck />} label="KYC Verifications" onClick={closeMenu} pathname={pathname} />
                        </div>
                    </div>

                    <div className="space-y-5">
                        <p className="px-4 text-[11px] font-bold text-slate-500 uppercase tracking-[0.3em] opacity-40">Platform Matrix</p>
                        <div className="space-y-2">
                            <NavLink href="/super-admin/subscriptions" icon={<CreditCard />} label="Financial Stream" onClick={closeMenu} pathname={pathname} />
                            <NavLink href="/super-admin/analytics" icon={<TrendingUp />} label="Performance Metrics" onClick={closeMenu} pathname={pathname} />
                            <NavLink href="/super-admin/health" icon={<Activity />} label="System Pulse" onClick={closeMenu} pathname={pathname} />
                            <NavLink href="/super-admin/settings" icon={<Settings />} label="Infrastructure" onClick={closeMenu} pathname={pathname} />
                        </div>
                    </div>
                </nav>

                {/* Premium Bottom Bar */}
                <div className="mt-auto p-5 border-t border-slate-800 bg-[#0a0c10] relative z-20">
                    <div className="flex items-center gap-4 px-4 py-4 mb-5 bg-gradient-to-br from-slate-900 to-slate-950 rounded-[2rem] border border-slate-800 shadow-inner group/profile">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-2xl shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                            {userName?.[0] || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate leading-tight tracking-tight">{userName || 'Super Admin'}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Authority Unit</p>
                            </div>
                        </div>
                    </div>
                    <form action={signOutAction} className="w-full">
                        <button className="flex items-center w-full px-6 py-4 text-sm text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-[1.5rem] transition-all group border border-transparent hover:border-red-500/20 active:scale-[0.98]">
                            <LogOut className="w-5 h-5 mr-4 group-hover:-translate-x-2 transition-transform" />
                            <span className="font-extrabold tracking-tight">Disconnect Session</span>
                        </button>
                    </form>
                </div>
            </aside>
        </div>
    );

    return (
        <>
            {/* Mobile Menu Button - Floating Crystalline */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400 rounded-[1rem] transition-all border border-transparent hover:border-slate-200 dark:hover:border-indigo-500/20 active:scale-95"
                aria-label="Toggle menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Sidebar Navigation - Portal Strategy */}
            {(isOpen && mounted) && createPortal(MenuContent, document.body)}
        </>
    );
}

function NavLink({ href, icon, label, onClick, pathname }: {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    pathname: string;
}) {
    const isActive = pathname === href || (href !== '/super-admin' && pathname.startsWith(href));

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`flex items-center px-4 py-4 rounded-[1.25rem] transition-all duration-300 group relative overflow-hidden ${isActive
                ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                : 'text-slate-500 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                }`}
        >
            <span className={`mr-4 transition-all duration-300 ${isActive ? 'text-indigo-400 scale-110' : 'text-slate-600 group-hover:text-indigo-400 group-hover:scale-110'}`}>
                {icon ? (React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5.5 h-5.5' }) : icon) : null}
            </span>
            <span className={`font-black text-sm tracking-tight ${isActive ? 'text-white' : ''}`}>{label}</span>

            {/* Glossy Active Glow */}
            {isActive && (
                <div className="absolute left-0 w-1.5 h-8 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-in slide-in-from-left duration-500" />
            )}
        </Link>
    );
}
