"use client";

import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Check, Clock } from 'lucide-react';
import { requestNotificationPermission, onMessageListener } from '@/lib/firebase';
import { saveFCMToken, getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/notification-actions';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    link: string | null;
    isRead: boolean;
    createdAt: Date;
}

export default function NotificationBell({ userId }: { userId: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [mounted, setMounted] = useState(false);
    const bellRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        
        // Request notification permission on component mount
        async function setupNotifications() {
            try {
                if (typeof requestNotificationPermission === 'function') {
                    const token = await requestNotificationPermission();
                    if (token) {
                        // Save token to database
                        await saveFCMToken(userId, token, navigator.userAgent);
                    }
                }
            } catch (error) {
                console.error('Error setting up notifications:', error);
            }
        }

        setupNotifications();

        // Listen for foreground messages
        let unsubscribe: any = null;
        try {
            if (typeof onMessageListener === 'function') {
                unsubscribe = onMessageListener((payload: any) => {
                    console.log('Received foreground message:', payload);
                    // Refresh notifications
                    loadNotifications();
                });
            }
        } catch (error) {
            console.error('Error registering message listener:', error);
        }

        // Load initial notifications
        loadNotifications();

        return () => {
            if (unsubscribe && typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, [userId]);

    async function loadNotifications() {
        const notifs = await getUserNotifications(userId);
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
    }

    async function handleMarkAsRead(notifId: string) {
        await markNotificationAsRead(notifId);
        loadNotifications();
    }

    async function handleMarkAllAsRead() {
        await markAllNotificationsAsRead(userId);
        loadNotifications();
    }

    function getNotificationIcon(type: string) {
        switch (type) {
            case 'BUS_ARRIVAL':
                return '🚌';
            case 'BUS_DELAYED':
                return '⏰';
            case 'PICKUP_COMPLETE':
            case 'DROP_COMPLETE':
                return '✅';
            case 'ROUTE_CHANGE':
                return '🗺️';
            case 'SUCCESS':
                return '🎉';
            case 'WARNING':
                return '⚠️';
            case 'ERROR':
                return '❌';
            case 'FEE_ASSIGNED':
                return '💰';
            case 'ALERT':
                return '🔔';
            default:
                return 'ℹ️';
        }
    }

    if (!mounted) return null;

    const dropdownContent = (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Backdrop for mobile and desktop */}
            <div 
                className={`absolute inset-0 bg-black/20 dark:bg-black/40 pointer-events-auto transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <div 
                className={`
                    fixed inset-x-4 top-20 bottom-20 sm:bottom-auto
                    sm:absolute sm:right-6 sm:top-16 sm:inset-x-auto
                    w-auto sm:w-[400px] 
                    bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 
                    overflow-hidden flex flex-col transition-all duration-300 transform pointer-events-auto
                    ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'}
                `}
            >
                {/* Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {unreadCount} New
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
                            >
                                Mark all as read
                            </button>
                        )}
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1 overscroll-contain bg-white dark:bg-slate-800">
                    {notifications.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Bell className="h-10 w-10 opacity-20" />
                            </div>
                            <p className="font-bold text-slate-800 dark:text-white">No notifications yet</p>
                            <p className="text-sm opacity-60 mt-1">We'll notify you when something important happens.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-700 p-2">
                            {notifications.map((n: any) => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        handleMarkAsRead(n.id);
                                        if (n.link) window.location.href = n.link;
                                    }}
                                    className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-200 cursor-pointer group rounded-xl my-1 border-l-4 ${!n.isRead 
                                        ? 'bg-indigo-50/40 dark:bg-indigo-900/10 border-indigo-500 shadow-sm' 
                                        : 'border-transparent opacity-75 grayscale-[0.5]'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-2xl mt-1 group-hover:scale-110 transition-transform duration-300">
                                            {getNotificationIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className={`text-sm font-bold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                    {n.title}
                                                </p>
                                                {!n.isRead && (
                                                    <span className="flex-shrink-0 w-2.5 h-2.5 bg-blue-600 rounded-full ring-4 ring-blue-100 dark:ring-blue-900/30"></span>
                                                )}
                                            </div>
                                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mt-1 line-clamp-3">
                                                {n.message}
                                            </p>
                                            <div className="mt-3 flex items-center justify-between">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-bold">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                </p>
                                                {n.link && (
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                                        View Details →
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative" ref={bellRef}>
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    relative p-2.5 rounded-xl transition-all duration-300 active:scale-95
                    ${isOpen ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 ring-2 ring-indigo-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}
                `}
            >
                <Bell className={`h-5 w-5 transition-transform duration-500 ${isOpen ? 'rotate-[15deg] scale-110' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-bounce shadow-lg shadow-red-500/30">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Portal for the dropdown */}
            {isOpen && mounted && createPortal(dropdownContent, document.body)}
        </div>
    );
}
