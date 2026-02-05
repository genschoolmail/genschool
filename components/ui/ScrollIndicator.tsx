'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollIndicatorProps {
    children: React.ReactNode;
    className?: string;
}

export default function ScrollIndicator({ children, className }: ScrollIndicatorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    const checkScroll = () => {
        const el = scrollRef.current;
        if (!el) return;

        const { scrollLeft, scrollWidth, clientWidth } = el;
        setShowLeft(scrollLeft > 0);
        setShowRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding errors
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            // Check initially and on resize
            window.addEventListener('resize', checkScroll);
            checkScroll();

            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, []);

    return (
        <div className={cn("relative group", className)}>
            {/* Left Shadow & Indicator */}
            <div
                className={cn(
                    "absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none transition-opacity duration-300 flex items-center justify-start pl-1",
                    showLeft ? "opacity-100" : "opacity-0"
                )}
            >
                <div className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md flex items-center justify-center text-slate-500">
                    <ChevronLeft className="w-4 h-4" />
                </div>
            </div>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="overflow-x-auto scrollbar-hide"
            >
                {children}
            </div>

            {/* Right Shadow & Indicator */}
            <div
                className={cn(
                    "absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none transition-opacity duration-300 flex items-center justify-end pr-1",
                    showRight ? "opacity-100" : "opacity-0"
                )}
            >
                <div className="w-6 h-6 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md flex items-center justify-center text-slate-500 animate-pulse">
                    <ChevronRight className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
