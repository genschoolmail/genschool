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
import { Plus, Bus, User, Hash, Award } from "lucide-react";
import { createVehicle } from "@/lib/admin-transport-actions";
import { toast } from "sonner";

export default function AddVehicleDialog({ drivers }: { drivers: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const number = formData.get("number") as string;
        const model = formData.get("model") as string;
        const capacity = parseInt(formData.get("capacity") as string);
        const driverId = formData.get("driverId") as string;

        const res = await createVehicle({
            number,
            model,
            capacity,
            driverId: driverId === "none" ? undefined : driverId
        });

        setLoading(false);

        if (res.success) {
            toast.success("Vehicle added successfully");
            setOpen(false);
        } else {
            toast.error(res.error || "Failed to add vehicle");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Vehicle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 flex items-center justify-center">
                            <Bus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-slate-900 dark:text-white">Add New Vehicle</DialogTitle>
                            <DialogDescription className="mt-1 text-slate-600 dark:text-slate-400">
                                Add a vehicle to your school transport fleet
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form action={onSubmit} className="space-y-6">
                    {/* Vehicle Details */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <Bus className="h-4 w-4 text-emerald-600" />
                            Vehicle Details
                        </h3>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="number" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Hash className="h-3.5 w-3.5 text-blue-600" />
                                    Vehicle Number <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="number"
                                    name="number"
                                    placeholder="MH-01-AB-1234"
                                    className="h-11 font-mono text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
                                <p className="text-xs text-slate-500">Registration number of the vehicle</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="model" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <Award className="h-3.5 w-3.5 text-amber-600" />
                                        Model <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="model"
                                        name="model"
                                        placeholder="Tata Starbus"
                                        className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="capacity" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Capacity <span className="text-red-600">*</span>
                                    </Label>
                                    <Input
                                        id="capacity"
                                        name="capacity"
                                        type="number"
                                        placeholder="40"
                                        min="1"
                                        max="100"
                                        className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Driver Assignment */}
                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-600" />
                            Driver Assignment
                            <span className="text-xs font-normal text-slate-500 ml-2">
                                ({drivers?.length || 0} drivers available)
                            </span>
                        </h3>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Assign Driver (Optional)
                            </Label>
                            <Select name="driverId" defaultValue="none">
                                <SelectTrigger className="h-11 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-300">
                                    <SelectValue placeholder="Select a driver" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-800 border-slate-200">
                                    <SelectItem value="none">No Driver</SelectItem>
                                    {drivers && drivers.map((driver) => (
                                        <SelectItem key={driver.id} value={driver.id}>
                                            {driver.user?.name || 'Unknown Driver'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">You can assign a driver later</p>
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
                            className="h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold shadow-lg"
                        >
                            {loading ? "Adding..." : "Add Vehicle"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
