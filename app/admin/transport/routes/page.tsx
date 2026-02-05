import { getRoutes, getVehicles, getDrivers } from "@/lib/admin-transport-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Map, Navigation } from "lucide-react";
import Link from "next/link";
import AddRouteDialog from "./AddRouteDialog";

export default async function RoutesPage() {
    const routes = await getRoutes();
    const vehicles = await getVehicles();
    const drivers = await getDrivers();

    return (
        <div className="space-y-8">
            {/* Modern Page Header with Gradient */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
                <div className="relative flex justify-between items-center">
                    <div className="space-y-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
                            <Map className="w-8 h-8" />
                            Transport Routes
                        </h1>
                        <p className="text-blue-100 text-sm md:text-base max-w-2xl">
                            Manage transport routes, stops, and student assignments
                        </p>
                    </div>
                    <AddRouteDialog vehicles={vehicles} drivers={drivers} />
                </div>
            </div>

            {/* Modern Route Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {routes.map((route: any) => (
                    <Card key={route.id} className="relative overflow-hidden hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 dark:hover:border-blue-800 group bg-white/80 backdrop-blur-sm">
                        <div className={`absolute top-0 left-0 w-full h-1.5 ${route.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-300 to-gray-400'}`}></div>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                                        {route.routeNo?.substring(0, 2) || "R"}
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-slate-800 dark:text-white">{route.routeNo || "N/A"}</CardTitle>
                                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${route.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>
                                            {route.isActive ? '● Active' : '○ Inactive'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium mt-2">{route.name || "Unnamed Route"}</p>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 mb-4">
                                <div className="flex items-center text-sm p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                    <div className="w-2 h-2 rounded-full bg-blue-500 mr-3 ring-4 ring-blue-200 dark:ring-blue-900"></div>
                                    <span className="text-gray-500 dark:text-gray-400 w-14 font-medium">Start:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{route.startPoint || "N/A"}</span>
                                </div>
                                <div className="flex items-center text-sm p-2 rounded-lg bg-red-50 dark:bg-red-950/30">
                                    <div className="w-2 h-2 rounded-full bg-red-500 mr-3 ring-4 ring-red-200 dark:ring-red-900"></div>
                                    <span className="text-gray-500 dark:text-gray-400 w-14 font-medium">End:</span>
                                    <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{route.endPoint || "N/A"}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-sm pt-4 border-t-2 border-dashed">
                                <div className="flex flex-col items-center p-2 rounded-lg bg-purple-50 dark:bg-purple-950/30 min-w-[70px]">
                                    <span className="text-gray-500 dark:text-gray-400 text-xs mb-1">Stops</span>
                                    <span className="font-bold text-lg text-purple-600 dark:text-purple-400">{route.stops?.length || 0}</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 min-w-[70px]">
                                    <span className="text-gray-500 dark:text-gray-400 text-xs mb-1">Students</span>
                                    <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{route._count?.students || 0}</span>
                                </div>
                                <div className="flex flex-col items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 min-w-[70px]">
                                    <span className="text-gray-500 dark:text-gray-400 text-xs mb-1">Vehicle</span>
                                    <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 truncate max-w-[60px]">{route.vehicle?.number || "None"}</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Button asChild variant="outline" className="w-full h-11 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 hover:from-blue-100 hover:to-purple-100 dark:hover:from-blue-900/40 dark:hover:to-purple-900/40 group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-all font-semibold">
                                    <Link href={`/admin/transport/routes/${route.id}`}>
                                        <Navigation className="w-4 h-4 mr-2" />
                                        Manage Stops
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {routes.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-gradient-to-br from-gray-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Map className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No routes found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Create a new route to start assigning stops and students.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
