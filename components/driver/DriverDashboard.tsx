"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MapPin, Bus, Users, Navigation, QrCode, Phone,
    Play, Square, Clock, CheckCircle2, AlertCircle,
    ChevronRight, Zap
} from "lucide-react";
import { updateDriverLocation } from "@/lib/transport-actions";
import { startTrip, endTrip, getActiveTrip } from "@/lib/driver-transport-actions";
import { t, Language } from "@/lib/driver-translations";
import { toast } from "sonner";
import Link from "next/link";

interface DriverDashboardProps {
    route: any;
    driverId: string;
    stats: {
        pickedUp: string[];
        droppedOff: string[];
    };
    notices?: any[];
}

import { format } from "date-fns";
import { Bell, Megaphone, Calendar, FileText, Image as ImageIcon } from "lucide-react";

export default function DriverDashboard({ route, driverId, stats, notices = [] }: DriverDashboardProps) {
    const [isTripActive, setIsTripActive] = useState(false);
    const [tripData, setTripData] = useState<any>(null);
    const [tripLoading, setTripLoading] = useState(false);
    const [lang, setLang] = useState<Language>('en');

    // Load language and trip status
    useEffect(() => {
        const savedLang = localStorage.getItem('driverLanguage') as Language;
        if (savedLang) setLang(savedLang);

        // Store route and driver IDs for scan page
        if (route?.id) {
            localStorage.setItem('driverRouteId', route.id);
        }
        localStorage.setItem('driverId', driverId);

        // Check for active trip
        checkTripStatus();
    }, [route, driverId]);

    const checkTripStatus = async () => {
        const result = await getActiveTrip(driverId);
        if (result.success) {
            setTripData(result.trip);
            setIsTripActive(result.isActive || false);
        }
    };

    // Stats
    const totalStudents = route?.students?.length || 0;
    const pickedUpCount = tripData?.pickedStudents || stats.pickedUp.length;
    const droppedOffCount = tripData?.droppedStudents || stats.droppedOff.length;
    const onBusCount = pickedUpCount - droppedOffCount;

    // Location tracking handled globally by DriverLocationTracker now


    const handleStartTrip = async () => {
        if (!route?.id) {
            toast.error(t('noRouteAssigned', lang));
            return;
        }

        setTripLoading(true);
        const result = await startTrip(driverId, route.id);
        setTripLoading(false);

        if (result.success) {
            setIsTripActive(true);
            setTripData(result.trip);
            toast.success(lang === 'hi' ? 'यात्रा शुरू हो गई!' : 'Trip started!');
        } else {
            toast.error(result.error || 'Failed to start trip');
        }
    };

    const handleEndTrip = async () => {
        setTripLoading(true);
        const result = await endTrip(driverId);
        setTripLoading(false);

        if (result.success) {
            setIsTripActive(false);
            setTripData(result.trip);
            toast.success(lang === 'hi' ? 'यात्रा समाप्त!' : 'Trip completed!');
        } else {
            toast.error(result.error || 'Failed to end trip');
        }
    };

    if (!route) {
        return (
            <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="pt-6 text-center py-12">
                    <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-amber-800 mb-2">
                        {t('noRouteAssigned', lang)}
                    </h3>
                    <p className="text-amber-600 text-sm">
                        {lang === 'hi' ? 'कृपया एडमिन से संपर्क करें' : 'Please contact admin'}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4 pb-24">
            {/* Route Card with Trip Control */}
            <Card className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white border-none shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>

                <CardContent className="py-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <Badge className="bg-white/20 text-white border-none mb-2">
                                {route.vehicle?.number || "No Vehicle"}
                            </Badge>
                            <h2 className="text-2xl font-bold">{route.routeNo}</h2>
                            <p className="text-blue-100 text-sm">{route.name}</p>
                        </div>
                        <div className={`h-14 w-14 rounded-full flex items-center justify-center ${isTripActive ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`}>
                            <Bus className="h-7 w-7" />
                        </div>
                    </div>

                    {/* Trip Status */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isTripActive ? (
                                    <>
                                        <div className="h-3 w-3 rounded-full bg-green-400 animate-ping"></div>
                                        <span className="font-semibold">{lang === 'hi' ? 'यात्रा चालू है' : 'Trip Active'}</span>
                                    </>
                                ) : tripData?.status === 'COMPLETED' ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                                        <span className="font-semibold">{lang === 'hi' ? 'यात्रा पूर्ण' : 'Trip Completed'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Clock className="h-5 w-5 text-blue-200" />
                                        <span className="font-medium">{lang === 'hi' ? 'यात्रा शुरू नहीं हुई' : 'Trip Not Started'}</span>
                                    </>
                                )}
                            </div>
                            {tripData?.startTime && (
                                <span className="text-xs text-blue-200">
                                    {new Date(tripData.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Action Cards - Card Style Design */}
            <div className="grid grid-cols-2 gap-3">
                {/* Start/End Trip Card */}
                {!isTripActive && tripData?.status !== 'COMPLETED' ? (
                    <div
                        className="col-span-2 bg-white border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer rounded-xl overflow-hidden"
                        onClick={!tripLoading ? handleStartTrip : undefined}
                    >
                        <div className="p-4 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                                {tripLoading ? (
                                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Play className="h-7 w-7 text-white fill-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-800">{t('startTrip', lang)}</h3>
                                <p className="text-sm text-slate-500">{lang === 'hi' ? 'यात्रा शुरू करने के लिए टैप करें' : 'Tap to begin your journey'}</p>
                            </div>
                            <ChevronRight className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                ) : isTripActive ? (
                    <>
                        {/* End Trip Card */}
                        <div
                            className={`bg-white border-2 ${onBusCount > 0 ? 'border-amber-200 opacity-75' : 'border-red-200 hover:border-red-400 hover:shadow-lg cursor-pointer'} transition-all rounded-xl overflow-hidden`}
                            onClick={!tripLoading && onBusCount === 0 ? handleEndTrip : undefined}
                        >
                            <div className="p-4 flex flex-col items-center text-center gap-2">
                                <div className={`h-14 w-14 rounded-2xl ${onBusCount > 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-red-400 to-rose-600'} flex items-center justify-center shadow-lg ${onBusCount > 0 ? 'shadow-amber-500/30' : 'shadow-red-500/30'}`}>
                                    {tripLoading ? (
                                        <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : onBusCount > 0 ? (
                                        <Bus className="h-7 w-7 text-white" />
                                    ) : (
                                        <Square className="h-6 w-6 text-white fill-white" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">
                                        {onBusCount > 0 ? `${onBusCount} ${lang === 'hi' ? 'बस में' : 'On Bus'}` : t('endTrip', lang)}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        {onBusCount > 0
                                            ? (lang === 'hi' ? 'पहले ड्रॉप करें' : 'Drop first')
                                            : (lang === 'hi' ? 'यात्रा समाप्त' : 'End journey')
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Card */}
                        <div
                            className="bg-white border-2 border-red-200 hover:border-red-400 hover:shadow-lg transition-all cursor-pointer rounded-xl overflow-hidden"
                            onClick={() => window.location.href = "tel:112"}
                        >
                            <div className="p-4 flex flex-col items-center text-center gap-2">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg shadow-red-500/30">
                                    <Phone className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{lang === 'hi' ? 'आपातकालीन' : 'Emergency'}</h3>
                                    <p className="text-xs text-slate-500">{lang === 'hi' ? '112 पर कॉल' : 'Call 112'}</p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div
                        className="col-span-2 bg-white border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all cursor-pointer rounded-xl overflow-hidden"
                        onClick={!tripLoading ? handleStartTrip : undefined}
                    >
                        <div className="p-4 flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-500/30">
                                {tripLoading ? (
                                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <Play className="h-7 w-7 text-white fill-white" />
                                )}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-slate-800">{lang === 'hi' ? 'नई यात्रा' : 'New Trip'}</h3>
                                <p className="text-sm text-slate-500">{lang === 'hi' ? 'अगली यात्रा शुरू करें' : 'Start next journey'}</p>
                            </div>
                            <ChevronRight className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
                <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
                    <CardContent className="p-4 text-center">
                        <Users className="h-6 w-6 text-slate-600 mx-auto mb-1" />
                        <span className="text-2xl font-bold text-slate-800">{totalStudents}</span>
                        <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">{t('total', lang)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardContent className="p-4 text-center">
                        <MapPin className="h-6 w-6 text-green-600 mx-auto mb-1" />
                        <span className="text-2xl font-bold text-green-700">{pickedUpCount}</span>
                        <p className="text-[10px] text-green-600 uppercase font-bold mt-1">{t('picked', lang)}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                        <Bus className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                        <span className="text-2xl font-bold text-blue-700">{droppedOffCount}</span>
                        <p className="text-[10px] text-blue-600 uppercase font-bold mt-1">{t('dropped', lang)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* On Bus Alert */}
            {onBusCount > 0 && (
                <Card className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none shadow-lg">
                    <CardContent className="py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                                <Bus className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="font-bold text-lg">{onBusCount} {t('students', lang)}</p>
                                <p className="text-xs text-white/80">{t('currentlyOnBus', lang)}</p>
                            </div>
                        </div>
                        <Link href="/driver/students">
                            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-none">
                                {lang === 'hi' ? 'देखें' : 'View'}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Quick Actions - Card Style */}
            <div className="space-y-3">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    {lang === 'hi' ? 'त्वरित कार्रवाई' : 'Quick Actions'}
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    {/* QR Scan Card */}
                    <Link href="/driver/scan" className="block">
                        <div className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all ${isTripActive ? 'border-green-200' : 'border-slate-200 opacity-60'}`}>
                            <div className="p-4 flex flex-col items-center text-center gap-3">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${isTripActive ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/30' : 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-slate-400/30'}`}>
                                    <QrCode className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{t('qrScan', lang)}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {isTripActive
                                            ? (lang === 'hi' ? 'QR स्कैन करें' : 'Scan QR')
                                            : (lang === 'hi' ? 'पहले यात्रा शुरू करें' : 'Start trip first')
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Students Card */}
                    <Link href="/driver/students" className="block">
                        <div className={`bg-white border-2 rounded-xl overflow-hidden hover:shadow-lg transition-all ${isTripActive ? 'border-blue-200' : 'border-slate-200 opacity-60'}`}>
                            <div className="p-4 flex flex-col items-center text-center gap-3">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${isTripActive ? 'bg-gradient-to-br from-blue-400 to-indigo-600 shadow-blue-500/30' : 'bg-gradient-to-br from-slate-300 to-slate-400 shadow-slate-400/30'}`}>
                                    <Users className="h-7 w-7 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{t('studentsLabel', lang)}</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        {isTripActive
                                            ? t('pickupDrop', lang)
                                            : (lang === 'hi' ? 'पहले यात्रा शुरू करें' : 'Start trip first')
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Route Map Card - Full Width */}
                    <Link href="/driver/map" className="block col-span-2">
                        <div className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                            <div className="p-4 flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
                                    <Navigation className="h-7 w-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-slate-800">{t('routeMap', lang)}</h4>
                                    <p className="text-xs text-slate-500">{t('viewStops', lang)}</p>
                                </div>
                                <ChevronRight className="h-6 w-6 text-purple-500" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Route Stops Preview */}
            {route.stops && route.stops.length > 0 && (
                <Card className="border-slate-200">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            {t('routeStops', lang)} ({route.stops.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-0 relative pl-4 border-l-2 border-blue-200 ml-2">
                            {route.stops.slice(0, 4).map((stop: any, index: number) => (
                                <div key={stop.id} className="relative pl-6 pb-4 last:pb-0">
                                    <div className={`absolute -left-[21px] top-0 rounded-full w-4 h-4 z-10 border-2 ${index === 0 ? 'bg-green-500 border-green-500' :
                                        index === route.stops.length - 1 ? 'bg-red-500 border-red-500' :
                                            'bg-white border-blue-500'
                                        }`}></div>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-slate-800 text-sm">{stop.name}</p>
                                            <p className="text-xs text-slate-500">{stop.arrivalTime || t('noTime', lang)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {route.stops.length > 4 && (
                                <p className="text-xs text-slate-500 pl-6">
                                    +{route.stops.length - 4} {lang === 'hi' ? 'और स्टॉप' : 'more stops'}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
