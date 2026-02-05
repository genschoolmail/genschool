"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Plus, Key, Shield, Sparkles, Info, CheckCircle } from "lucide-react";
import { createApiKey } from "@/lib/api-keys-actions";
import { toast } from "sonner";

const providerOptions = [
    { value: "GOOGLE_MAPS", label: "Google Maps", icon: "🗺️", desc: "Maps & Location Services" },
    { value: "PAYMENT_GATEWAY", label: "Payment Gateway", icon: "💳", desc: "Payment Processing" },
    { value: "SMS", label: "SMS Service", icon: "📱", desc: "SMS Notifications" },
    { value: "EMAIL", label: "Email Service", icon: "✉️", desc: "Email Communications" },
    { value: "STORAGE", label: "Cloud Storage", icon: "☁️", desc: "File Storage" },
    { value: "OTHER", label: "Other", icon: "⚙️", desc: "Custom Integration" },
];

export default function AddApiKeyDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState("");

    async function onSubmit(formData: FormData) {
        setLoading(true);
        const name = formData.get("name") as string;
        const key = formData.get("key") as string;
        const description = formData.get("description") as string;
        const provider = formData.get("provider") as string;

        if (!provider) {
            toast.error("Please select a provider");
            setLoading(false);
            return;
        }

        const res = await createApiKey({
            name,
            key,
            description,
            provider
        });

        setLoading(false);

        if (res.success) {
            toast.success(res.message || "API key added successfully");
            setOpen(false);
            setSelectedProvider("");
        } else {
            toast.error(res.error || "Failed to add API key");
        }
    }

    const currentProvider = providerOptions.find(p => p.value === selectedProvider);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    Add API Key
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[580px] max-h-[90vh] gap-0 p-0 border-none shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-6 py-5 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-500/10 to-purple-500/10 rounded-full blur-2xl"></div>

                    <DialogHeader className="relative z-10 space-y-0">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-white/10 rounded-lg border border-white/20 flex-shrink-0">
                                <Key className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-lg font-bold text-white leading-tight">
                                    Add API Key
                                </DialogTitle>
                                <DialogDescription className="text-slate-300 text-xs mt-1 leading-tight">
                                    Securely integrate third-party services
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                {/* Scrollable Form */}
                <div className="bg-white dark:bg-slate-900 overflow-y-auto max-h-[calc(90vh-130px)]">
                    <div className="px-6 py-4">
                        <form action={onSubmit} className="space-y-4">
                            {/* Provider */}
                            <div className="space-y-2">
                                <Label htmlFor="provider" className="text-sm font-semibold flex items-center gap-1.5">
                                    <Sparkles className="h-3.5 w-3.5 text-purple-600" />
                                    Provider Type <span className="text-red-500">*</span>
                                </Label>
                                <Select name="provider" onValueChange={setSelectedProvider}>
                                    <SelectTrigger className="h-10 border-2">
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {providerOptions.map((opt) => (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div className="flex items-center gap-2">
                                                    <span>{opt.icon}</span>
                                                    <div>
                                                        <div className="text-sm font-medium">{opt.label}</div>
                                                        <div className="text-xs text-slate-500">{opt.desc}</div>
                                                    </div>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {currentProvider && (
                                    <div className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1.5 rounded border border-green-200 dark:border-green-800">
                                        <CheckCircle className="h-3 w-3" />
                                        <span>{currentProvider.icon} {currentProvider.label} selected</span>
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold">
                                    Name / Identifier <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g., Production Google Maps API"
                                    required
                                    className="h-10 border-2"
                                />
                            </div>

                            {/* API Key */}
                            <div className="space-y-2">
                                <Label htmlFor="key" className="text-sm font-semibold flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5 text-green-600" />
                                    API Key <span className="text-red-500">*</span>
                                    <span className="ml-auto text-xs font-normal text-slate-500 flex items-center gap-1">
                                        <Shield className="h-3 w-3" />
                                        AES-256
                                    </span>
                                </Label>
                                <Input
                                    id="key"
                                    name="key"
                                    type="password"
                                    placeholder="Paste your API key here"
                                    required
                                    className="h-10 border-2 font-mono text-sm"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold">
                                    Description <span className="text-slate-400 font-normal text-xs">(Optional)</span>
                                </Label>
                                <Input
                                    id="description"
                                    name="description"
                                    placeholder="e.g., Used for live tracking"
                                    className="h-10 border-2"
                                />
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                <div className="flex items-start gap-2">
                                    <div className="p-1 bg-blue-500/10 rounded">
                                        <Info className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                                            Auto-Validation Enabled
                                        </h4>
                                        <p className="text-xs text-blue-800 dark:text-blue-300">
                                            Your key will be automatically tested after creation
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-3 border-t sticky bottom-0 bg-white dark:bg-slate-900 pb-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={loading}
                                    className="h-9 px-4"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-9 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent mr-2"></div>
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Add API Key
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
