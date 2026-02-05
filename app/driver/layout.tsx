import { Inter } from "next/font/google";
import DriverBottomNav from "@/components/driver/DriverBottomNav";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import DriverLocationTracker from "@/components/driver/DriverLocationTracker";

const inter = Inter({ subsets: ["latin"] });

export default async function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    let driverId = null;

    if (session?.user?.role === "DRIVER") {
        const driver = await prisma.driver.findUnique({
            where: { userId: session.user.id },
            select: { id: true }
        });
        driverId = driver?.id;
    }

    return (
        <div className={`min-h-screen bg-gray-50 ${inter.className}`}>
            {driverId && <DriverLocationTracker driverId={driverId} />}
            <main className="pb-20"> {/* Padding for bottom nav */}
                {children}
            </main>
            <DriverBottomNav />
        </div>
    );
}
