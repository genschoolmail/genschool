"use client";

import { useEffect, useState } from 'react';
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

    useEffect(() => {
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
            default:
                return 'ℹ️';
        }
    }

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Dropdown Panel */}
                    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50 max-h-[600px] overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="font-semibold text-slate-800 dark:text-white">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                                    {notifications.map((n: any) => (
                                        <div
                                            key={n.id}
                                            onClick={() => {
                                                handleMarkAsRead(n.id);
                                                if (n.link) window.location.href = n.link;
                                            }}
                                            className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-l-4 ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-500' : 'border-transparent'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="text-xl">
                                                    {getNotificationIcon(n.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className={`text-sm font-semibold truncate ${!n.isRead ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                                            {n.title}
                                                        </p>
                                                        {!n.isRead && (
                                                            <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                        {n.message}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
