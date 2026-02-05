"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Power } from "lucide-react";
import { toggleApiKeyStatus } from "@/lib/api-keys-actions";
import { toast } from "sonner";

export default function ToggleApiKeyButton({ id, isActive }: { id: string; isActive: boolean }) {
    const [loading, setLoading] = useState(false);

    async function handleToggle() {
        setLoading(true);
        const res = await toggleApiKeyStatus(id);
        setLoading(false);

        if (res.success) {
            toast.success(`API key ${isActive ? 'deactivated' : 'activated'}`);
        } else {
            toast.error(res.error || "Failed to toggle status");
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            title={isActive ? "Deactivate" : "Activate"}
        >
            <Power className={`h-4 w-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
        </Button>
    );
}
