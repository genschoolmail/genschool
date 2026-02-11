'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { X } from 'lucide-react';

interface NavItemProps {
    href: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

interface NavSection {
    title: string;
    items: NavItemProps[];
}

import SignOutButton from './SignOutButton';

interface MobileNavProps {
    isOpen: boolean;
    onClose: () => void;
    sections: NavSection[];
    userRole?: string;
    subdomain?: string | null;
    portalName: string;
}

export default function MobileNav({
    isOpen,
    onClose,
    sections,
    userRole,
    subdomain,
    portalName,
}: MobileNavProps) {
    const drawerRef = useRef<HTMLDivElement>(null);
    const startXRef = useRef<number>(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Handle swipe to close
    useEffect(() => {
        if (!isOpen) return;

        const handleTouchStart = (e: TouchEvent) => {
            startXRef.current = e.touches[0].clientX;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const currentX = e.touches[0].clientX;
            const diff = currentX - startXRef.current;

            // Only allow left swipe (closing)
            if (diff < -50 && drawerRef.current) {
                onClose();
            }
        };

        const drawer = drawerRef.current;
        if (drawer) {
            drawer.addEventListener('touchstart', handleTouchStart);
            drawer.addEventListener('touchmove', handleTouchMove);
        }

        return () => {
            if (drawer) {
                drawer.removeEventListener('touchstart', handleTouchStart);
                drawer.removeEventListener('touchmove', handleTouchMove);
            }
        };
    }, [isOpen, onClose]);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <>
            {/* Enhanced Backdrop with blur */}
            <div
                className={`fixed inset-0 bg-black/60 z-[9998] transition-all duration-300 ease-in-out md:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                    }`}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Enhanced Drawer with smooth animation */}
            <aside
                ref={drawerRef}
                className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl z-[9999] transform transition-transform duration-300 ease-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                aria-label="Mobile navigation"
            >
                <div className="flex flex-col h-full">
                    {/* Header with gradient and close button */}
                    <div className="relative p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white shrink-0">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                                    <span className="text-white font-bold text-xl">S</span>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold tracking-tight">
                                        {portalName}
                                    </h1>
                                    <p className="text-xs text-indigo-100 font-medium">
                                        Gen School Mail
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors touch-target"
                                aria-label="Close menu"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Drawer handle indicator */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                            <div className="w-12 h-1 bg-white/30 rounded-full"></div>
                        </div>
                    </div>

                    {/* Navigation with improved styling */}
                    <nav className="flex-1 overflow-y-auto py-4 px-3 overscroll-contain">
                        {sections.map((section, idx) => (
                            <div key={idx} className="mb-6">
                                <div className="flex items-center gap-2 px-4 mb-3">
                                    <div className="flex-1 h-px bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700"></div>
                                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        {section.title}
                                    </p>
                                    <div className="flex-1 h-px bg-gradient-to-l from-slate-200 to-transparent dark:from-slate-700"></div>
                                </div>
                                <div className="space-y-1">
                                    {section.items.map((item, itemIdx) => (
                                        <Link
                                            key={itemIdx}
                                            href={item.href}
                                            onClick={onClose}
                                            className="group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 active:scale-[0.98] touch-target relative overflow-hidden"
                                        >
                                            {/* Ripple effect background */}
                                            <div className="absolute inset-0 bg-indigo-500/10 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-xl"></div>

                                            {/* Active indicator */}
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-600 dark:bg-indigo-400 rounded-r-full scale-0 group-hover:scale-100 transition-transform duration-200"></div>

                                            <span className="relative w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors shrink-0">
                                                {item.icon}
                                            </span>
                                            <span className="relative font-medium text-sm">{item.label}</span>

                                            {/* Arrow indicator */}
                                            <svg
                                                className="relative w-4 h-4 ml-auto opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    {/* Enhanced Sign Out Button */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                        <SignOutButton
                            userRole={userRole}
                            subdomain={subdomain}
                        />
                    </div>
                </div>
            </aside>
        </>,
        document.body
    );
}
