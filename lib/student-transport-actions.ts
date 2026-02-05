'use server';

import { prisma } from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant";

export async function getStudentTransportInfo(studentId: string) {
    try {
        const schoolId = await getTenantId();

        // Find the transport mapping for the student to get stop details
        const mapping = await prisma.studentTransportMapping.findUnique({
            where: { studentId },
            include: {
                pickupStop: true,
                dropStop: true
            }
        });

        // Find the student and their assigned route
        const student = await prisma.student.findUnique({
            where: { id: studentId, schoolId },
            include: {
                transport: {
                    include: {
                        vehicle: true,
                        driver: {
                            include: {
                                user: {
                                    select: { name: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!student || !student.transport) return null;

        return {
            route: student.transport,
            mapping: mapping
        };
    } catch (error) {
        console.error("Error fetching transport info:", error);
        return null;
    }
}

export async function getStudentTransportAttendance(studentId: string, limit: number = 5) {
    try {
        const schoolId = await getTenantId();
        return await prisma.transportAttendance.findMany({
            where: { studentId, schoolId },
            orderBy: { timestamp: 'desc' },
            take: limit
        });
    } catch (error) {
        console.error("Error fetching transport attendance:", error);
        return [];
    }
}

export async function getStudentBusLocation(studentId: string) {
    try {
        const schoolId = await getTenantId();
        
        const student = await prisma.student.findUnique({
            where: { id: studentId, schoolId },
            include: { transport: true }
        });

        if (!student || !student.transport || !student.transport.driverId) {
            return { status: 'NO_DRIVER_ASSIGNED' };
        }

        const driverId = student.transport.driverId;
        const routeId = student.transport.id;

        // Get the active trip for this driver and route
        const activeTrip = await prisma.driverTrip.findFirst({
            where: { 
                driverId, 
                routeId,
                status: 'ACTIVE'
            }
        });

        if (!activeTrip) {
            return { status: 'TRIP_NOT_STARTED' };
        }

        // Get the latest location transmitted by the driver
        const latestLocation = await prisma.driverLocation.findFirst({
            where: { driverId, schoolId },
            orderBy: { timestamp: 'desc' }
        });

        // Get driver/vehicle info for display (refetching to get inclusions)
        const transport = await prisma.transportRoute.findUnique({
            where: { id: routeId },
            include: {
                vehicle: true,
                driver: {
                    include: {
                        user: { select: { name: true } }
                    }
                }
            }
        });

        // Check if student has already been dropped in this active trip
        const droppedRecord = await prisma.transportAttendance.findFirst({
            where: {
                studentId,
                routeId,
                status: 'ALIGHTED',
                timestamp: { gte: activeTrip.startTime }
            }
        });

        // Check if student has boarded in this active trip
        const boardedRecord = await prisma.transportAttendance.findFirst({
            where: {
                studentId,
                routeId,
                status: 'BOARDED',
                timestamp: { gte: activeTrip.startTime }
            }
        });

        let status = 'ON_TRIP';
        if (!boardedRecord) {
            status = 'WAITING_FOR_PICKUP';
        } else if (droppedRecord) {
            status = 'TRIP_COMPLETED';
        }

        return {
            status,
            isDropped: !!droppedRecord,
            location: latestLocation ? {
                latitude: latestLocation.latitude,
                longitude: latestLocation.longitude,
                timestamp: latestLocation.timestamp
            } : null,
            vehicleNumber: transport?.vehicle?.number || 'N/A',
            routeNo: transport?.routeNo || 'N/A',
            driverName: transport?.driver?.user?.name || 'N/A'
        };
    } catch (error) {
        console.error("Error fetching bus location:", error);
        return { status: 'ERROR' };
    }
}