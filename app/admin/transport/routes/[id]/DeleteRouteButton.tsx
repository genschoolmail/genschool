"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteRoute } from "@/lib/admin-transport-actions"; // Ensure this is exported from actions
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function DeleteRouteButton({ routeId }: { routeId: string }) {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        setLoading(true);
        const res = await deleteRoute(routeId);
        setLoading(false);

        if (res.success) {
            toast.success("Route deleted successfully");
            router.push("/admin/transport/routes");
        } else {
            toast.error(res.error || "Failed to delete route");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete the route and remove all stop assignments.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                        {loading ? "Deleting..." : "Delete Route"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
