import { getDriverById } from "@/lib/admin-transport-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Bus, MapPin, Phone, CreditCard, ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import EditDriverDialog from "./EditDriverDialog";
import DeleteDriverButton from "./DeleteDriverButton";
import { notFound } from "next/navigation";

export default async function DriverDetailsPage({ params }: { params: { id: string } }) {
    const driver = await getDriverById(params.id);

    if (!driver) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild className="h-10 w-10 rounded-full">
                        <Link href="/admin/transport/drivers">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center overflow-hidden border-2 border-purple-200">
                            {driver.user.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={driver.user.image} alt={driver.user.name || "Driver"} className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-6 w-6 text-purple-600" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{driver.user.name}</h1>
                                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">active</Badge>
                            </div>
                            <p className="text-muted-foreground">{driver.phone || "No Phone"}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <EditDriverDialog driver={driver} />
                    <DeleteDriverButton driverId={driver.id} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Personal Info Card */}
                <Card className="lg:col-span-2 shadow-md border-none overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white flex gap-4 items-center">
                        <div className="h-16 w-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                            <User className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Driver Profile</h2>
                            <p className="opacity-90">Personal and employment details</p>
                        </div>
                    </div>
                    <CardContent className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><CreditCard className="h-4 w-4" /> License Number</label>
                                <p className="text-lg font-semibold text-slate-800">{driver.licenseNo || "N/A"}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Contact</label>
                                <p className="text-lg font-semibold text-slate-800">{driver.phone || "N/A"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assigned Vehicle Card */}
                <Card className="shadow-md border-none">
                    <CardHeader className="bg-slate-50 border-b">
                        <CardTitle className="flex items-center gap-2">
                            <Bus className="h-5 w-5 text-slate-500" />
                            Assigned Vehicle
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {driver.vehicle ? (
                            <div className="text-center space-y-4">
                                <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-white shadow-sm">
                                    <Bus className="h-10 w-10 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800">{driver.vehicle.number}</h3>
                                    <p className="text-slate-500">{driver.vehicle.model}</p>
                                </div>
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/admin/transport/vehicles/${driver.vehicle.id}`}>View Vehicle</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Bus className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                                <p className="text-muted-foreground">No vehicle assigned</p>
                                <Button variant="link" className="text-purple-600">Assign in Vehicle Settings</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
