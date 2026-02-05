'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import {
    LayoutDashboard, School, CreditCard, Settings,
    LogOut, TrendingUp, Users,
    ShieldCheck, Activity, Menu, X
} from 'lucide-react';
import { usePathname } from 'next/navigation';

export function MobileNav({ userName, signOutAction }: { userName: string; signOutAction: () => Promise<void> }) {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                aria-label="Toggle menu"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={closeMenu}
                    />

                    {/* Sidebar */}
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 dark:bg-slate-950 flex flex-col shadow-2xl border-r border-slate-800 animate-in slide-in-from-left duration-200">
                        {/* Header */}
                        <div className="p-6 flex items-center justify-between border-b border-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <ShieldCheck className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-black text-white tracking-tight">Platform<span className="text-indigo-400">HQ</span></h1>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Enterprise SaaS</p>
                                </div>
                            </div>
                            <button onClick={closeMenu} className="p-2 text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2 custom-scrollbar">
                            <div>
                                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 opacity-60">Operations</p>
                                <div className="space-y-1">
                                    <NavLink href="/super-admin" icon={<LayoutDashboard />} label="Overview" onClick={closeMenu} pathname={pathname} />
                                    <NavLink href="/super-admin/schools" icon={<School />} label="School Directory" onClick={closeMenu} pathname={pathname} />
                                    <NavLink href="/super-admin/admins" icon={<Users />} label="Global Admins" onClick={closeMenu} pathname={pathname} />
                                    <NavLink href="/super-admin/kyc" icon={<ShieldCheck />} label="KYC Requests" onClick={closeMenu} pathname={pathname} />
                                </div>
                            </div>

                            <div className="pt-4">
                                <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 opacity-60">Platform</p>
                                <div className="space-y-1">
                                    <NavLink href="/super-admin/subscriptions" icon={<CreditCard />} label="Subscriptions" onClick={closeMenu} pathname={pathname} />
                                    <NavLink href="/super-admin/analytics" icon={<TrendingUp />} label="Performance" onClick={closeMenu} pathname={pathname} />
                                    <NavLink href="/super-admin/health" icon={<Activity />} label="System Health" onClick={closeMenu} pathname={pathname} />
                                    <NavLink href="/super-admin/settings" icon={<Settings />} label="Global Settings" onClick={closeMenu} pathname={pathname} />
                                </div>
                            </div>
                        </nav>

                        {/* User Profile & Sign Out */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                            <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-slate-800/30 rounded-xl border border-slate-800/50">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                                    {userName?.[0] || 'A'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{userName || 'Super Admin'}</p>
                                    <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-tighter">Verified Admin</p>
                                </div>
                            </div>
                            <form action={signOutAction}>
                                <button className="flex items-center w-full px-4 py-3 text-sm text-slate-400 hover:text-white hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all group border border-transparent hover:border-red-500/20">
                                    <LogOut className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform" />
                                    <span className="font-bold">Sign Out</span>
                                </button>
                            </form>
                        </div>
                    </aside>
                </div>
            )}
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
            className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-800'
                }`}
        >
            <span className={`mr-3 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400 font-medium'}`}>
                {icon ? (React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' }) : icon) : null}
            </span>
            <span className={`font-bold text-sm ${isActive ? 'text-white' : ''}`}>{label}</span>
            {isActive && <div className="absolute left-1.5 w-1 h-5 bg-indigo-500 rounded-full" />}
        </Link>
    );
}
