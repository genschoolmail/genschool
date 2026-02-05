import { prisma } from "@/lib/prisma";

export async function getDriverActiveTrip(driverId: string) {
    return await prisma.driverTrip.findFirst({
        where: {
            driverId,
            status: 'ACTIVE'
        },
        include: {
            route: true
        }
    });
}

export async function closeAllDriverTrips(driverId: string) {
    await prisma.driverTrip.updateMany({
        where: {
            driverId,
            status: 'ACTIVE'
        },
        data: {
            status: 'COMPLETED', // or CANCELLED, assuming completed for safety
            endTime: new Date()
        }
    });
}