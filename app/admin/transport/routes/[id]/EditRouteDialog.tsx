"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Pencil, MapPin, Bus, User } from "lucide-react";
import { createRoute, updateRoute } from "@/lib/admin-transport-actions";
// TODO: I need to add updateRoute action. For now using placeholder logic or I should go back and add updateRoute.
import { toast } from "sonner";

// I noticed I missed adding `updateRoute` in the server actions. 
// I should probably go add that quickly.
// But first let me layout the component. 

export default function EditRouteDialog({ route, vehicles, drivers }: { route: any, vehicles: any[], drivers: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        try {
            const result = await updateRoute(route.id, {
                routeNo: formData.get("routeNo") as string,
                name: formData.get("name") as string,
                startPoint: formData.get("startPoint") as string,
                endPoint: formData.get("endPoint") as string,
                vehicleId: formData.get("vehicleId") === "none" ? undefined : formData.get("vehicleId") as string,
                driverId: formData.get("driverId") === "none" ? undefined : formData.get("driverId") as string,
            });

            if (result.success) {
                toast.success("Route updated successfully");
                setOpen(false);
            } else {
                toast.error(result.error || "Failed to update route");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-slate-900">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <Pencil className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Edit Route</DialogTitle>
                            <DialogDescription className="mt-1">
                                Modify route details and assignments
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form action={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Route Information
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="routeNo" className="text-sm font-medium">Route Number</Label>
                                <Input id="routeNo" name="routeNo" defaultValue={route.routeNo} className="h-11" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium">Route Name</Label>
                                <Input id="name" name="name" defaultValue={route.name} className="h-11" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startPoint" className="text-sm font-medium">Start Point</Label>
                                <Input id="startPoint" name="startPoint" defaultValue={route.startPoint} className="h-11" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endPoint" className="text-sm font-medium">End Point</Label>
                                <Input id="endPoint" name="endPoint" defaultValue={route.endPoint} className="h-11" required />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Assignments</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="vehicleId" className="text-sm font-medium flex items-center gap-1.5"><Bus className="h-3.5 w-3.5" /> Vehicle</Label>
                                <Select name="vehicleId" defaultValue={route.vehicleId || "none"}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="none">No Vehicle</SelectItem>
                                        {vehicles.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>{v.number}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="driverId" className="text-sm font-medium flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Driver</Label>
                                <Select name="driverId" defaultValue={route.driverId || "none"}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent className="bg-white">
                                        <SelectItem value="none">No Driver</SelectItem>
                                        {drivers.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>{d.user.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11">Cancel</Button>
                        <Button type="submit" disabled={loading} className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
