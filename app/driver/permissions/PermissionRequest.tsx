"use client";

import { useState } from "react";
import { MapPin, Camera, Bell, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateDriverPermissions } from "@/lib/driver-permissions";
import { toast } from "sonner";

interface PermissionRequestProps {
    driverId: string;
    currentPermissions: {
        gps: boolean;
        camera: boolean;
        notifications: boolean;
    };
    onComplete: () => void;
}

export default function PermissionRequest({
    driverId,
    currentPermissions,
    onComplete
}: PermissionRequestProps) {
    const [permissions, setPermissions] = useState(currentPermissions);
    const [requesting, setRequesting] = useState(false);

    const permissionItems = [
        {
            icon: MapPin,
            name: "GPS Location",
            key: "gps" as const,
            description: "Track your live location during trips",
            granted: permissions.gps,
            apiName: "geolocation" as const
        },
        {
            icon: Camera,
            name: "Camera",
            key: "camera" as const,
            description: "Scan QR codes for student attendance",
            granted: permissions.camera,
            apiName: "camera" as const
        },
        {
            icon: Bell,
            name: "Notifications",
            key: "notifications" as const,
            description: "Receive trip and attendance alerts",
            granted: permissions.notifications,
            apiName: "notifications" as const
        }
    ];

    async function requestPermission(item: typeof permissionItems[0]) {
        setRequesting(true);

        try {
            let granted = false;

            if (item.apiName === "geolocation") {
                // Request geolocation permission
                const result = await new Promise<boolean>((resolve) => {
                    navigator.geolocation.getCurrentPosition(
                        () => resolve(true),
                        () => resolve(false)
                    );
                });
                granted = result;
            } else if (item.apiName === "camera") {
                // Request camera permission
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    stream.getTracks().forEach(track => track.stop());
                    granted = true;
                } catch {
                    granted = false;
                }
            } else if (item.apiName === "notifications") {
                // Request notification permission
                if (("Notification" in window)) {
                    const result = await Notification.requestPermission();
                    granted = result === "granted";
                }
            }

            // Update permissions in database
            const updateData = { [item.key]: granted };
            const res = await updateDriverPermissions(driverId, updateData);

            if (res.success) {
                setPermissions(prev => ({ ...prev, [item.key]: granted }));
                if (granted) {
                    toast.success(`${item.name} permission granted!`);
                } else {
                    toast.error(`${item.name} permission denied. Please enable it manually.`);
                }
            }
        } catch (error) {
            console.error("Permission request error:", error);
            toast.error("Failed to request permission");
        } finally {
            setRequesting(false);
        }
    }

    async function handleContinue() {
        const allGranted = permissions.gps && permissions.camera && permissions.notifications;

        if (!allGranted) {
            toast.warning("Some permissions are missing. You may have limited functionality.");
        }

        onComplete();
    }

    const allGranted = permissions.gps && permissions.camera && permissions.notifications;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Permission Required
                    </h1>
                    <p className="text-gray-600">
                        Grant permissions to use all features of the Driver App
                    </p>
                </div>

                <div className="space-y-4 mb-6">
                    {permissionItems.map((item) => (
                        <Card key={item.key} className={item.granted ? "border-green-500" : ""}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-3 rounded-lg ${item.granted ? "bg-green-100" : "bg-gray-100"
                                            }`}>
                                            <item.icon className={`h-6 w-6 ${item.granted ? "text-green-600" : "text-gray-600"
                                                }`} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{item.name}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                                        </div>
                                    </div>
                                    {item.granted ? (
                                        <CheckCircle className="h-6 w-6 text-green-600" />
                                    ) : (
                                        <XCircle className="h-6 w-6 text-gray-400" />
                                    )}
                                </div>
                            </CardHeader>
                            {!item.granted && (
                                <CardContent>
                                    <Button
                                        onClick={() => requestPermission(item)}
                                        disabled={requesting}
                                        className="w-full"
                                    >
                                        {requesting ? "Requesting..." : `Grant ${item.name}`}
                                    </Button>
                                </CardContent>
                            )}
                        </Card>
                    ))}
                </div>

                {!allGranted && (
                    <Card className="bg-yellow-50 border-yellow-200 mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-yellow-900">
                                        Some permissions are missing
                                    </p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Without all permissions, some features may not work properly.
                                        You can enable them later from your browser settings.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Button
                    onClick={handleContinue}
                    className="w-full"
                    size="lg"
                >
                    {allGranted ? "Continue to App" : "Continue Anyway"}
                </Button>
            </div>
        </div>
    );
}
