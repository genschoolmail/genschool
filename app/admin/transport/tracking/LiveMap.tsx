"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, User, RefreshCw, Signal, SignalZero } from "lucide-react";
import { getAllDriverLocations } from "@/lib/admin-transport-actions";
import { Button } from "@/components/ui/button";

// Dynamic import to avoid SSR issues with Leaflet
const TransportMap = dynamic(() => import("@/components/transport/TransportMap"), {
    ssr: false,
    loading: () => (
        <div className="h-[500px] bg-slate-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
                <RefreshCw className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-2" />
                <p className="text-slate-500">Loading map...</p>
            </div>
        </div>
    )
});

export default function LiveMap() {
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchLocations = async () => {
        try {
            const data = await getAllDriverLocations();
            setDrivers(data || []);
            setLastUpdate(new Date());
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 10000); // Poll every 10 seconds

        return () => clearInterval(interval);
    }, []);

    // Convert drivers to map markers - only those with location data
    const mapMarkers = drivers
        .filter(d => d.location)
        .map(driver => ({
            id: driver.driverId,
            lat: driver.location.latitude,
            lng: driver.location.longitude,
            type: 'bus' as const,
            label: driver.vehicleNumber,
            popup: `
                <div style="min-width: 180px; font-family: system-ui;">
                    <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${driver.vehicleNumber}</div>
                    <div style="color: #666; font-size: 12px;">👤 ${driver.name}</div>
                    <div style="color: #666; font-size: 12px;">🛣️ ${driver.routeNo}${driver.routeName ? ` - ${driver.routeName}` : ''}</div>
                    ${driver.phone ? `<div style="color: #666; font-size: 12px;">📞 ${driver.phone}</div>` : ''}
                    <div style="color: #999; font-size: 11px; margin-top: 4px;">
                        Updated: ${new Date(driver.location.timestamp).toLocaleTimeString()}
                    </div>
                </div>
            `
        }));

    // Use isActive from API for accurate status
    const activeCount = drivers.filter(d => d.isActive).length;
    const inactiveCount = drivers.length - activeCount;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map Section */}
            <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <Signal className="h-3 w-3 mr-1" />
                            {activeCount} Active
                        </Badge>
                        <Badge variant="outline" className="bg-slate-50 text-slate-600">
                            <SignalZero className="h-3 w-3 mr-1" />
                            {inactiveCount} Inactive
                        </Badge>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchLocations}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <TransportMap
                    markers={mapMarkers}
                    height="500px"
                    zoom={13}
                />

                {lastUpdate && (
                    <p className="text-xs text-slate-500 text-center">
                        Last updated: {lastUpdate.toLocaleTimeString()}
                    </p>
                )}
            </div>

            {/* Sidebar - Vehicle List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                <h2 className="font-semibold text-lg sticky top-0 bg-white py-2">
                    Fleet Status ({drivers.length})
                </h2>

                {drivers.length === 0 && !loading && (
                    <Card className="border-dashed">
                        <CardContent className="pt-6 text-center">
                            <Bus className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 font-medium">No vehicles found</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Add vehicles and drivers to start tracking
                            </p>
                        </CardContent>
                    </Card>
                )}

                {drivers.map((driver) => (
                    <Card
                        key={driver.driverId}
                        className={`border-l-4 transition-all hover:shadow-md ${driver.location
                            ? 'border-l-green-500 bg-green-50/30'
                            : 'border-l-slate-300'
                            }`}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-slate-900">{driver.vehicleNumber || 'No Vehicle'}</h3>
                                    <p className="text-sm text-slate-500">{driver.routeNo || 'No Route'}</p>
                                </div>
                                <div className={`h-3 w-3 rounded-full ${driver.location ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
                            </div>

                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                                <User className="h-3.5 w-3.5" />
                                <span>{driver.name}</span>
                            </div>

                            {driver.location ? (
                                <div className="text-xs bg-slate-50 p-2 rounded border">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Position:</span>
                                        <span className="font-mono">
                                            {driver.location.latitude.toFixed(4)}, {driver.location.longitude.toFixed(4)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between mt-1">
                                        <span className="text-slate-500">Updated:</span>
                                        <span>{new Date(driver.location.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                                    ⚠️ No location data - Driver may be offline
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
