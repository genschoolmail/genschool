"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Driver Permission Management
 * Handle browser permissions for GPS, Camera, and Notifications
 */

export async function getDriverPermissions(driverId: string) {
    try {
        let permissions = await prisma.driverPermissions.findUnique({
            where: { driverId }
        });

        // Create default permissions if they don't exist
        if (!permissions) {
            permissions = await prisma.driverPermissions.create({
                data: {
                    driverId,
                    gps: false,
                    camera: false,
                    notifications: false
                }
            });
        }

        return permissions;
    } catch (error) {
        console.error("Error fetching driver permissions:", error);
        return null;
    }
}

export async function updateDriverPermissions(
    driverId: string,
    permissions: {
        gps?: boolean;
        camera?: boolean;
        notifications?: boolean;
    }
) {
    try {
        // Ensure permissions record exists
        await getDriverPermissions(driverId);

        const updated = await prisma.driverPermissions.update({
            where: { driverId },
            data: {
                ...permissions,
                lastChecked: new Date()
            }
        });

        revalidatePath("/driver");
        return { success: true, permissions: updated };
    } catch (error) {
        console.error("Error updating driver permissions:", error);
        return { success: false, error: "Failed to update permissions" };
    }
}

export async function checkAllPermissionsGranted(driverId: string): Promise<boolean> {
    try {
        const permissions = await getDriverPermissions(driverId);
        if (!permissions) return false;

        return permissions.gps && permissions.camera && permissions.notifications;
    } catch (error) {
        console.error("Error checking permissions:", error);
        return false;
    }
}

export async function setPermissionChecked(driverId: string) {
    try {
        await prisma.driverPermissions.update({
            where: { driverId },
            data: { lastChecked: new Date() }
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating lastChecked:", error);
        return { success: false };
    }
}
