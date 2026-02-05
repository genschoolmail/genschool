import { getVehicleById, getDrivers } from "@/lib/admin-transport-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bus, User, Palette, ArrowLeft, Settings2 } from "lucide-react";
import Link from "next/link";
import EditVehicleDialog from "./EditVehicleDialog";
import DeleteVehicleButton from "./DeleteVehicleButton";
import { notFound } from "next/navigation";

export default async function VehicleDetailsPage({ params }: { params: { id: string } }) {
    const vehicle = await getVehicleById(params.id);
    const drivers = await getDrivers();

    if (!vehicle) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="h-10 w-10 rounded-full">
                        <Link href="/admin/transport/vehicles">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{vehicle.number}</h1>
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                        </div>
                        <p className="text-muted-foreground text-lg">{vehicle.model}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <EditVehicleDialog vehicle={vehicle} drivers={drivers} />
                    <DeleteVehicleButton vehicleId={vehicle.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Vehicle Stats Card */}
                <Card className="lg:col-span-2 shadow-md border-none overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white flex gap-4 items-center">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <Bus className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Vehicle Information</h2>
                            <p className="opacity-90">Detailed specification and status</p>
                        </div>
                    </div>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Settings2 className="h-4 w-4" /> Capacity</label>
                                <p className="text-2xl font-semibold text-slate-800">{vehicle.capacity} Seats</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Palette className="h-4 w-4" /> Model/Make</label>
                                <p className="text-2xl font-semibold text-slate-800">{vehicle.model}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assigned Driver Card */}
                <Card className="shadow-md border-none">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-slate-500" />
                            Assigned Driver
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {vehicle.driver ? (
                            <div className="text-center space-y-4">
                                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm overflow-hidden">
                                    {vehicle.driver.user.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={vehicle.driver.user.image} alt={vehicle.driver.user.name || "Driver"} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-10 w-10 text-emerald-600" />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">{vehicle.driver.user.name}</h3>
                                    <p className="text-slate-500">{vehicle.driver.phone}</p>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/admin/transport/drivers/${vehicle.driver.id}`}>View Profile</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <User className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-muted-foreground">No driver assigned</p>
                                <Button variant="link" className="text-emerald-600">Assign Driver in Edit</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Assigned Routes Card - if any */}
                {(vehicle.routes && vehicle.routes.length > 0) && (
                    <Card className="lg:col-span-3 shadow-md border-none">
                        <CardHeader>
                            <CardTitle>Assigned Routes ({vehicle.routes.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {vehicle.routes.map((route) => (
                                    <Link key={route.id} href={`/admin/transport/routes/${route.id}`}>
                                        <div className="border rounded-lg p-4 hover:border-emerald-500 hover:bg-emerald-50 transition-all cursor-pointer">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg">{route.routeNo}</h3>
                                                <Badge variant="outline">Active</Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{route.name || route.routeNo}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
