import { getVehicles, getDrivers } from "@/lib/admin-transport-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Bus, User } from "lucide-react";
import Link from "next/link";
import AddVehicleDialog from "./AddVehicleDialog";

export default async function VehiclesPage() {
    const vehicles = await getVehicles();
    const drivers = await getDrivers();

    // Filter available drivers (those without a vehicle)
    const availableDrivers = drivers.filter(d => !d.vehicle);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Vehicles</h1>
                    <p className="text-muted-foreground">Manage school transport fleet</p>
                </div>
                <AddVehicleDialog drivers={availableDrivers} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.map((vehicle) => (
                    <Link key={vehicle.id} href={`/admin/transport/vehicles/${vehicle.id}`}>
                        <Card className="hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{vehicle.number}</CardTitle>
                                <Bus className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mb-4">{vehicle.model || "Unknown Model"}</div>

                                <div className="flex items-center gap-2 mb-2">
                                    <User className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">
                                        {vehicle.driver ? vehicle.driver.user.name : "No Driver Assigned"}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center text-sm mt-4 pt-4 border-t">
                                    <div>
                                        <span className="text-gray-500">Capacity:</span>
                                        <span className="ml-1 font-semibold">{vehicle.capacity}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Routes:</span>
                                        <span className="ml-1 font-semibold">{vehicle.routes.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {vehicles.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                        <Bus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No vehicles found</h3>
                        <p className="text-gray-500">Get started by adding a new vehicle to the fleet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
