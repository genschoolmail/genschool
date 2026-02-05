"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";


// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const BusIcon = L.divIcon({
    className: 'custom-bus-marker',
    html: `<div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(59,130,246,0.5); border: 3px solid white;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="1">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
        </svg>
    </div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});

const StopIcon = L.divIcon({
    className: 'custom-stop-marker',
    html: `<div style="background: #10B981; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(16,185,129,0.4); border: 2px solid white;">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24]
});

interface MapMarker {
    id: string;
    lat: number;
    lng: number;
    type: 'bus' | 'stop' | 'default';
    label?: string;
    popup?: string;
}

interface TransportMapProps {
    center?: [number, number];
    zoom?: number;
    markers?: MapMarker[];
    showRoute?: boolean;
    routePoints?: [number, number][];
    className?: string;
    height?: string;
}

export default function TransportMap({
    center = [20.5937, 78.9629], // Default to India center
    zoom = 12,
    markers = [],
    showRoute = false,
    routePoints = [],
    className = "",
    height = "400px"
}: TransportMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const layerGroupRef = useRef<any>(null);
    const polylineRef = useRef<any>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        try {
            const map = L.map(mapRef.current).setView(center, zoom);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            const layerGroup = L.layerGroup().addTo(map);
            layerGroupRef.current = layerGroup;
            mapInstanceRef.current = map;
        } catch (error) {
            console.error("Error initializing Leaflet map:", error);
        }

        return () => {
            if (mapInstanceRef.current) {
                // Ensure layer group is cleared before checking removal
                if (layerGroupRef.current) {
                    layerGroupRef.current.clearLayers();
                    layerGroupRef.current = null;
                }
                mapInstanceRef.current.off();
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update markers
    useEffect(() => {
        if (!mapInstanceRef.current || !layerGroupRef.current) return;

        const layerGroup = layerGroupRef.current;
        layerGroup.clearLayers();

        markers.forEach(marker => {
            if (typeof marker.lat !== 'number' || typeof marker.lng !== 'number') return;

            let icon = DefaultIcon;
            if (marker.type === 'bus') icon = BusIcon;
            if (marker.type === 'stop') icon = StopIcon;

            try {
                const leafletMarker = L.marker([marker.lat, marker.lng], { icon });
                if (marker.popup) leafletMarker.bindPopup(marker.popup);
                if (marker.label) leafletMarker.bindTooltip(marker.label, { permanent: false, direction: 'top' });
                layerGroup.addLayer(leafletMarker);
            } catch (err) {
                console.error("Error adding marker:", err);
            }
        });

        if (markers.length > 0) {
            try {
                const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
                if (mapInstanceRef.current) mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
            } catch (err) {
                console.error("Error fitting bounds:", err);
            }
        }
    }, [markers]);

    // Update route line
    useEffect(() => {
        if (!mapInstanceRef.current) return;

        if (polylineRef.current) {
            polylineRef.current.remove();
            polylineRef.current = null;
        }

        if (showRoute && routePoints.length >= 2) {
            try {
                polylineRef.current = L.polyline(routePoints, {
                    color: '#3B82F6',
                    weight: 4,
                    opacity: 0.8,
                    dashArray: '10, 10'
                }).addTo(mapInstanceRef.current);
            } catch (err) {
                console.error("Error adding polyline:", err);
            }
        }
    }, [showRoute, routePoints]);

    return (
        <div
            ref={mapRef}
            className={`rounded-lg overflow-hidden border shadow-sm ${className}`}
            style={{ height, width: '100%' }}
        />
    );
}
