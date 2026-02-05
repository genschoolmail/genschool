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
import { Pencil, Bus, User } from "lucide-react";
// We need updateVehicle action
import { updateVehicle } from "@/lib/admin-transport-actions";
import { toast } from "sonner";

export default function EditVehicleDialog({ vehicle, drivers }: { vehicle: any, drivers: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const number = formData.get("number") as string;
        const model = formData.get("model") as string;
        const capacity = parseInt(formData.get("capacity") as string);
        const driverId = formData.get("driverId") as string;

        const res = await updateVehicle(vehicle.id, {
            number,
            model,
            capacity,
            driverId: driverId === "none" ? undefined : driverId
        });

        setLoading(false);

        if (res.success) {
            toast.success("Vehicle updated successfully");
            setOpen(false);
        } else {
            toast.error(res.error || "Failed to update vehicle");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-slate-900">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                            <Pencil className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Edit Vehicle</DialogTitle>
                            <DialogDescription className="mt-1">
                                Update vehicle information
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form action={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="number" className="text-sm font-medium flex items-center gap-1.5"><Bus className="h-3.5 w-3.5" /> Vehicle Number</Label>
                            <Input id="number" name="number" defaultValue={vehicle.number} className="h-11" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="model" className="text-sm font-medium">Model</Label>
                            <Input id="model" name="model" defaultValue={vehicle.model} className="h-11" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="capacity" className="text-sm font-medium">Capacity</Label>
                                <Input id="capacity" name="capacity" type="number" defaultValue={vehicle.capacity} className="h-11" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="driverId" className="text-sm font-medium flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Driver</Label>
                                <Select name="driverId" defaultValue={vehicle.driverId || "none"}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
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
                        <Button type="submit" disabled={loading} className="h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
