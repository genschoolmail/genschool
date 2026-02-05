"use client";

import { useEffect, useState } from "react";
import { updateDriverLocation } from "@/lib/transport-actions";
import { getActiveTrip } from "@/lib/driver-transport-actions";

interface DriverLocationTrackerProps {
    driverId: string;
}

export default function DriverLocationTracker({ driverId }: DriverLocationTrackerProps) {
    const [isTracking, setIsTracking] = useState(false);

    // 1. Check for active trip status periodically
    useEffect(() => {
        let isMounted = true;

        const checkStatus = async () => {
            try {
                const result = await getActiveTrip(driverId);
                if (isMounted) {
                    setIsTracking(result.isActive || false);
                }
            } catch (error) {
                console.error("Error checking trip status:", error);
            }
        };

        // Check immediately and then every 10 seconds
        checkStatus();
        const interval = setInterval(checkStatus, 10000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [driverId]);

    // 2. Track and update location when a trip is active
    useEffect(() => {
        if (!isTracking) return;

        let watchId: number;

        if (navigator.geolocation) {
            // Update immediately on start
            navigator.geolocation.getCurrentPosition(
                (pos) => updateDriverLocation(driverId, pos.coords.latitude, pos.coords.longitude),
                (err) => console.error("Initial location error:", err)
            );

            // Watch for changes
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    // Send to server
                    // Only log errors, don't spam console on success
                    updateDriverLocation(
                        driverId,
                        position.coords.latitude,
                        position.coords.longitude
                    ).catch(e => console.error("Loc update failed", e));
                },
                (error) => console.error("Location tracking error:", error),
                {
                    enableHighAccuracy: true,
                    timeout: 20000,
                    maximumAge: 10000
                }
            );
        }

        return () => {
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isTracking, driverId]);

    return null; // Renderless component
}
