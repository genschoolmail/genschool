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
import { Plus, MapPin, Bus, User } from "lucide-react";
import { createRoute } from "@/lib/admin-transport-actions";
import { toast } from "sonner";

export default function AddRouteDialog({ vehicles, drivers }: { vehicles: any[], drivers: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const routeNo = formData.get("routeNo") as string;
        const name = formData.get("name") as string;
        const startPoint = formData.get("startPoint") as string;
        const endPoint = formData.get("endPoint") as string;
        const vehicleId = formData.get("vehicleId") as string;
        const driverId = formData.get("driverId") as string;

        const res = await createRoute({
            routeNo,
            name,
            startPoint,
            endPoint,
            vehicleId: vehicleId === "none" ? undefined : vehicleId,
            driverId: driverId === "none" ? undefined : driverId
        });

        setLoading(false);

        if (res.success) {
            toast.success("Route created successfully");
            setOpen(false);
        } else {
            toast.error(res.error || "Failed to create route");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Route
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] bg-white dark:bg-slate-900">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-slate-900 dark:text-white">Create New Route</DialogTitle>
                            <DialogDescription className="mt-1 text-slate-600 dark:text-slate-400">
                                Define the route details and assign vehicles
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form action={onSubmit} className="space-y-6">
                    {/* Route Information */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            Route Information
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="routeNo" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Route Number <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="routeNo"
                                    name="routeNo"
                                    placeholder="R-01"
                                    className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Route Name <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="North City Route"
                                    className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startPoint" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    Start Point <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="startPoint"
                                    name="startPoint"
                                    placeholder="School Campus"
                                    className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endPoint" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    End Point <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="endPoint"
                                    name="endPoint"
                                    placeholder="Central Station"
                                    className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assignments */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                            Assignments (Optional)
                            <span className="text-xs font-normal text-slate-500 ml-2">
                                ({vehicles?.length || 0} vehicles, {drivers?.length || 0} drivers available)
                            </span>
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Bus className="h-3.5 w-3.5 text-emerald-600" />
                                    Assign Vehicle
                                </Label>
                                <Select name="vehicleId" defaultValue="none">
                                    <SelectTrigger className="h-11 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-300">
                                        <SelectValue placeholder="Select vehicle" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 shadow-lg">
                                        <SelectItem value="none">No Vehicle</SelectItem>
                                        {vehicles && vehicles.map((v) => (
                                            <SelectItem key={v.id} value={v.id}>
                                                {v.number} ({v.capacity} seats)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <User className="h-3.5 w-3.5 text-purple-600" />
                                    Assign Driver
                                </Label>
                                <Select name="driverId" defaultValue="none">
                                    <SelectTrigger className="h-11 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-300">
                                        <SelectValue placeholder="Select driver" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800 border border-slate-200 shadow-lg">
                                        <SelectItem value="none">No Driver</SelectItem>
                                        {drivers && drivers.map((d) => (
                                            <SelectItem key={d.id} value={d.id}>
                                                {d.user?.name || 'Unknown Driver'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="h-11 text-slate-700 dark:text-slate-200 font-semibold border-2 hover:bg-slate-100"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg"
                        >
                            {loading ? "Creating..." : "Create Route"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
