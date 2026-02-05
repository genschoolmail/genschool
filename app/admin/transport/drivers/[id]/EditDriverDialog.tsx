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
import { Pencil, User, Phone, MapPin, CreditCard } from "lucide-react";
import { updateDriver } from "@/lib/admin-transport-actions";
import { toast } from "sonner";

export default function EditDriverDialog({ driver }: { driver: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const licenseNo = formData.get("licenseNo") as string;
        const phone = formData.get("phone") as string;

        const res = await updateDriver(driver.id, {
            licenseNo,
            phone
        });

        setLoading(false);

        if (res.success) {
            toast.success("Driver updated successfully");
            setOpen(false);
        } else {
            toast.error(res.error || "Failed to update driver");
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
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
                            <Pencil className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Edit Driver</DialogTitle>
                            <DialogDescription className="mt-1">
                                Update driver's personal information
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <form action={onSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> Phone Number</Label>
                            <Input id="phone" name="phone" defaultValue={driver.phone || ""} className="h-11" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="licenseNo" className="text-sm font-medium flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> License Number</Label>
                            <Input id="licenseNo" name="licenseNo" defaultValue={driver.licenseNo || ""} className="h-11" required />
                        </div>

                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-11">Cancel</Button>
                        <Button type="submit" disabled={loading} className="h-11 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">Save Changes</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
