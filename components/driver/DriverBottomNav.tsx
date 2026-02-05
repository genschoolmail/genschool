"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Map, QrCode, User } from "lucide-react";
import { t, Language } from "@/lib/driver-translations";

export default function DriverBottomNav() {
    const pathname = usePathname();
    const [lang, setLang] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('driverLanguage') as Language;
        if (savedLang) setLang(savedLang);

        // Listen for storage changes (when language is changed in profile)
        const handleStorageChange = () => {
            const newLang = localStorage.getItem('driverLanguage') as Language;
            if (newLang) setLang(newLang);
        };

        window.addEventListener('storage', handleStorageChange);

        // Also poll for changes (for same-tab updates)
        const interval = setInterval(() => {
            const newLang = localStorage.getItem('driverLanguage') as Language;
            if (newLang && newLang !== lang) setLang(newLang);
        }, 1000);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [lang]);

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 shadow-lg">
            <Link href="/driver" className={`flex flex-col items-center gap-1 ${isActive('/driver') ? 'text-blue-600' : 'text-gray-500'}`}>
                <Home size={24} />
                <span className="text-xs font-medium">{t('home', lang)}</span>
            </Link>

            <Link href="/driver/map" className={`flex flex-col items-center gap-1 ${isActive('/driver/map') ? 'text-blue-600' : 'text-gray-500'}`}>
                <Map size={24} />
                <span className="text-xs font-medium">{t('map', lang)}</span>
            </Link>

            <Link href="/driver/scan" className={`flex flex-col items-center gap-1 ${isActive('/driver/scan') ? 'text-blue-600' : 'text-gray-500'}`}>
                <div className="bg-blue-600 text-white p-3 rounded-full -mt-8 shadow-lg border-4 border-white">
                    <QrCode size={24} />
                </div>
                <span className="text-xs font-medium">{t('scan', lang)}</span>
            </Link>

            <Link href="/driver/profile" className={`flex flex-col items-center gap-1 ${isActive('/driver/profile') ? 'text-blue-600' : 'text-gray-500'}`}>
                <User size={24} />
                <span className="text-xs font-medium">{t('profile', lang)}</span>
            </Link>
        </div>
    );
}
