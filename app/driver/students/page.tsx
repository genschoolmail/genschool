import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StudentList from "@/components/driver/StudentList";
import StudentsPageHeader from "./StudentsPageHeader";

export default async function DriverStudentsPage() {
    const session = await auth();

    if (!session || session.user.role !== "DRIVER") {
        redirect("/login");
    }

    // Get driver profile with route
    const driver = await prisma.driver.findUnique({
        where: { userId: session.user.id },
        include: {
            route: true
        }
    });

    if (!driver) {
        redirect("/login");
    }

    if (!driver.route) {
        return (
            <div className="p-4 max-w-lg mx-auto">
                <StudentsPageHeader routeNo="" routeName="" noRoute />
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                    <p className="text-slate-500">No route assigned yet.</p>
                    <p className="text-sm text-slate-400 mt-1">Contact admin to get a route assignment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-lg mx-auto pb-20">
            <StudentsPageHeader
                routeNo={driver.route.routeNo}
                routeName={driver.route.name || ''}
            />
            <StudentList routeId={driver.route.id} driverId={driver.id} />
        </div>
    );
}
