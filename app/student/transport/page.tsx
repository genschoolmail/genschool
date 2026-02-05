import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getStudentTransportInfo, getStudentTransportAttendance } from "@/lib/student-transport-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, MapPin, User, Clock, Navigation } from "lucide-react";
import LiveBusTracker from "./LiveBusTracker";
import { prisma } from "@/lib/prisma";

export default async function StudentTransportPage() {
    const session = await auth();

    if (!session || session.user.role !== "STUDENT") {
        redirect("/login");
    }

    // Get student profile
    const student = await prisma.student.findUnique({
        where: { userId: session.user.id }
    });

    if (!student) {
        redirect("/login");
    }

    const transportInfo = await getStudentTransportInfo(student.id);
    const attendance = await getStudentTransportAttendance(student.id, 5);

    if (!transportInfo || !transportInfo.route) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">My Transport</h1>
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <Bus className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Transport Assigned</h3>
                        <p className="text-gray-500">You are not currently assigned to any transport route.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { route: routeData, mapping } = transportInfo;
    // Cast to any to access nested properties that Prisma includes but TypeScript doesn't infer
    const route = routeData as any;

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">My Transport</h1>
                <p className="text-muted-foreground">Track your school bus and view route details</p>
            </div>

            {/* Live Tracker Section */}
            <LiveBusTracker studentId={student.id} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Route Info */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Route Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground">Route Number</span>
                                <p className="text-lg font-bold">{route.routeNo}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Route Name</span>
                                <p className="text-lg font-semibold">{route.name}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                            <div>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                    Start Point
                                </span>
                                <p className="font-medium">{route.startPoint}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                    End Point
                                </span>
                                <p className="font-medium">{route.endPoint}</p>
                            </div>
                        </div>

                        {mapping && (
                            <div className="pt-4 border-t">
                                <h4 className="font-semibold mb-3">My Stops</h4>
                                <div className="space-y-3">
                                    {mapping.pickupStop && (
                                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                            <Navigation className="h-5 w-5 text-green-600" />
                                            <div className="flex-1">
                                                <p className="font-medium text-green-900">{mapping.pickupStop.name}</p>
                                                <p className="text-sm text-green-700">Pickup: {mapping.pickupStop.arrivalTime}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-white">Pickup</Badge>
                                        </div>
                                    )}
                                    {mapping.dropStop && (
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                            <Navigation className="h-5 w-5 text-blue-600" />
                                            <div className="flex-1">
                                                <p className="font-medium text-blue-900">{mapping.dropStop.name}</p>
                                                <p className="text-sm text-blue-700">Drop: {mapping.dropStop.arrivalTime}</p>
                                            </div>
                                            <Badge variant="outline" className="bg-white">Drop</Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Vehicle & Driver Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bus className="h-5 w-5" />
                                Vehicle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {route.vehicle ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Number:</span>
                                        <span className="font-bold">{route.vehicle.number}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Model:</span>
                                        <span className="font-medium">{route.vehicle.model}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Capacity:</span>
                                        <span className="font-medium">{route.vehicle.capacity}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-sm">No vehicle assigned</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Driver
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {route.driver ? (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Name:</span>
                                        <span className="font-medium">{route.driver.user.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Phone:</span>
                                        <span className="font-medium">{route.driver.phone || "N/A"}</span>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-sm">No driver assigned</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Recent Activity */}
            {attendance.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {attendance.map((record: any) => (
                                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${record.status === 'BOARDED' ? 'bg-green-500' : record.status === 'ALIGHTED' ? 'bg-blue-500' : 'bg-gray-400'}`}></div>
                                        <div>
                                            <p className="font-medium capitalize">{record.type.toLowerCase()}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(record.timestamp).toLocaleString()}
                                            </p>
                                            {/* Show location if available */}
                                            {record.latitude && record.longitude && (
                                                <p className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                                                    <MapPin className="h-3 w-3 inline" />
                                                    {Number(record.latitude).toFixed(5)}, {Number(record.longitude).toFixed(5)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant={record.status === 'BOARDED' ? 'default' : 'secondary'}>
                                        {record.status}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
