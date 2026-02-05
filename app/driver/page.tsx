import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DriverDashboard from "@/components/driver/DriverDashboard";
import { getDriverRoute } from "@/lib/transport-actions";
import { getTodayAttendance } from "@/lib/driver-transport-actions";
import PermissionGate from "./permissions/PermissionGate";
import { prisma } from "@/lib/prisma";
import DriverPageHeader from "./DriverPageHeader";
import { getAnnouncements } from "@/lib/actions/announcement-actions";
import { getActiveAnnouncements } from "@/lib/actions/global-notifications";

export default async function DriverPage() {
    const session = await auth();

    // Ensure user is logged in and is a driver
    if (!session || session.user.role !== "DRIVER") {
        if (!session) redirect("/login");
        redirect("/login");
    }

    // Get driver profile
    const driver = await prisma.driver.findUnique({
        where: { userId: session.user.id }
    });

    if (!driver) {
        redirect("/login");
    }

    const route = await getDriverRoute(session.user.id);

    const allNotices = await getAnnouncements({ targetRole: "DRIVER", isPublic: false });

    interface AttendanceStats {
        pickedUp: string[];
        droppedOff: string[];
    }

    let attendanceStats: AttendanceStats = { pickedUp: [], droppedOff: [] };
    if (route) {
        const stats = await getTodayAttendance(route.id, driver.id);
        if (stats.success) {
            attendanceStats = {
                pickedUp: stats.pickedUp || [],
                droppedOff: stats.droppedOff || []
            };
        }
    }

    return (
        <PermissionGate driverId={driver.id}>
            <div className="p-4 max-w-md mx-auto">
                <DriverPageHeader
                    userName={session.user.name || 'Driver'}
                    userImage={session.user.image}
                    notices={allNotices}
                />
                <DriverDashboard
                    route={route}
                    driverId={driver.id}
                    stats={attendanceStats}
                />
            </div>
        </PermissionGate>
    );
}
