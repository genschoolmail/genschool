import { getRouteById, getVehicles, getDrivers } from "@/lib/admin-transport-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bus, User, Navigation, ArrowLeft, Clock, Users } from "lucide-react";
import Link from "next/link";
import AddStopDialog from "./AddStopDialog";
import AssignStudentDialog from "./AssignStudentDialog";
import EditRouteDialog from "./EditRouteDialog";
import DeleteRouteButton from "./DeleteRouteButton";
import DeleteStopButton from "./DeleteStopButton";
import AssignedStudentsList from "@/components/transport/AssignedStudentsList";
import { notFound } from "next/navigation";

export default async function RouteDetailsPage({ params }: { params: { id: string } }) {
    const route = await getRouteById(params.id);
    const vehicles = await getVehicles();
    const drivers = await getDrivers();

    if (!route) {
        notFound();
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="h-10 w-10 rounded-full">
                        <Link href="/admin/transport/routes">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{route.routeNo}</h1>
                            <Badge className={route.isActive ? "bg-green-100 text-green-700 hover:bg-green-100" : "bg-red-100 text-red-700"}>
                                {route.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-lg">{route.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <EditRouteDialog route={route} vehicles={vehicles} drivers={drivers} />
                    <DeleteRouteButton routeId={route.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Stops & Students */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Stops Section */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-6 w-6" />
                                <h2 className="text-xl font-semibold">Stops & Schedule</h2>
                            </div>
                            <AddStopDialog routeId={route.id} />
                        </div>
                        <CardContent className="p-6">
                            <div className="relative pl-8 border-l-2 border-slate-200 ml-4 space-y-8">
                                {route.stops.map((stop, index) => (
                                    <div key={stop.id} className="relative group">
                                        <div className="absolute -left-[39px] top-1 bg-white border-4 border-blue-500 rounded-full w-6 h-6 z-10 transition-transform group-hover:scale-110"></div>
                                        <div className="flex justify-between items-start bg-slate-50 p-4 rounded-lg hover:shadow-sm transition-shadow">
                                            <div>
                                                <h3 className="font-semibold text-lg text-slate-800">{stop.name}</h3>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {stop.arrivalTime}</span>
                                                    <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {stop.latitude}, {stop.longitude}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <DeleteStopButton stopId={stop.id} />
                                                <Badge variant="outline" className="text-xs">
                                                    Seq: {stop.order}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Assigned Students Summary for Stop */}
                                        {(stop.pickupStudents.length > 0 || stop.dropStudents.length > 0) && (
                                            <div className="mt-2 ml-2 flex gap-2">
                                                {stop.pickupStudents.length > 0 && <Badge variant="secondary" className="bg-blue-50 text-blue-700">Pickup: {stop.pickupStudents.length}</Badge>}
                                                {stop.dropStudents.length > 0 && <Badge variant="secondary" className="bg-purple-50 text-purple-700">Drop: {stop.dropStudents.length}</Badge>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {route.stops.length === 0 && (
                                    <div className="text-center py-12 text-muted-foreground italic">
                                        No stops added yet. Start by adding a stop.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Students Section */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-600 to-blue-600 p-6 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Users className="h-6 w-6" />
                                <h2 className="text-xl font-semibold">Assigned Students</h2>
                            </div>
                            <AssignStudentDialog routeId={route.id} stops={route.stops} />
                        </div>
                        <CardContent className="p-6">
                            <AssignedStudentsList
                                students={route.students || []}
                                stops={route.stops || []}
                                routeId={route.id}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Info Cards */}
                <div className="space-y-6">
                    {/* Vehicle Card */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg p-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Bus className="h-5 w-5" />
                                Vehicle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {route.vehicle ? (
                                <div className="text-center">
                                    <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                                        <Bus className="h-10 w-10 text-emerald-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800">{route.vehicle.number}</h3>
                                    <p className="text-slate-500 mb-4">{route.vehicle.model}</p>
                                    <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-lg">
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Capacity</span>
                                            <span className="font-medium">{route.vehicle.capacity} Seats</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate-400">Status</span>
                                            <span className="font-medium text-green-600">Active</span>
                                        </div>
                                    </div>
                                    <Button variant="outline" className="w-full mt-4" asChild>
                                        <Link href={`/admin/transport/vehicles/${route.vehicle.id}`}>View Details</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Bus className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-4">No vehicle assigned</p>
                                    <Button variant="outline" size="sm" className="w-full">Assign Vehicle</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Driver Card */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-t-lg p-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5" />
                                Driver
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            {route.driver ? (
                                <div className="text-center">
                                    <div className="h-20 w-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm overflow-hidden">
                                        {route.driver.user.image ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={route.driver.user.image}
                                                alt={route.driver.user.name || "Driver"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-10 w-10 text-purple-600" />
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{route.driver.user.name}</h3>
                                    <p className="text-slate-500 mb-4">{route.driver.phone || "No Phone"}</p>

                                    <div className="space-y-2 text-sm text-left bg-slate-50 p-4 rounded-lg">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">License:</span>
                                            <span className="font-medium">{route.driver.licenseNo || "N/A"}</span>
                                        </div>
                                        <div className="h-px bg-slate-200 my-2" />
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Exp:</span>
                                            <span className="font-medium">5 Years</span>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full mt-4" asChild>
                                        <Link href={`/admin/transport/drivers/${route.driver.id}`}>View Profile</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <User className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                    <p className="text-muted-foreground mb-4">No driver assigned</p>
                                    <Button variant="outline" size="sm" className="w-full">Assign Driver</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
