'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

interface NoticeBellProps {
    role: 'student' | 'teacher' | 'driver';
    notices: any[];
}

export default function NoticeBell({ role, notices }: NoticeBellProps) {
    const [hasNew, setHasNew] = useState(false);

    useEffect(() => {
        // Find latest notice ID
        if (notices.length === 0) {
            setHasNew(false);
            return;
        }

        const latestNoticeId = notices[0].id;
        const lastSeenNoticeId = localStorage.getItem(`lastSeenNoticeId_${role}`);

        if (latestNoticeId !== lastSeenNoticeId) {
            setHasNew(true);
        } else {
            setHasNew(false);
        }
    }, [notices, role]);

    const markAsRead = () => {
        if (notices.length > 0) {
            localStorage.setItem(`lastSeenNoticeId_${role}`, notices[0].id);
            setHasNew(false);
        }
    };

    return (
        <Link
            href={`/${role}/notices`}
            onClick={markAsRead}
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors touch-target"
        >
            <Bell className="w-5 h-5 md:w-6 md:h-6" />
            {hasNew && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse transition-all"></span>
            )}
        </Link>
    );
}
