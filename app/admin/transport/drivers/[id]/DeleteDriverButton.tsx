"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteDriver } from "@/lib/admin-transport-actions"; // Need to ensure deleteDriver exists
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function DeleteDriverButton({ driverId }: { driverId: string }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setLoading(true);
        // Note: deleteDriver action needs to be verified/added if missing
        // It likely exists or I need to add it.
        const res = await deleteDriver(driverId);
        setLoading(false);

        if (res.success) {
            toast.success("Driver deleted successfully");
            router.push("/admin/transport/drivers");
        } else {
            toast.error(res.error || "Failed to delete driver");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Driver?</DialogTitle>
                    <DialogDescription>
                        This will permanently delete the driver profile. Ensure they are unassigned from vehicles/routes first.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
