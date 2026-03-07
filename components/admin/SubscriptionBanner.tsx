'use client';

import { AlertTriangle, XCircle, RefreshCw, ChevronRight, Clock } from 'lucide-react';
import Link from 'next/link';

interface SubscriptionBannerProps {
    daysLeft: number;
    isExpired: boolean;
    isExpiringSoon: boolean;
    planName: string;
    endDate: Date | string;
}

export default function SubscriptionBanner({
    daysLeft,
    isExpired,
    isExpiringSoon,
    planName,
    endDate
}: SubscriptionBannerProps) {
    if (!isExpired && !isExpiringSoon) return null;

    const formattedDate = new Date(endDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });

    if (isExpired) {
        return (
            <div className="mx-4 md:mx-6 lg:mx-8 mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800/60 p-4 flex items-center justify-between gap-4 shadow-sm print:hidden">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-red-800 dark:text-red-300 text-sm">
                            Subscription Expired
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-400 truncate">
                            Your <strong>{planName}</strong> plan expired on {formattedDate}. Some features may be restricted.
                        </p>
                    </div>
                </div>
                <Link
                    href="/admin/settings/subscription"
                    className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" />
                    Renew Now
                </Link>
            </div>
        );
    }

    // Expiring soon (within 14 days)
    const urgencyColor = daysLeft <= 3 ? 'orange' : 'amber';
    const bgClass = urgencyColor === 'orange'
        ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60'
        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60';
    const textClass = urgencyColor === 'orange'
        ? 'text-orange-800 dark:text-orange-300'
        : 'text-amber-800 dark:text-amber-300';
    const subTextClass = urgencyColor === 'orange'
        ? 'text-orange-600 dark:text-orange-400'
        : 'text-amber-600 dark:text-amber-400';
    const btnClass = urgencyColor === 'orange'
        ? 'bg-orange-500 hover:bg-orange-600'
        : 'bg-amber-500 hover:bg-amber-600';

    return (
        <div className={`mx-4 md:mx-6 lg:mx-8 mt-4 rounded-xl border ${bgClass} p-4 flex items-center justify-between gap-4 shadow-sm print:hidden`}>
            <div className="flex items-center gap-3 min-w-0">
                <div className={`flex-shrink-0 w-10 h-10 ${urgencyColor === 'orange' ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-amber-100 dark:bg-amber-900/50'} rounded-full flex items-center justify-center`}>
                    <Clock className={`w-5 h-5 ${urgencyColor === 'orange' ? 'text-orange-600' : 'text-amber-600'}`} />
                </div>
                <div className="min-w-0">
                    <p className={`font-semibold text-sm ${textClass}`}>
                        Subscription expiring in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>
                    </p>
                    <p className={`text-xs truncate ${subTextClass}`}>
                        Your <strong>{planName}</strong> plan expires on {formattedDate}. Renew to avoid disruption.
                    </p>
                </div>
            </div>
            <Link
                href="/admin/settings/subscription"
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 ${btnClass} text-white text-sm font-semibold rounded-lg transition-colors shadow-sm`}
            >
                Renew Plan
                <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    );
}
