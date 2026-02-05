"use client";

import { useState, useEffect } from "react";
import { t, Language } from "@/lib/driver-translations";
import { Bell, Menu, User } from "lucide-react";
import Link from "next/link";
import NoticeBell from "@/components/NoticeBell";

interface DriverPageHeaderProps {
    userName: string;
    userImage?: string | null;
    notices?: any[];
}

export default function DriverPageHeader({ userName, userImage, notices = [] }: DriverPageHeaderProps) {
    const [lang, setLang] = useState<Language>('en');
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const savedLang = localStorage.getItem('driverLanguage') as Language;
        if (savedLang) setLang(savedLang);

        // Update time every minute
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const greeting = () => {
        const hour = currentTime.getHours();
        if (hour < 12) return lang === 'hi' ? 'सुप्रभात' : 'Good Morning';
        if (hour < 17) return lang === 'hi' ? 'शुभ दोपहर' : 'Good Afternoon';
        return lang === 'hi' ? 'शुभ संध्या' : 'Good Evening';
    };

    const firstName = userName.split(' ')[0];

    return (
        <div className="mb-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link href="/driver/profile">
                        {userImage ? (
                            <img
                                src={userImage}
                                alt={userName}
                                className="h-12 w-12 rounded-full object-cover border-2 border-blue-100 shadow-md"
                            />
                        ) : (
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-blue-100 shadow-md">
                                <User className="h-6 w-6 text-white" />
                            </div>
                        )}
                    </Link>
                    <div>
                        <p className="text-sm text-slate-500">{greeting()}</p>
                        <h1 className="text-xl font-bold text-slate-800">{firstName} 👋</h1>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <NoticeBell role="driver" notices={notices} />
                </div>
            </div>

            {/* Date Display */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-3 flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-700">
                        {currentTime.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long'
                        })}
                    </p>
                    <p className="text-xs text-slate-500">
                        {currentTime.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500">
                        {lang === 'hi' ? 'आज का कार्य' : "Today's Work"}
                    </p>
                    <p className="text-sm font-semibold text-blue-600">
                        {lang === 'hi' ? 'सुबह की यात्रा' : 'Morning Trip'}
                    </p>
                </div>
            </div>
        </div>
    );
}
