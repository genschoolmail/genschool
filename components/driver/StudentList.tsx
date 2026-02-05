"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Users, MapPin, Check, ArrowDownToLine, ArrowUpFromLine,
    Phone, RefreshCw, ChevronDown, ChevronUp, Bus, Clock, AlertCircle, X
} from "lucide-react";
import { getRouteStudents, markStudentPickup, markStudentDrop, getTodayAttendance, getActiveTrip } from "@/lib/driver-transport-actions";
import { toast } from "sonner";
import { t, Language } from "@/lib/driver-translations";
import Link from "next/link";

interface StudentListProps {
    routeId: string;
    driverId: string;
}

interface PickedStudent {
    id: string;
    name: string;
    className: string;
    photo: string | null;
    pickupTime: Date;
}

export default function StudentList({ routeId, driverId }: StudentListProps) {
    const [data, setData] = useState<any>(null);
    const [attendance, setAttendance] = useState<{ pickedUp: string[], droppedOff: string[], pickedStudentsDetails: PickedStudent[] }>({
        pickedUp: [],
        droppedOff: [],
        pickedStudentsDetails: []
    });
    const [loading, setLoading] = useState(true);
    const [expandedStop, setExpandedStop] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'all' | 'stops' | 'picked'>('all');
    const [lang, setLang] = useState<Language>('en');
    const [tripActive, setTripActive] = useState(false);

    // Search State
    const [searchQuery, setSearchQuery] = useState("");

    // Filter Students based on search
    const filteredStudents = data?.allStudents?.filter((student: any) =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.admissionNo.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    // Load language and trip status
    useEffect(() => {
        const savedLang = localStorage.getItem('driverLanguage') as Language;
        if (savedLang) setLang(savedLang);

        // Check trip status
        const checkTrip = async () => {
            const result = await getActiveTrip(driverId);
            setTripActive(result.isActive || false);
        };
        checkTrip();
    }, [driverId]);

    const fetchData = async () => {
        setLoading(true);
        const [studentsRes, attendanceRes] = await Promise.all([
            getRouteStudents(routeId),
            getTodayAttendance(routeId, driverId)
        ]);

        if (studentsRes.success) {
            setData(studentsRes);
        }
        if (attendanceRes.success) {
            setAttendance({
                pickedUp: attendanceRes.pickedUp || [],
                droppedOff: attendanceRes.droppedOff || [],
                pickedStudentsDetails: attendanceRes.pickedStudentsDetails || []
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [routeId]);

    const handlePickup = async (studentId: string, studentName: string) => {
        // Check if trip is active
        if (!tripActive) {
            toast.error(lang === 'hi' ? 'पहले यात्रा शुरू करें' : 'Start trip first');
            return;
        }

        // Check if already picked up
        if (attendance.pickedUp.includes(studentId)) {
            toast.error(lang === 'hi' ? 'पहले से पिक हो चुका है' : 'Already picked up');
            return;
        }

        setActionLoading(studentId);

        let lat: number | undefined;
        let lng: number | undefined;
        if (navigator.geolocation) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                });
                lat = position.coords.latitude;
                lng = position.coords.longitude;
            } catch (e) { console.error("Loc error", e); }
        }

        const result = await markStudentPickup(studentId, routeId, driverId, lat, lng);
        setActionLoading(null);

        if (result.success) {
            toast.success(`✅ ${studentName} ${t('pickupSuccess', lang)}`, {
                description: new Date().toLocaleTimeString()
            });
            setAttendance(prev => ({
                ...prev,
                pickedUp: [...prev.pickedUp, studentId]
            }));
            // Refresh to get updated picked students list
            fetchData();
        } else {
            toast.error(result.error || t('pickupFailed', lang));
        }
    };

    const handleDrop = async (studentId: string, studentName: string) => {
        // Check if trip is active
        if (!tripActive) {
            toast.error(lang === 'hi' ? 'पहले यात्रा शुरू करें' : 'Start trip first');
            return;
        }

        // Check if not picked up yet
        if (!attendance.pickedUp.includes(studentId)) {
            toast.error(lang === 'hi' ? 'पहले पिक करना होगा' : 'Needs pickup first');
            return;
        }

        // Check if already dropped
        if (attendance.droppedOff.includes(studentId)) {
            toast.error(lang === 'hi' ? 'पहले से ड्रॉप हो चुका है' : 'Already dropped');
            return;
        }

        setActionLoading(studentId);

        let lat: number | undefined;
        let lng: number | undefined;
        if (navigator.geolocation) {
            try {
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                });
                lat = position.coords.latitude;
                lng = position.coords.longitude;
            } catch (e) { console.error("Loc error", e); }
        }

        const result = await markStudentDrop(studentId, routeId, driverId, lat, lng);
        setActionLoading(null);

        if (result.success) {
            toast.success(`🏠 ${studentName} ${t('dropSuccess', lang)}`, {
                description: new Date().toLocaleTimeString()
            });
            setAttendance(prev => ({
                ...prev,
                droppedOff: [...prev.droppedOff, studentId]
            }));
            // Refresh to get updated list
            fetchData();
        } else {
            toast.error(result.error || t('dropFailed', lang));
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-slate-400" />
                    <p className="text-slate-500">{t('loadingStudents', lang)}</p>
                </CardContent>
            </Card>
        );
    }

    if (!data || !data.studentsByStop) {
        return (
            <Card>
                <CardContent className="pt-6 text-center py-8">
                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500">{t('noStudentsAssigned', lang)}</p>
                </CardContent>
            </Card>
        );
    }

    const pickedCount = attendance.pickedUp.length;
    const droppedCount = attendance.droppedOff.length;
    const onBusCount = pickedCount - droppedCount;

    return (
        <div className="space-y-4">
            {/* Trip Not Active Warning */}
            {!tripActive && (
                <Card className="bg-amber-50 border-amber-200">
                    <CardContent className="py-4 flex items-center gap-4">
                        <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold text-amber-800">
                                {lang === 'hi' ? 'यात्रा शुरू नहीं हुई' : 'Trip Not Started'}
                            </p>
                            <p className="text-sm text-amber-600">
                                {lang === 'hi' ? 'छात्रों को पिक/ड्रॉप करने के लिए पहले यात्रा शुरू करें' : 'Start trip to pickup/drop students'}
                            </p>
                        </div>
                        <Link href="/driver">
                            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                                {lang === 'hi' ? 'जाएं' : 'Go'}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Summary Card */}
            <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-none">
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white/80 text-sm">{t('todayStatus', lang)}</p>
                            <p className="text-xl font-bold">{data.totalStudents} {t('students', lang)}</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="text-center">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                                    <ArrowUpFromLine className="h-5 w-5" />
                                </div>
                                <p className="text-xs">{pickedCount} {t('picked', lang)}</p>
                            </div>
                            <div className="text-center">
                                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-1">
                                    <ArrowDownToLine className="h-5 w-5" />
                                </div>
                                <p className="text-xs">{droppedCount} {t('dropped', lang)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tab Selector */}
            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg sticky top-0 z-10">
                <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${activeTab === 'all'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    {t('allStudents', lang) || "All List"}
                </button>
                <button
                    onClick={() => setActiveTab('stops')}
                    className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all ${activeTab === 'stops'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    {t('studentsByStop', lang) || "By Stop"}
                </button>
                <button
                    onClick={() => setActiveTab('picked')}
                    className={`flex-1 py-2 px-2 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1 ${activeTab === 'picked'
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                        }`}
                >
                    <Bus className="h-3 w-3" />
                    {t('onBus', lang) || "On Bus"} ({onBusCount})
                </button>
            </div>

            {/* Content Area */}
            <div className="space-y-3">

                {/* 1. All Students Tab (Flat List with Pickup/Drop) */}
                {activeTab === 'all' && (
                    <div className="space-y-3">
                        {data.allStudents.map((student: any) => {
                            const isPicked = attendance.pickedUp.includes(student.id);
                            const isDropped = attendance.droppedOff.includes(student.id);
                            const canDrop = isPicked && !isDropped;
                            const hasStop = student.pickupStop;

                            return (
                                <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded-lg border shadow-sm">
                                    <div className="flex-1 min-w-0 mr-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-semibold text-slate-900 truncate">{student.name}</p>
                                            {isPicked && !isDropped && (
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-[10px] h-5 px-1.5">
                                                    Picked
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">
                                            {student.className} • {student.admissionNo}
                                        </p>
                                        <p className="text-xs text-slate-400 truncate mt-0.5">
                                            {hasStop ? `Pickup: ${student.pickupStop}` : 'No Stop Details'}
                                        </p>
                                    </div>

                                    <div className="flex gap-2 shrink-0">
                                        {/* Pickup Button */}
                                        <Button
                                            size="sm"
                                            variant={isPicked ? "secondary" : "default"}
                                            className={`${isPicked
                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                : "bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                } h-9 px-3`}
                                            disabled={isPicked || actionLoading === student.id}
                                            onClick={() => handlePickup(student.id, student.name)}
                                        >
                                            {actionLoading === student.id ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : isPicked ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <ArrowUpFromLine className="h-4 w-4" />
                                            )}
                                        </Button>

                                        {/* Drop Button */}
                                        <Button
                                            size="sm"
                                            variant={isDropped ? "secondary" : canDrop ? "default" : "outline"}
                                            className={`${isDropped
                                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                                : canDrop
                                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                                                    : "bg-slate-50 text-slate-300 border-slate-200"
                                                } h-9 px-3`}
                                            disabled={!canDrop || actionLoading === student.id}
                                            onClick={() => handleDrop(student.id, student.name)}
                                        >
                                            {actionLoading === student.id ? (
                                                <RefreshCw className="h-4 w-4 animate-spin" />
                                            ) : isDropped ? (
                                                <Check className="h-4 w-4" />
                                            ) : (
                                                <ArrowDownToLine className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* 2. Students By Stop Tab */}
                {activeTab === 'stops' && (
                    <div className="space-y-3">
                        {data.studentsByStop.map((stopData: any) => (
                            <Card key={stopData.stop.id} className="overflow-hidden">
                                <button
                                    className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                                    onClick={() => setExpandedStop(expandedStop === stopData.stop.id ? null : stopData.stop.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                            <MapPin className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{stopData.stop.name}</p>
                                            <p className="text-xs text-slate-500">{stopData.stop.arrivalTime || t('noTime', lang)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {stopData.pickupStudents.length + stopData.dropStudents.length} {t('students', lang)}
                                        </Badge>
                                        {expandedStop === stopData.stop.id ? (
                                            <ChevronUp className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        )}
                                    </div>
                                </button>

                                {expandedStop === stopData.stop.id && (
                                    <div className="border-t bg-slate-50 p-4 space-y-4">
                                        {/* Pickup Students */}
                                        {stopData.pickupStudents.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-green-600 mb-2 flex items-center gap-1">
                                                    <ArrowUpFromLine className="h-3 w-3" /> {t('pickup', lang).toUpperCase()} ({stopData.pickupStudents.length})
                                                </p>
                                                <div className="space-y-2">
                                                    {stopData.pickupStudents.map((student: any) => {
                                                        const isPicked = attendance.pickedUp.includes(student.id);
                                                        return (
                                                            <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                                                <div>
                                                                    <p className="font-medium text-sm">{student.name}</p>
                                                                    <p className="text-xs text-slate-500">
                                                                        {student.className} • {student.admissionNo}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant={isPicked ? "secondary" : "default"}
                                                                    className={isPicked ? "bg-green-100 text-green-700" : "bg-green-600 hover:bg-green-700"}
                                                                    disabled={isPicked || actionLoading === student.id}
                                                                    onClick={() => handlePickup(student.id, student.name)}
                                                                >
                                                                    {actionLoading === student.id ? (
                                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                                    ) : isPicked ? (
                                                                        <><Check className="h-4 w-4 mr-1" /> {t('done', lang)}</>
                                                                    ) : (
                                                                        t('pickupBtn', lang)
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Drop Students */}
                                        {stopData.dropStudents.length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                                                    <ArrowDownToLine className="h-3 w-3" /> {t('drop', lang).toUpperCase()} ({stopData.dropStudents.length})
                                                </p>
                                                <div className="space-y-2">
                                                    {stopData.dropStudents.map((student: any) => {
                                                        const isPicked = attendance.pickedUp.includes(student.id);
                                                        const isDropped = attendance.droppedOff.includes(student.id);
                                                        const canDrop = isPicked && !isDropped;

                                                        return (
                                                            <div key={student.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                                                                <div>
                                                                    <p className="font-medium text-sm">{student.name}</p>
                                                                    <p className="text-xs text-slate-500">
                                                                        {student.className} • {student.admissionNo}
                                                                    </p>
                                                                </div>

                                                                <Button
                                                                    size="sm"
                                                                    variant={isDropped ? "secondary" : canDrop ? "default" : "outline"}
                                                                    className={
                                                                        isDropped
                                                                            ? "bg-blue-100 text-blue-700"
                                                                            : canDrop
                                                                                ? "bg-blue-600 hover:bg-blue-700"
                                                                                : "text-slate-400"
                                                                    }
                                                                    disabled={!canDrop || actionLoading === student.id}
                                                                    onClick={() => handleDrop(student.id, student.name)}
                                                                >
                                                                    {actionLoading === student.id ? (
                                                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                                                    ) : isDropped ? (
                                                                        <><Check className="h-4 w-4 mr-1" /> {t('done', lang)}</>
                                                                    ) : !isPicked ? (
                                                                        <span className="text-xs">{t('needsPickupFirst', lang)}</span>
                                                                    ) : (
                                                                        t('dropBtn', lang)
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}

                {/* 3. Picked Students Tab */}
                {activeTab === 'picked' && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Bus className="h-5 w-5 text-green-600" />
                                {t('pickedStudents', lang)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {attendance.pickedStudentsDetails.length === 0 ? (
                                <div className="text-center py-8">
                                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                    <p className="text-slate-500">{t('noStudentsPicked', lang)}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {attendance.pickedStudentsDetails.map((student) => {
                                        const isDropped = attendance.droppedOff.includes(student.id);
                                        return (
                                            <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg bg-indigo-50/50 border-indigo-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                                                        {student.name ? student.name.charAt(0) : 'S'}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{student.name || t('studentFound', lang)}</p>
                                                        <p className="text-xs text-slate-500">{student.className} • {new Date(student.pickupTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={isDropped ? "outline" : "default"}
                                                    className={`${isDropped
                                                        ? "text-green-600 border-green-200 bg-green-50"
                                                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                                                        }`}
                                                    onClick={() => handleDrop(student.id, student.name)}
                                                    disabled={isDropped || actionLoading === student.id}
                                                >
                                                    {isDropped ? (
                                                        <><Check className="h-4 w-4 mr-1" /> {t('dropped', lang)}</>
                                                    ) : (
                                                        t('dropBtn', lang)
                                                    )}
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
