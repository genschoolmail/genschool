import Link from "next/link";
import { getDrivers, getVehicles, getRoutes } from "@/lib/admin-transport-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Bus, Map } from "lucide-react";
import AddDriverDialog from "./AddDriverDialog";

export default async function DriversPage() {
    const drivers = await getDrivers();
    const vehicles = await getVehicles();
    const routes = await getRoutes();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Drivers</h1>
                    <p className="text-muted-foreground">Manage transport staff</p>
                </div>
                <AddDriverDialog vehicles={vehicles} routes={routes} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {drivers.map((driver) => (
                    <Link key={driver.id} href={`/admin/transport/drivers/${driver.id}`}>
                        <Card className="hover:border-purple-500 hover:shadow-md transition-all cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xl font-bold">{driver.user.name}</CardTitle>
                                <User className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground mb-4">{driver.user.email}</div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-gray-600">
                                            <Bus className="h-3 w-3" /> Vehicle
                                        </span>
                                        <span className="font-medium">{driver.vehicle?.number || "None"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-2 text-gray-600">
                                            <Map className="h-3 w-3" /> Route
                                        </span>
                                        <span className="font-medium">{driver.route?.routeNo || "None"}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                                        <span className="text-gray-600">License</span>
                                        <span className="font-mono">{driver.licenseNo || "N/A"}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {drivers.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                        <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No drivers found</h3>
                        <p className="text-gray-500 mb-4">Add your first driver to get started</p>
                        <AddDriverDialog vehicles={vehicles} routes={routes} />
                    </div>
                )}
            </div>
        </div>
    );
}
