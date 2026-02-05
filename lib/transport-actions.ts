"use server";

import { prisma } from "@/lib/prisma";
import { ensureTenantId } from "@/lib/tenant";

export async function getDriverRoute(userId: string) {
    try {
        const schoolId = await ensureTenantId();
        const driver = await prisma.driver.findUnique({
            where: { userId },
            include: {
                route: {
                    include: {
                        vehicle: true,
                        stops: {
                            where: { schoolId },
                            orderBy: { order: 'asc' }
                        },
                        students: {
                            where: { schoolId }
                        }
                    }
                }
            }
        });

        if (!driver || !driver.route) {
            return null;
        }

        return driver.route;
    } catch (error) {
        console.error("[GET_DRIVER_ROUTE]", error);
        return null;
    }
}

export async function updateDriverLocation(driverId: string, lat: number, lng: number) {
    try {
        const schoolId = await ensureTenantId();
        
        // This usually creates a history record or updates a real-time table
        await prisma.driverLocation.create({
            data: {
                schoolId,
                driverId,
                latitude: lat,
                longitude: lng,
                timestamp: new Date()
            }
        });

        return { success: true };
    } catch (error) {
        console.error("[UPDATE_DRIVER_LOCATION]", error);
        return { success: false };
    }
}