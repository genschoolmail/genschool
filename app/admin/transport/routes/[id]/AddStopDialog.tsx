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
import { Plus, MapPin, Clock, Hash, Navigation } from "lucide-react";
import { addStopToRoute } from "@/lib/admin-transport-actions";
import { toast } from "sonner";

export default function AddStopDialog({ routeId }: { routeId: string }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const name = formData.get("name") as string;
        const lat = parseFloat(formData.get("lat") as string);
        const lng = parseFloat(formData.get("lng") as string);
        const order = parseInt(formData.get("order") as string);
        const time = formData.get("time") as string;

        const res = await addStopToRoute(routeId, {
            name,
            lat,
            lng,
            order,
            time
        });

        setLoading(false);

        if (res.success) {
            toast.success("Stop added successfully");
            setOpen(false);
        } else {
            toast.error(res.error || "Failed to add stop");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Stop
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-slate-900 dark:text-white">Add New Stop</DialogTitle>
                            <DialogDescription className="mt-1 text-slate-600 dark:text-slate-400">
                                Add a pickup/drop-off point to this route
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form action={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5 text-blue-600" />
                                Stop Name <span className="text-red-600">*</span>
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Main Gate, Central Plaza"
                                className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="lat" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                                    Latitude <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="lat"
                                    name="lat"
                                    type="number"
                                    step="any"
                                    placeholder="12.9716"
                                    className="h-11 font-mono text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lng" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Navigation className="h-3.5 w-3.5 text-emerald-600" />
                                    Longitude <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="lng"
                                    name="lng"
                                    type="number"
                                    step="any"
                                    placeholder="77.5946"
                                    className="h-11 font-mono text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="order" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Hash className="h-3.5 w-3.5 text-purple-600" />
                                    Stop Order <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="order"
                                    name="order"
                                    type="number"
                                    placeholder="1"
                                    className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
                                <p className="text-xs text-slate-500">Sequence in the route</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="time" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-orange-600" />
                                    Arrival Time <span className="text-red-600">*</span>
                                </Label>
                                <Input
                                    id="time"
                                    name="time"
                                    type="time"
                                    className="h-11 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-300"
                                    required
                                />
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
                            {loading ? "Adding Stop..." : "Add Stop"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
