import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DriverProfileClient from "./DriverProfileClient";
import { getDriverStats } from "@/lib/driver-transport-actions";

export default async function ProfilePage() {
    const session = await auth();

    if (!session || !session.user || (session.user as any)?.role !== "DRIVER") {
        redirect("/login");
    }


    // Get driver profile with route and vehicle info
    const driver = await prisma.driver.findUnique({
        where: { userId: session?.user?.id },
        include: {
            user: true,
            route: {
                include: {
                    vehicle: true
                }
            },
            vehicle: true
        }
    });

    // Get driver stats
    let stats = { totalTrips: 0, onTimePercentage: 0, rating: 0 };
    if (driver) {
        const statsResult = await getDriverStats(driver.id);
        if (statsResult.success) {
            stats = {
                totalTrips: statsResult.totalTrips || 0,
                onTimePercentage: statsResult.onTimePercentage || 0,
                rating: statsResult.rating || 0
            };
        }
    }

    return (
        <DriverProfileClient
            userRole={(session.user as any)?.role}
            subdomain={(session.user as any)?.subdomain}
            user={{
                name: session?.user?.name || '',
                email: session?.user?.email || '',
                image: session?.user?.image || null
            }}
            driver={driver ? {
                id: driver.id,
                phone: driver.phone || '',
                licenseNo: driver.licenseNo || '',
                joiningDate: driver.joiningDate,
                route: driver.route ? {
                    routeNo: driver.route.routeNo,
                    name: driver.route.name || ''
                } : null,
                vehicle: driver.vehicle || driver.route?.vehicle ? {
                    number: (driver.vehicle || driver.route?.vehicle)?.number || '',
                    model: (driver.vehicle || driver.route?.vehicle)?.model || undefined
                } : null
            } : null}
            stats={stats}
        />
    );
}
