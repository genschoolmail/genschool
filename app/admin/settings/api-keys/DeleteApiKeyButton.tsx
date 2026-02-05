"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteApiKey } from "@/lib/api-keys-actions";
import { toast } from "sonner";

export default function DeleteApiKeyButton({ id, name }: { id: string; name: string }) {
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

        setLoading(true);
        const res = await deleteApiKey(id);
        setLoading(false);

        if (res.success) {
            toast.success("API key deleted successfully");
        } else {
            toast.error(res.error || "Failed to delete API key");
        }
    }

    return (
        <Button variant="outline" size="sm" onClick={handleDelete} disabled={loading}>
            <Trash2 className="h-4 w-4 text-red-600" />
        </Button>
    );
}
