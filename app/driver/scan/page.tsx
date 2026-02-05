"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import jsQR from "jsqr";
import { ArrowLeft, Camera, ArrowUpFromLine, ArrowDownToLine, Check, User, X, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import { markStudentPickup, markStudentDrop, getStudentByQR, getActiveTrip } from "@/lib/driver-transport-actions";
import { t, Language } from "@/lib/driver-translations";

interface ScanResult {
    studentId: string;
    studentName: string;
    className: string;
    admissionNo: string;
    routeId?: string | null;
    photo?: string | null;
    isPickedUp?: boolean;
    isDropped?: boolean;
}

export default function ScanPage() {
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [mode, setMode] = useState<'pickup' | 'drop'>('pickup');
    const [actionLoading, setActionLoading] = useState(false);
    const [actionComplete, setActionComplete] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [routeId, setRouteId] = useState<string>("");
    const [driverId, setDriverId] = useState<string>("");
    const [activeTrip, setActiveTrip] = useState<any>(null);
    const [lang, setLang] = useState<Language>('en');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        const storedRouteId = localStorage.getItem('driverRouteId') || '';
        let storedDriverId = localStorage.getItem('driverId') || '';
        const savedLang = localStorage.getItem('driverLanguage') as Language;
        setRouteId(storedRouteId);
        if (savedLang) setLang(savedLang);

        const initDriver = async () => {
            if (!storedDriverId) {
                // Recover from server if missing (e.g. reload or cleared storage)
                try {
                    const { getCurrentDriverId } = await import("@/lib/driver-transport-actions");
                    const recoverId = await getCurrentDriverId();
                    if (recoverId) {
                        storedDriverId = recoverId;
                        localStorage.setItem('driverId', recoverId);
                        console.log("Recovered Driver ID:", recoverId);
                    }
                } catch (e) {
                    console.error("Failed to recover driver ID", e);
                }
            }

            setDriverId(storedDriverId);

            if (storedDriverId) {
                const { getActiveTrip } = await import("@/lib/driver-transport-actions");
                getActiveTrip(storedDriverId).then(trip => setActiveTrip(trip));
            }
        };

        initDriver();
    }, []);

    const stopCamera = useCallback(() => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setIsScanning(false);
    }, []);

    const scanQRCode = useCallback(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
            animationRef.current = requestAnimationFrame(scanQRCode);
            return;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
        });

        if (code) {
            console.log("QR Found:", code.data);
            stopCamera();
            processQRCode(code.data);
        } else {
            animationRef.current = requestAnimationFrame(scanQRCode);
        }
    }, [stopCamera]);

    const startCamera = async () => {
        setError(null);
        setIsScanning(true);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { exact: "environment" } },
                audio: false
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.setAttribute("playsinline", "true");
                await videoRef.current.play();
                animationRef.current = requestAnimationFrame(scanQRCode);
            }
        } catch (err: any) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false
                });

                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.setAttribute("playsinline", "true");
                    await videoRef.current.play();
                    animationRef.current = requestAnimationFrame(scanQRCode);
                }
            } catch (fallbackErr: any) {
                setError(t('cameraAccessDenied', lang));
                setIsScanning(false);
            }
        }
    };

    async function processQRCode(qrData: string) {
        try {
            const result = await getStudentByQR(qrData, driverId || undefined);

            if (result.success && result.student) {
                setScanResult({
                    studentId: result.student.id,
                    studentName: result.student.name,
                    className: result.student.className,
                    admissionNo: result.student.admissionNo,
                    routeId: result.student.routeId,
                    photo: result.student.photo,
                    isPickedUp: result.student.isPickedUp,
                    isDropped: result.student.isDropped
                });
                toast.success(t('studentFound', lang));
            } else {
                let studentId = qrData;
                let studentName = "Unknown Student";
                let className = "";
                let admissionNo = qrData;

                if (qrData.includes(":")) {
                    const parts = qrData.split(":");
                    studentId = parts[1] || qrData;
                    studentName = parts[2] || "Unknown";
                    className = parts[3] || "";
                    admissionNo = parts[4] || parts[1] || qrData;
                }

                setScanResult({ studentId, studentName, className, admissionNo });
                toast.info(lang === 'hi' ? "QR स्कैन हुआ - कृपया छात्र की पुष्टि करें" : "QR scanned - please verify student");
            }
        } catch (error) {
            toast.error(t('qrProcessFailed', lang));
            setScanResult(null);
        }
    }

    // Check if action is allowed based on current state
    const canPerformAction = () => {
        if (!scanResult) return { allowed: false, reason: '' };

        if (mode === 'pickup') {
            if (scanResult.isPickedUp) {
                return { allowed: false, reason: t('alreadyPickedUp', lang) };
            }
            return { allowed: true, reason: '' };
        } else {
            if (!scanResult.isPickedUp) {
                return { allowed: false, reason: t('needsPickupFirst', lang) };
            }
            if (scanResult.isDropped) {
                return { allowed: false, reason: t('alreadyDropped', lang) };
            }
            return { allowed: true, reason: '' };
        }
    };

    async function handleAction() {
        if (!scanResult) return;

        const { allowed, reason } = canPerformAction();
        if (!allowed) {
            toast.error(reason);
            return;
        }

        setActionLoading(true);

        try {
            const studentRouteId = scanResult.routeId || routeId;

            if (!studentRouteId) {
                toast.error(t('transportNotAssigned', lang));
                setActionLoading(false);
                return;
            }

            // Get location before marking
            let lat: number | undefined;
            let lng: number | undefined;

            if (navigator.geolocation) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 3000 });
                    });
                    lat = position.coords.latitude;
                    lng = position.coords.longitude;
                } catch (e) {
                    console.error("Loc fetch failed", e);
                }
            }

            let result;
            if (mode === 'pickup') {
                result = await markStudentPickup(scanResult.studentId, studentRouteId, driverId || 'driver', lat, lng);
            } else {
                result = await markStudentDrop(scanResult.studentId, studentRouteId, driverId || 'driver', lat, lng);
            }

            if (result.success) {
                setActionComplete(true);
                toast.success(
                    mode === 'pickup'
                        ? `✅ ${scanResult.studentName} ${t('pickupSuccess', lang)}`
                        : `🏠 ${scanResult.studentName} ${t('dropSuccess', lang)}`,
                    { description: new Date().toLocaleTimeString() }
                );
            } else {
                toast.error(result.error || t('somethingWentWrong', lang));
            }
        } catch (error) {
            toast.error(t('somethingWentWrong', lang));
        } finally {
            setActionLoading(false);
        }
    }

    function resetScanner() {
        setScanResult(null);
        setActionComplete(false);
        setError(null);
    }

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    const actionCheck = scanResult ? canPerformAction() : { allowed: true, reason: '' };

    // Helper for safe date formatting
    const safelyFormatTime = (dateInput: any) => {
        try {
            if (!dateInput) return "--:--";
            const date = new Date(dateInput);
            if (isNaN(date.getTime())) return "Invalid Time";
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch (e) {
            return "Error";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 pb-24">
            <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Link href="/driver">
                        <Button variant="ghost" size="icon" className="rounded-full bg-white shadow-sm h-10 w-10">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">{t('scanQR', lang)}</h1>
                        <p className="text-sm text-slate-500">{t('scanWithBackCamera', lang)}</p>
                    </div>
                </div>

                {/* Trip Status Banner (Safe & Rebuilt) */}
                <div className="mb-6">
                    {activeTrip ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                            <div>
                                <h3 className="font-bold text-green-900 flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Trip Active
                                </h3>
                                <p className="text-sm text-green-700 mt-1">
                                    Started: {safelyFormatTime(activeTrip.startTime || activeTrip.createdAt)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col items-center text-center shadow-sm">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mb-3">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                            </div>
                            <h3 className="font-bold text-red-900">Trip Not Started</h3>
                            <p className="text-sm text-red-600 mb-3">You must start a trip to begin.</p>
                            <Link href="/driver" className="w-full">
                                <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold">
                                    Start Trip
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Only show Scanner controls if Trip is Active */}
                {activeTrip && (
                    <>
                        {/* Mode Selector */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <button
                                onClick={() => setMode('pickup')}
                                className={`p-4 rounded-xl border-2 transition-all shadow-sm ${mode === 'pickup'
                                    ? 'border-green-500 bg-green-50 shadow-green-100'
                                    : 'border-slate-200 bg-white hover:border-green-200'
                                    }`}
                            >
                                <ArrowUpFromLine className={`h-7 w-7 mx-auto mb-2 ${mode === 'pickup' ? 'text-green-600' : 'text-slate-400'}`} />
                                <p className={`font-bold ${mode === 'pickup' ? 'text-green-700' : 'text-slate-600'}`}>{t('pickup', lang)}</p>
                            </button>
                            <button
                                onClick={() => setMode('drop')}
                                className={`p-4 rounded-xl border-2 transition-all shadow-sm ${mode === 'drop'
                                    ? 'border-blue-500 bg-blue-50 shadow-blue-100'
                                    : 'border-slate-200 bg-white hover:border-blue-200'
                                    }`}
                            >
                                <ArrowDownToLine className={`h-7 w-7 mx-auto mb-2 ${mode === 'drop' ? 'text-blue-600' : 'text-slate-400'}`} />
                                <p className={`font-bold ${mode === 'drop' ? 'text-blue-700' : 'text-slate-600'}`}>{t('drop', lang)}</p>
                            </button>
                        </div>

                        {/* Main Card */}
                        <Card className="overflow-hidden shadow-xl border-0">
                            <CardContent className="p-0">
                                {/* Initial State */}
                                {!isScanning && !scanResult && (
                                    <div className="text-center py-12 px-6">
                                        <div className="h-28 w-28 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                            <Camera className="h-14 w-14 text-slate-500" />
                                        </div>
                                        <p className="text-slate-800 font-bold text-xl mb-2">{t('readyToScan', lang)}</p>
                                        <p className="text-sm text-slate-500 mb-6">{t('scanStudentQR', lang)}</p>

                                        {error && (
                                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5 text-sm text-red-700">
                                                {error}
                                            </div>
                                        )}

                                        <Button
                                            onClick={() => {
                                                if (!activeTrip) {
                                                    toast.error("Please Start Trip first!");
                                                    return;
                                                }
                                                startCamera();
                                            }}
                                            size="lg"
                                            className={`w-full text-white font-bold h-14 text-lg rounded-xl ${mode === 'pickup' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                                                } ${!activeTrip ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Camera className="h-5 w-5 mr-2" />
                                            {mode === 'pickup' ? t('startPickupScan', lang) : t('startDropScan', lang)}
                                        </Button>
                                    </div>
                                )}

                                {/* Scanning State */}
                                {isScanning && (
                                    <div className="relative bg-black">
                                        <video
                                            ref={videoRef}
                                            className="w-full h-80 object-cover"
                                            playsInline
                                            muted
                                        />
                                        <canvas ref={canvasRef} className="hidden" />

                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-64 h-64 border-4 border-white rounded-2xl relative">
                                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-green-400 rounded-tl-lg"></div>
                                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-green-400 rounded-tr-lg"></div>
                                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-green-400 rounded-bl-lg"></div>
                                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-green-400 rounded-br-lg"></div>
                                            </div>
                                        </div>

                                        <Button
                                            variant="secondary"
                                            className="absolute top-3 right-3 bg-white/90 shadow-lg"
                                            onClick={stopCamera}
                                        >
                                            <X className="h-4 w-4 mr-1" /> {t('cancel', lang)}
                                        </Button>

                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                            <p className="text-white text-center font-medium">{t('bringQRToBox', lang)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Scanned Result */}
                                {scanResult && !actionComplete && (
                                    <div className="text-center py-8 px-6">
                                        {/* Student Photo */}
                                        {scanResult.photo ? (
                                            <img
                                                src={scanResult.photo}
                                                alt={scanResult.studentName}
                                                className="h-24 w-24 rounded-full object-cover mx-auto mb-4 border-4 border-white shadow-lg"
                                            />
                                        ) : (
                                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-4 shadow-inner">
                                                <User className="h-12 w-12 text-slate-600" />
                                            </div>
                                        )}

                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">{scanResult.studentName}</h3>
                                        <p className="text-slate-600 font-medium">{scanResult.className}</p>
                                        <p className="text-sm text-slate-500 mb-4">Adm: {scanResult.admissionNo}</p>

                                        {/* Status Badges */}
                                        <div className="flex gap-2 justify-center mb-4">
                                            {scanResult.isPickedUp && (
                                                <Badge className="bg-green-100 text-green-700 border-green-200">
                                                    ✅ {t('alreadyPickedUp', lang)}
                                                </Badge>
                                            )}
                                            {scanResult.isDropped && (
                                                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                                    🏠 {t('alreadyDropped', lang)}
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Action Status */}
                                        {!actionCheck.allowed ? (
                                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                                                <p className="text-sm text-amber-700">{actionCheck.reason}</p>
                                            </div>
                                        ) : (
                                            <Badge className={`mb-6 text-sm py-1 px-3 ${mode === 'pickup' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>
                                                {mode === 'pickup' ? `📥 ${t('pickupMarked', lang)}` : `📤 ${t('dropMarked', lang)}`}
                                            </Badge>
                                        )}

                                        <div className="flex gap-3">
                                            <Button
                                                variant="outline"
                                                className="flex-1 h-12 font-semibold"
                                                onClick={resetScanner}
                                            >
                                                {t('cancel', lang)}
                                            </Button>
                                            <Button
                                                className={`flex-1 h-12 text-white font-bold ${mode === 'pickup' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                onClick={handleAction}
                                                disabled={actionLoading || !actionCheck.allowed}
                                            >
                                                {actionLoading ? (
                                                    <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> {t('processing', lang)}</>
                                                ) : (
                                                    mode === 'pickup' ? t('confirmPickup', lang) : t('confirmDrop', lang)
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Action Complete */}
                                {actionComplete && (
                                    <div className="text-center py-12 px-6">
                                        <div className={`h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4 ${mode === 'pickup' ? 'bg-green-100' : 'bg-blue-100'
                                            }`}>
                                            <Check className={`h-12 w-12 ${mode === 'pickup' ? 'text-green-600' : 'text-blue-600'}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold text-slate-900 mb-1">
                                            {mode === 'pickup' ? t('pickupDone', lang) : t('dropDone', lang)}
                                        </h3>
                                        <p className="text-slate-600 mb-6 font-medium">{scanResult?.studentName}</p>
                                        <Button size="lg" className="w-full h-12 font-bold" onClick={resetScanner}>
                                            {t('scanNextStudent', lang)}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Manual Link */}
                        <div className="mt-6 text-center">
                            <Link href="/driver/students" className="text-sm text-blue-600 hover:underline font-medium">
                                {t('orManualMark', lang)} →
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
