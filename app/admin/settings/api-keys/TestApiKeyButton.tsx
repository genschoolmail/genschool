"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FlaskConical, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { testApiKey } from "@/lib/api-keys-actions";
import { toast } from "sonner";

export default function TestApiKeyButton({ id, status }: { id: string; status?: string }) {
    const [testing, setTesting] = useState(false);

    async function handleTest() {
        setTesting(true);
        const res = await testApiKey(id);
        setTesting(false);

        if (res.success) {
            if (res.valid) {
                toast.success(res.message || "API key is valid!");
            } else {
                toast.error(res.message || "API key validation failed");
            }
        } else {
            toast.error(res.error || "Failed to test API key");
        }
    }

    const getStatusIcon = () => {
        if (testing) return <Loader2 className="h-4 w-4 animate-spin" />;

        switch (status) {
            case 'ACTIVE':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'FAILED':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <FlaskConical className="h-4 w-4" />;
        }
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            disabled={testing}
            title="Test API Key"
        >
            {getStatusIcon()}
        </Button>
    );
}
