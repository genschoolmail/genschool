"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Bus, RefreshCw, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { getStudentBusLocation } from "@/lib/student-transport-actions";
import { Button } from "@/components/ui/button";

// Dynamic import to avoid SSR issues with Leaflet
const TransportMap = dynamic(() => import("@/components/transport/TransportMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[300px] bg-slate-100 rounded-lg flex items-center justify-center">
            <RefreshCw className="h-6 w-6 text-slate-400 animate-spin" />
        </div>
    )
});

export default function LiveBusTracker({ studentId }: { studentId: string }) {
    const [busData, setBusData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showMap, setShowMap] = useState(false);

    useEffect(() => {
        const fetchLocation = async () => {
            try {
                const data = await getStudentBusLocation(studentId);
                setBusData(data);
            } catch (error) {
                console.error("Error fetching bus location:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLocation();
        const interval = setInterval(fetchLocation, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, [studentId]);

    if (loading) {
        return (
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6 text-center py-8">
                    <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                    <p>Loading bus location...</p>
                </CardContent>
            </Card>
        );
    }

    // Common Map Markers and Section
    // Ensure we have valid coordinates numbers
    const hasValidLocation = busData?.location &&
        typeof busData.location.latitude === 'number' &&
        typeof busData.location.longitude === 'number';

    const mapMarkers = hasValidLocation ? [{
        id: 'bus',
        lat: busData.location.latitude,
        lng: busData.location.longitude,
        type: 'bus' as const,
        label: busData.vehicleNumber,
        popup: `
            <div>
                <strong>🚌 ${busData.vehicleNumber}</strong><br/>
                <span>Route: ${busData.routeNo}</span><br/>
                <span>Driver: ${busData.driverName}</span>
            </div>
        `
    }] : [];

    const MapSection = () => (
        <div className="mt-4">
            <Button
                variant="outline"
                size="sm"
                className="w-full mb-2"
                onClick={() => setShowMap(!showMap)}
            >
                <MapPin className="h-4 w-4 mr-2" />
                {showMap ? 'Hide Map' : 'View Bus Live Location'}
            </Button>

            {showMap && hasValidLocation && (
                <Card className="overflow-hidden mt-2">
                    <CardContent className="p-0">
                        <TransportMap
                            markers={mapMarkers}
                            center={[busData.location.latitude, busData.location.longitude]}
                            zoom={15}
                            height="300px"
                        />
                    </CardContent>
                </Card>
            )}
        </div>
    );

    // Status: Trip Not Started (Inactive)
    if (busData?.status === 'TRIP_NOT_STARTED' || busData?.status === 'NO_DRIVER_ASSIGNED') {
        return (
            <div className="space-y-4">
                <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                                <Bus className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">Transport Inactive</h3>
                                <p className="text-white/90">The driver has not started the trip yet.</p>
                                <div className="mt-4 flex items-center gap-2 text-sm bg-white/20 rounded-full px-3 py-1.5 w-fit">
                                    <Clock className="h-4 w-4" />
                                    <span>Scheduled for later</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Status: Waiting for Pickup (Active Trip)
    if (busData?.status === 'WAITING_FOR_PICKUP') {
        return (
            <div className="space-y-4">
                <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                                <AlertCircle className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">Waiting for Pickup</h3>
                                <p className="text-white/90">Your bus will pick you up soon. Location will be visible after pickup.</p>
                                <div className="mt-4 flex items-center gap-2 text-sm bg-white/20 rounded-full px-3 py-1.5 w-fit">
                                    <Bus className="h-4 w-4" />
                                    <span>Bus is active</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Map hidden during waiting as requested */}
            </div>
        );
    }

    // Status: Trip Completed (Dropped)
    if (busData?.status === 'TRIP_COMPLETED' || busData?.isDropped) {
        return (
            <div className="space-y-4">
                <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <CardContent className="pt-6 relative z-10">
                        <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                                <CheckCircle2 className="h-7 w-7" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold mb-1">Trip Completed</h3>
                                <p className="text-white/90">You have been safely dropped off. Have a great day!</p>
                                <div className="mt-4 flex items-center gap-2 text-sm bg-white/20 rounded-full px-3 py-1.5 w-fit">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Reached destination</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // No location data
    if (!busData || !busData.location) {
        return (
            <Card className="bg-gradient-to-br from-slate-400 to-slate-500 text-white">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                            <Bus className="h-7 w-7" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Bus Location Unavailable</h3>
                            <p className="text-white/80">The bus is currently not transmitting its location.</p>
                            <p className="text-sm text-white/60 mt-1">Driver may not have started the trip yet.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Live tracking - Student is on the bus (ON_TRIP)
    return (
        <div className="space-y-4">
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                <CardContent className="pt-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                                <Bus className="h-7 w-7" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-1">{busData.vehicleNumber}</h3>
                                <p className="text-blue-100">Route {busData.routeNo}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-green-500 px-3 py-1.5 rounded-full">
                            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                            <span className="text-sm font-medium">Live</span>
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                        <p className="text-sm text-blue-100 mb-2 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            You are currently on the bus
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <MapPin className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-blue-100">Current Location</p>
                                <p className="font-mono text-sm">
                                    {busData.location.latitude.toFixed(5)}, {busData.location.longitude.toFixed(5)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-blue-100">Last Updated</p>
                                <p className="text-sm font-medium">
                                    {new Date(busData.location.timestamp).toLocaleTimeString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-200" />
                            <p className="text-sm text-blue-100">
                                Driver: <span className="font-medium text-white">{busData.driverName}</span>
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <MapSection />
        </div>
    );
}
