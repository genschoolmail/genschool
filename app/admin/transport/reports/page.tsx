import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bus, MapPin, Users, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import TransportReportsCharts from "@/components/admin/TransportReportsCharts";

export default async function TransportReportsPage() {
    // 1. Fetch Counts
    const totalVehicles = await prisma.vehicle.count();
    const activeRoutes = await prisma.transportRoute.count({ where: { isActive: true } });

    // 2. Fetch Weekly Attendance Stats
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 6);

    const attendanceRecords = await prisma.transportAttendance.findMany({
        where: {
            timestamp: { gte: lastWeek }
        },
        select: {
            timestamp: true,
            type: true
        }
    });

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyStatsMap = new Map();

    // Initialize last 7 days
    for (let i = 0; i < 7; i++) {
        const d = new Date(lastWeek);
        d.setDate(lastWeek.getDate() + i);
        const dayName = days[d.getDay()];
        weeklyStatsMap.set(dayName, { name: dayName, picked: 0, dropped: 0 });
    }

    // Fill with data
    attendanceRecords.forEach(record => {
        const dayName = days[record.timestamp.getDay()];
        if (weeklyStatsMap.has(dayName)) {
            const stats = weeklyStatsMap.get(dayName);
            if (record.type === 'PICKUP') stats.picked++;
            if (record.type === 'DROP') stats.dropped++;
        }
    });

    const attendanceStats = Array.from(weeklyStatsMap.values());

    // 3. Route Utilization (Actual Count)
    const routes = await prisma.transportRoute.findMany({
        where: { isActive: true },
        take: 5,
        orderBy: { routeNo: 'asc' },
        include: { vehicle: true }
    });

    const routeUtilization = await Promise.all(routes.map(async (r) => {
        // Count students assigned to this route (Direct or via Stops)
        const count = await prisma.student.count({
            where: {
                OR: [
                    { transportId: r.id },
                    { transportMapping: { pickupStop: { routeId: r.id } } },
                    { transportMapping: { dropStop: { routeId: r.id } } }
                ]
            }
        });

        return {
            name: r.routeNo,
            value: count,
            capacity: r.vehicle?.capacity || 0
        };
    }));

    // 4. Students Transported Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const studentsTransportedToday = await prisma.transportAttendance.groupBy({
        by: ['studentId'],
        where: { timestamp: { gte: todayStart } }
    });
    const totalTransportedCount = studentsTransportedToday.length;


    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/transport">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Transport Analytics</h1>
                    <p className="text-muted-foreground">Real-time reports and statistics</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Fleet</CardTitle>
                        <Bus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalVehicles}</div>
                        <p className="text-xs text-muted-foreground">Vehicles registered</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeRoutes}</div>
                        <p className="text-xs text-muted-foreground">Currently active</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Students Today</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTransportedCount}</div>
                        <p className="text-xs text-muted-foreground">Transported today</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">98%</div>
                        <p className="text-xs text-muted-foreground">Estimated performance</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <TransportReportsCharts
                attendanceStats={attendanceStats}
                routeUtilization={routeUtilization}
            />

            {/* Live Alerts (Static for now as DB doesn't track maintenance yet) */}
            <Card className="border-l-4 border-l-amber-500">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-700">
                        <AlertCircle className="h-5 w-5" />
                        Maintenance Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <div>
                                <p className="font-semibold text-slate-700">System Notification</p>
                                <p className="text-sm text-muted-foreground">Regular fleet inspection recommended</p>
                            </div>
                            <span className="text-amber-600 text-sm font-medium">Weekly</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
