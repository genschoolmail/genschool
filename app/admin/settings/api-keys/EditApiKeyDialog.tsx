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
import { Edit } from "lucide-react";
import { updateApiKey } from "@/lib/api-keys-actions";
import { toast } from "sonner";

export default function EditApiKeyDialog({ apiKey }: { apiKey: any }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const name = formData.get("name") as string;
        const key = formData.get("key") as string;
        const description = formData.get("description") as string;

        const res = await updateApiKey(apiKey.id, {
            name,
            ...(key ? { key } : {}),
            description
        });

        setLoading(false);

        if (res.success) {
            toast.success("API key updated successfully");
            setOpen(false);
        } else {
            toast.error(res.error || "Failed to update API key");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit API Key</DialogTitle>
                    <DialogDescription>
                        Update API key details
                    </DialogDescription>
                </DialogHeader>
                <form action={onSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" name="name" defaultValue={apiKey.name} required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="key">API Key (Leave blank to keep current)</Label>
                            <Input id="key" name="key" type="password" placeholder="••••••••" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input id="description" name="description" defaultValue={apiKey.description || ""} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
