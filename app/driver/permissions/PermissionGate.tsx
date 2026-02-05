"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDriverPermissions } from "@/lib/driver-permissions";
import PermissionRequest from "./PermissionRequest";

interface PermissionGateProps {
    driverId: string;
    children: React.ReactNode;
}

export default function PermissionGate({ driverId, children }: PermissionGateProps) {
    const [checking, setChecking] = useState(true);
    const [showRequest, setShowRequest] = useState(false);
    const [permissions, setPermissions] = useState({
        gps: false,
        camera: false,
        notifications: false
    });
    const router = useRouter();

    useEffect(() => {
        checkPermissions();
    }, [driverId]);

    async function checkPermissions() {
        try {
            // Check server-side permission records
            const serverPerms = await getDriverPermissions(driverId);

            if (serverPerms) {
                setPermissions({
                    gps: serverPerms.gps,
                    camera: serverPerms.camera,
                    notifications: serverPerms.notifications
                });

                // If all permissions are granted, show app
                if (serverPerms.gps && serverPerms.camera && serverPerms.notifications) {
                    setShowRequest(false);
                } else {
                    setShowRequest(true);
                }
            } else {
                // No permissions record, show request screen
                setShowRequest(true);
            }
        } catch (error) {
            console.error("Error checking permissions:", error);
            setShowRequest(true);
        } finally {
            setChecking(false);
        }
    }

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Checking permissions...</p>
                </div>
            </div>
        );
    }

    if (showRequest) {
        return (
            <PermissionRequest
                driverId={driverId}
                currentPermissions={permissions}
                onComplete={() => {
                    setShowRequest(false);
                    router.refresh();
                }}
            />
        );
    }

    return <>{children}</>;
}
