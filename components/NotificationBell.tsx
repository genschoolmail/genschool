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

    const sliderContent = (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
            {/* Backdrop with Blur */}
            <div 
                className={`
                    absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-500
                    ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
                `} 
                onClick={() => setIsOpen(false)}
            />
            
            {/* Slider Panel (Right Side) */}
            <div 
                className={`
                    fixed top-0 right-0 h-full
                    w-full sm:w-[450px] 
                    bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl
                    shadow-[-20px_0_50px_-12px_rgba(0,0,0,0.25)] 
                    border-l border-slate-200/50 dark:border-slate-700/50
                    overflow-hidden flex flex-col transition-all duration-500 ease-out transform pointer-events-auto
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                {/* Header with Background Gradient */}
                <div className="relative p-6 bg-gradient-to-r from-indigo-500 to-purple-600 sticky top-0 z-20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                                <Bell className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-xl tracking-tight">
                                    Notification Center
                                </h3>
                                <p className="text-indigo-100 text-xs font-medium">
                                    {unreadCount > 0 ? `You have ${unreadCount} unread messages` : 'Up to date! 🎉'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all duration-300 hover:rotate-90"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Quick Actions */}
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="mt-6 w-full py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto flex-1 overscroll-contain bg-transparent custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-12 text-center text-slate-500">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
                                <div className="relative w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <Bell className="h-12 w-12 opacity-20" />
                                </div>
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white text-lg">Your Inbox is Empty</h4>
                            <p className="text-sm opacity-60 mt-2 max-w-[250px]">
                                When you receive updates about fee, classes, or events, they'll appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-2 mb-4">
                                Recent Activity
                            </p>
                            {notifications.map((n: any) => (
                                <div
                                    key={n.id}
                                    onClick={() => {
                                        handleMarkAsRead(n.id);
                                        if (n.link) window.location.href = n.link;
                                    }}
                                    className={`
                                        group relative p-4 rounded-2xl transition-all duration-300 cursor-pointer border
                                        ${!n.isRead 
                                            ? 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-indigo-900 shadow-xl shadow-indigo-500/5' 
                                            : 'bg-slate-50/50 dark:bg-slate-800/30 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                                        }
                                    `}
                                >
                                    {/* Unread Indicator Dot */}
                                    {!n.isRead && (
                                        <div className="absolute top-4 right-4 h-2.5 w-2.5 bg-indigo-600 rounded-full ring-4 ring-indigo-50 dark:ring-indigo-900/30" />
                                    )}

                                    <div className="flex items-start gap-4">
                                        <div className="text-3xl p-3 bg-slate-100 dark:bg-slate-700/50 rounded-2xl group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                                            {getNotificationIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm font-bold leading-tight ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300 mt-1.5 line-clamp-2 font-medium">
                                                {n.message}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 font-bold bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                </p>
                                                {n.link && (
                                                    <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all">
                                                        OPEN <Check className="w-3 h-3" />
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
                
                {/* Footer Branding */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-center items-center">
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                        Gen School Mail • v2.0
                    </p>
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

            {/* Portal for the slider */}
            {isOpen && mounted && createPortal(sliderContent, document.body)}
        </div>
    );
}
