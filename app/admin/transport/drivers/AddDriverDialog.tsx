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
import { Plus, User, Phone, Mail, CreditCard, Calendar, MapPin, DollarSign, Copy, Check, AlertCircle } from "lucide-react";
import { createDriver } from "@/lib/admin-transport-actions";
import { toast } from "sonner";

export default function AddDriverDialog({ vehicles, routes }: { vehicles: any[]; routes: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState<{ phone: string; password: string } | null>(null);
    const [copied, setCopied] = useState(false);

    async function onSubmit(formData: FormData) {
        setLoading(true);

        const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            phone: formData.get("phone") as string,
            licenseNo: formData.get("licenseNo") as string,
            dob: formData.get("dob") as string || undefined,
            address: formData.get("address") as string || undefined,
            salary: formData.get("salary") ? parseFloat(formData.get("salary") as string) : undefined,
            employmentType: formData.get("employmentType") as string || "FULL_TIME",
            vehicleId: formData.get("vehicleId") as string || undefined,
            routeId: formData.get("routeId") as string || undefined,
        };

        const res = await createDriver(data);
        setLoading(false);

        if (res.success) {
            toast.success("Driver added successfully!");
            setCredentials(res.credentials!);
        } else {
            toast.error(res.error || "Failed to add driver");
        }
    }

    function handleClose() {
        setOpen(false);
        setCredentials(null);
        setCopied(false);
    }

    function copyCredentials() {
        if (credentials) {
            const text = `Phone: ${credentials.phone}\nPassword: ${credentials.password}`;
            navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Credentials copied!");
            setTimeout(() => setCopied(false), 2000);
        }
    }

    const availableVehicles = vehicles.filter(v => !v.driverId);
    const availableRoutes = routes.filter(r => !r.driverId);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Driver
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-slate-900 dark:text-white">
                                {credentials ? "Driver Created Successfully!" : "Add New Driver"}
                            </DialogTitle>
                            <DialogDescription className="mt-1 text-slate-600 dark:text-slate-400">
                                {credentials
                                    ? "Save these login credentials securely"
                                    : "Create driver account and assign to vehicle/route"}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {credentials ? (
                    <div className="space-y-4 py-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-5">
                            <div className="flex items-start gap-3 mb-4">
                                <AlertCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-green-900 dark:text-green-100">
                                        Login Credentials Generated
                                    </h3>
                                    <p className="text-sm text-green-700 dark:text-green-200 mt-1">
                                        Share these credentials with the driver via SMS or WhatsApp
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Phone className="h-4 w-4 text-slate-500" />
                                        <p className="text-xs font-medium text-slate-500 uppercase">Phone Number</p>
                                    </div>
                                    <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                                        {credentials.phone}
                                    </p>
                                </div>

                                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CreditCard className="h-4 w-4 text-slate-500" />
                                        <p className="text-xs font-medium text-slate-500 uppercase">Password</p>
                                    </div>
                                    <p className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                                        {credentials.password}
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={copyCredentials}
                                className="w-full mt-4 h-11"
                                variant="outline"
                            >
                                {copied ? <Check className="mr-2 h-4 w-4 text-green-600" /> : <Copy className="mr-2 h-4 w-4" />}
                                {copied ? "Copied!" : "Copy Credentials"}
                            </Button>
                        </div>

                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                        Important: Save These Credentials
                                    </p>
                                    <p className="text-xs text-amber-700 dark:text-amber-200 mt-1">
                                        These credentials won't be shown again. Make sure to send them to the driver.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Button onClick={handleClose} className="w-full h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                            Done
                        </Button>
                    </div>
                ) : (
                    <form action={onSubmit} className="space-y-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <User className="h-4 w-4 text-purple-600" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Full Name <span className="text-red-600">*</span>
                                    </Label>
                                    <Input id="name" name="name" placeholder="John Doe" className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-blue-600" />
                                        Phone <span className="text-red-600">*</span>
                                    </Label>
                                    <Input id="phone" name="phone" type="tel" placeholder="9876543210" className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300" required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <Mail className="h-3.5 w-3.5 text-green-600" />
                                    Email Address <span className="text-red-600">*</span>
                                </Label>
                                <Input id="email" name="email" type="email" placeholder="driver@example.com" className="h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300" required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="licenseNo" className="text-sm font-medium flex items-center gap-1.5">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        License Number <span className="text-red-500">*</span>
                                    </Label>
                                    <Input id="licenseNo" name="licenseNo" placeholder="DL-1234567890" className="h-11 font-mono" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="dob" className="text-sm font-medium flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Date of Birth
                                    </Label>
                                    <Input id="dob" name="dob" type="date" className="h-11" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-1.5">
                                    <MapPin className="h-3.5 w-3.5" />
                                    Address
                                </Label>
                                <Input id="address" name="address" placeholder="Full residential address" className="h-11" />
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="space-y-4 pt-4 border-t">
                            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Employment Details
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="salary" className="text-sm font-medium">
                                        Monthly Salary (₹)
                                    </Label>
                                    <Input id="salary" name="salary" type="number" placeholder="25000" className="h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="employmentType" className="text-sm font-medium">
                                        Employment Type
                                    </Label>
                                    <Select name="employmentType" defaultValue="FULL_TIME">
                                        <SelectTrigger className="h-11">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                                            <SelectItem value="CONTRACT">Contract</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Assignments */}
                        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                Assignments (Optional)
                                <span className="text-xs font-normal text-slate-500 ml-2">
                                    ({vehicles?.length || 0} vehicles, {routes?.length || 0} routes available)
                                </span>
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Assign Vehicle
                                    </Label>
                                    <Select name="vehicleId" defaultValue="">
                                        <SelectTrigger className="h-11 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-300">
                                            <SelectValue placeholder="Select vehicle" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200">
                                            <SelectItem value="">No Vehicle</SelectItem>
                                            {availableVehicles && availableVehicles.map((v: any) => (
                                                <SelectItem key={v.id} value={v.id}>
                                                    {v.number} - {v.model}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        Assign Route
                                    </Label>
                                    <Select name="routeId" defaultValue="">
                                        <SelectTrigger className="h-11 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-300">
                                            <SelectValue placeholder="Select route" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 border-slate-200">
                                            <SelectItem value="">No Route</SelectItem>
                                            {availableRoutes && availableRoutes.map((r: any) => (
                                                <SelectItem key={r.id} value={r.id}>
                                                    {r.routeNo} - {r.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                                className="h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg"
                            >
                                {loading ? "Creating..." : "Create Driver"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
