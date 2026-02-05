"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { getDriverRoute } from "@/lib/transport-actions";

// Dynamic import to avoid SSR issues with Leaflet
const TransportMap = dynamic(() => import("@/components/transport/TransportMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[calc(100vh-200px)] bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
                <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-500">Loading map...</p>
            </div>
        </div>
    )
});

export default function DriverMapPage() {
    const [route, setRoute] = useState<any>(null);
    const [currentLocation, setCurrentLocation] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get current location
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => {
                    setCurrentLocation([position.coords.latitude, position.coords.longitude]);
                },
                (error) => console.error("Error getting location:", error),
                { enableHighAccuracy: true }
            );
        }

        // Fetch route data
        const fetchRoute = async () => {
            try {
                // This would need the driver ID from session
                // For now we'll handle the no-data case gracefully
                setLoading(false);
            } catch (error) {
                console.error("Error fetching route:", error);
                setLoading(false);
            }
        };

        fetchRoute();
    }, []);

    // Build markers for the map
    const mapMarkers = [];

    // Add current location marker
    if (currentLocation) {
        mapMarkers.push({
            id: 'current',
            lat: currentLocation[0],
            lng: currentLocation[1],
            type: 'bus' as const,
            label: 'Your Location',
            popup: '<strong>📍 You are here</strong>'
        });
    }

    // Add stop markers if route exists
    if (route?.stops) {
        route.stops.forEach((stop: any, index: number) => {
            if (stop.latitude && stop.longitude) {
                mapMarkers.push({
                    id: stop.id,
                    lat: stop.latitude,
                    lng: stop.longitude,
                    type: 'stop' as const,
                    label: `${index + 1}. ${stop.name}`,
                    popup: `<strong>${stop.name}</strong><br/>Time: ${stop.arrivalTime || 'N/A'}`
                });
            }
        });
    }

    // Build route polyline
    const routePoints: [number, number][] = [];
    if (route?.stops) {
        route.stops
            .filter((s: any) => s.latitude && s.longitude)
            .sort((a: any, b: any) => a.order - b.order)
            .forEach((stop: any) => {
                routePoints.push([stop.latitude, stop.longitude]);
            });
    }

    return (
        <div className="p-4 max-w-2xl mx-auto space-y-4">
            <div className="flex items-center gap-3">
                <Link href="/driver">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Route Map</h1>
                    <p className="text-sm text-slate-500">View your route and stops</p>
                </div>
            </div>

            {/* Current Location Card */}
            {currentLocation && (
                <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                                <Navigation className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">Current Location</p>
                                <p className="text-sm text-blue-100 font-mono">
                                    {currentLocation[0].toFixed(5)}, {currentLocation[1].toFixed(5)}
                                </p>
                            </div>
                        </div>
                        <Badge className="bg-white/20 text-white hover:bg-white/30">
                            GPS Active
                        </Badge>
                    </CardContent>
                </Card>
            )}

            {/* Map */}
            <TransportMap
                markers={mapMarkers}
                center={currentLocation || [20.5937, 78.9629]}
                zoom={14}
                showRoute={routePoints.length >= 2}
                routePoints={routePoints}
                height="calc(100vh - 320px)"
            />

            {/* Stop List */}
            {route?.stops && route.stops.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            Route Stops ({route.stops.length})
                        </h3>
                        <div className="space-y-2">
                            {route.stops
                                .sort((a: any, b: any) => a.order - b.order)
                                .map((stop: any, index: number) => (
                                    <div
                                        key={stop.id}
                                        className="flex items-center justify-between p-2 bg-slate-50 rounded"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="h-6 w-6 rounded-full bg-green-100 text-green-700 text-xs font-bold flex items-center justify-center">
                                                {index + 1}
                                            </span>
                                            <span className="font-medium text-sm">{stop.name}</span>
                                        </div>
                                        <span className="text-xs text-slate-500">{stop.arrivalTime || '--:--'}</span>
                                    </div>
                                ))
                            }
                        </div>
                    </CardContent>
                </Card>
            )}

            {!route && !loading && (
                <Card className="border-dashed">
                    <CardContent className="pt-6 text-center py-8">
                        <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">No route assigned</p>
                        <p className="text-xs text-slate-400 mt-1">
                            Contact admin to get a route assignment
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
