"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LogOut, User, Mail, Phone, Car, Route as RouteIcon, CreditCard,
    Languages, ChevronRight, Settings, Shield, MapPin, Calendar,
    Clock, CheckCircle2, Star
} from "lucide-react";
import { t, Language } from "@/lib/driver-translations";

import { signOut } from 'next-auth/react';

interface DriverProfileClientProps {
    userRole?: string;
    subdomain?: string | null;
    user: {
        name: string;
        email: string;
        image: string | null;
    };
    // ... (other props)
    driver: any; // Simplified for brevity in this replace call, will keep existing types if possible or redefine
    stats: any;
}

export default function DriverProfileClient({ user, driver, stats, userRole, subdomain }: DriverProfileClientProps) {
    // ... (existing state)
    const [lang, setLang] = useState<Language>('en');
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [isSigningOut, setIsSigningOut] = useState(false);

    useEffect(() => {
        const savedLang = localStorage.getItem('driverLanguage') as Language;
        if (savedLang) setLang(savedLang);
    }, []);

    const handleLanguageChange = (newLang: Language) => {
        setLang(newLang);
        localStorage.setItem('driverLanguage', newLang);
        setShowLangMenu(false);
        window.location.reload();
    };

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            let callbackUrl = '/';
            const isLocalhost = window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1';
            const protocol = window.location.protocol;
            const baseDomain = isLocalhost ? 'localhost:3000' : 'platform.com';

            if (userRole === 'SUPER_ADMIN') {
                callbackUrl = `${protocol}//${baseDomain}`;
            } else if (subdomain) {
                callbackUrl = `${protocol}//${subdomain}.${baseDomain}`;
            } else {
                callbackUrl = window.location.origin;
            }

            // Perform signout with redirect: false so we can manually handle the navigation
            await signOut({ redirect: false, callbackUrl });

            // Force full page navigation to the callback URL
            window.location.href = callbackUrl;
        } catch (error) {
            console.error("Signout error:", error);
            setIsSigningOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10 px-4 pt-8 pb-20">
                    <h1 className="text-lg font-medium text-blue-200 mb-4 text-center">{t('myProfile', lang)}</h1>

                    <div className="flex flex-col items-center gap-4">
                        {user.image ? (
                            <img
                                src={user.image}
                                alt={user.name}
                                className="h-24 w-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
                            />
                        ) : (
                            <div className="h-24 w-24 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/20 shadow-xl">
                                <User className="h-12 w-12" />
                            </div>
                        )}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">{user.name}</h2>
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <Badge className="bg-green-500/20 text-green-100 border-none">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    {lang === 'hi' ? 'सक्रिय' : 'Active'}
                                </Badge>
                                {stats.rating > 0 && (
                                    <Badge className="bg-white/10 text-white border-none">
                                        <Star className="h-3 w-3 mr-1" />
                                        {stats.rating.toFixed(1)}
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-12 space-y-4 relative z-20">
                {/* Quick Stats - Real Data */}
                <Card className="shadow-xl border-0 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-3 divide-x divide-slate-100">
                            <div className="p-4 text-center">
                                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                                    <Calendar className="h-5 w-5 text-blue-600" />
                                </div>
                                <p className="text-lg font-bold text-slate-800">{stats.totalTrips}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{lang === 'hi' ? 'यात्राएं' : 'Total Trips'}</p>
                            </div>
                            <div className="p-4 text-center">
                                <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
                                    <Clock className="h-5 w-5 text-green-600" />
                                </div>
                                <p className="text-lg font-bold text-slate-800">{stats.onTimePercentage}%</p>
                                <p className="text-[10px] text-slate-500 uppercase">{lang === 'hi' ? 'समय पर' : 'On Time'}</p>
                            </div>
                            <div className="p-4 text-center">
                                <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center mx-auto mb-2">
                                    <Star className="h-5 w-5 text-amber-600" />
                                </div>
                                <p className="text-lg font-bold text-slate-800">{stats.rating > 0 ? stats.rating.toFixed(1) : '-'}</p>
                                <p className="text-[10px] text-slate-500 uppercase">{lang === 'hi' ? 'रेटिंग' : 'Rating'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Route & Vehicle Card */}
                {(driver?.route || driver?.vehicle) && (
                    <Card className="shadow-lg border-0">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="h-6 w-6 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-slate-500">{t('route', lang)}</p>
                                    <p className="font-bold text-lg text-slate-800">{driver?.route?.routeNo || '-'}</p>
                                </div>
                                {driver?.route?.name && (
                                    <Badge className="bg-green-50 text-green-700 border-green-200 text-xs">
                                        {driver.route.name}
                                    </Badge>
                                )}
                            </div>

                            {driver?.vehicle && (
                                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center flex-shrink-0">
                                        <Car className="h-6 w-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-500">{t('vehicle', lang)}</p>
                                        <p className="font-bold text-lg text-slate-800 truncate">{driver.vehicle.number}</p>
                                    </div>
                                    {driver.vehicle.model && (
                                        <span className="text-sm text-slate-500 flex-shrink-0">{driver.vehicle.model}</span>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Personal Info */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-center gap-2 text-slate-700">
                            <User className="h-4 w-4 text-blue-600" />
                            {t('driverDetails', lang)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                            <Mail className="h-5 w-5 text-slate-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400">{t('email', lang)}</p>
                                <p className="font-medium text-slate-800 truncate text-sm">{user.email}</p>
                            </div>
                        </div>

                        {driver?.phone && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <Phone className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400">{t('phone', lang)}</p>
                                    <p className="font-medium text-slate-800">{driver.phone}</p>
                                </div>
                            </div>
                        )}

                        {driver?.licenseNo && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                                <CreditCard className="h-5 w-5 text-slate-400 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-slate-400">{t('license', lang)}</p>
                                    <p className="font-medium text-slate-800">{driver.licenseNo}</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Settings */}
                <Card className="shadow-lg border-0">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center justify-center gap-2 text-slate-700">
                            <Settings className="h-4 w-4 text-slate-600" />
                            {t('settings', lang)}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {/* Language Toggle */}
                        <div className="relative">
                            <button
                                onClick={() => setShowLangMenu(!showLangMenu)}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <Languages className="h-5 w-5 text-blue-500" />
                                    <div className="text-left">
                                        <p className="text-xs text-slate-400">{t('language', lang)}</p>
                                        <p className="font-medium text-slate-800">
                                            {lang === 'en' ? '🇬🇧 English' : '🇮🇳 हिंदी'}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${showLangMenu ? 'rotate-90' : ''}`} />
                            </button>

                            {showLangMenu && (
                                <div className="mt-2 bg-white rounded-xl shadow-lg border overflow-hidden">
                                    <button
                                        onClick={() => handleLanguageChange('en')}
                                        className={`w-full p-4 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors ${lang === 'en' ? 'bg-blue-50' : ''}`}
                                    >
                                        <span className="text-2xl">🇬🇧</span>
                                        <span className={`flex-1 ${lang === 'en' ? 'font-semibold text-blue-600' : 'text-slate-700'}`}>English</span>
                                        {lang === 'en' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                                    </button>
                                    <button
                                        onClick={() => handleLanguageChange('hi')}
                                        className={`w-full p-4 text-left flex items-center gap-3 hover:bg-slate-50 transition-colors border-t ${lang === 'hi' ? 'bg-blue-50' : ''}`}
                                    >
                                        <span className="text-2xl">🇮🇳</span>
                                        <span className={`flex-1 ${lang === 'hi' ? 'font-semibold text-blue-600' : 'text-slate-700'}`}>हिंदी (Hindi)</span>
                                        {lang === 'hi' && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Sign Out Button */}
                <Button
                    variant="destructive"
                    className="w-full h-14 font-semibold shadow-lg rounded-xl text-base flex items-center justify-center gap-2"
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                >
                    <LogOut className={`h-5 w-5 ${isSigningOut ? 'animate-pulse' : ''}`} />
                    {isSigningOut ? (lang === 'hi' ? 'साइन आउट हो रहा है...' : 'Signing Out...') : t('signOut', lang)}
                </Button>

                {/* App Version */}
                <p className="text-center text-xs text-slate-400 pb-6">
                    School Driver App v1.0.0
                </p>
            </div>
        </div>
    );
}
