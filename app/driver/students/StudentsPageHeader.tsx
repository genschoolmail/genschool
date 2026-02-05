"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { t, Language } from "@/lib/driver-translations";

interface StudentsPageHeaderProps {
    routeNo: string;
    routeName: string;
    noRoute?: boolean;
}

export default function StudentsPageHeader({ routeNo, routeName, noRoute }: StudentsPageHeaderProps) {
    const [lang, setLang] = useState<Language>('en');

    useEffect(() => {
        const savedLang = localStorage.getItem('driverLanguage') as Language;
        if (savedLang) setLang(savedLang);
    }, []);

    return (
        <div className="flex items-center gap-3 mb-6">
            <Link href="/driver">
                <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm">
                    <ArrowLeft className="h-5 w-5" />
                </Button>
            </Link>
            <div>
                <h1 className="text-xl font-bold text-slate-900">{t('myStudents', lang)}</h1>
                {!noRoute && (
                    <p className="text-sm text-slate-500">{t('route', lang)} {routeNo} • {routeName}</p>
                )}
            </div>
        </div>
    );
}
