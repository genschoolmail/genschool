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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Search, User, MapPin, Loader2 } from "lucide-react";
import { searchStudentsForTransport, assignStudentToRoute } from "@/lib/admin-transport-actions";
import { toast } from "sonner";


export default function AssignStudentDialog({ routeId, stops }: { routeId: string, stops: any[] }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string>("");
    const [selectedStop, setSelectedStop] = useState<string>("");
    const [searching, setSearching] = useState(false);

    async function handleSearch(query: string) {
        setSearchQuery(query);
        if (query.length < 2) {
            setStudents([]);
            return;
        }

        setSearching(true);
        const res = await searchStudentsForTransport(query);
        setStudents(res);
        setSearching(false);
    }

    async function handleAssign() {
        if (!selectedStudent) return;

        setLoading(true);
        const res = await assignStudentToRoute(routeId, selectedStudent, selectedStop || undefined);
        setLoading(false);

        if (res.success) {
            toast.success("Student assigned successfully");
            setOpen(false);
            setSearchQuery("");
            setStudents([]);
            setSelectedStudent("");
            setSelectedStop("");
        } else {
            toast.error(res.error || "Failed to assign student");
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-dashed border-2 hover:border-solid hover:border-blue-500 hover:text-blue-600">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign Student
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center">
                            <UserPlus className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl text-slate-900 dark:text-white">Assign Student</DialogTitle>
                            <DialogDescription className="mt-1 text-slate-600 dark:text-slate-400">
                                Search and assign a student to this route
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Search Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Search Student</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by name or admission no..."
                                className="pl-9 h-11 text-slate-900 dark:text-white placeholder:text-slate-500 bg-white dark:bg-slate-800 border-slate-300"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>

                        {searching && (
                            <div className="text-sm text-center text-slate-500 py-2 flex items-center justify-center gap-2">
                                <Loader2 className="h-3 w-3 animate-spin" /> Searching...
                            </div>
                        )}

                        {!searching && students.length > 0 && (
                            <div className="border border-slate-200 dark:border-slate-700 rounded-md max-h-[200px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                                {students.map((student) => (
                                    <div
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student.id)}
                                        className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedStudent === student.id ? 'bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500' : ''}`}
                                    >

                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
                                            {student.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 dark:text-white">{student.user.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">Adm: {student.admissionNo} • Class: {student.classId || "N/A"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!searching && searchQuery.length > 2 && students.length === 0 && (
                            <div className="text-center text-sm text-slate-500 py-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-md">
                                No students found or already assigned.
                            </div>
                        )}
                    </div>

                    {/* Stop Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" /> Pick-up/Drop-off Stop (Optional)
                        </Label>
                        <Select value={selectedStop} onValueChange={setSelectedStop}>
                            <SelectTrigger className="h-11 text-slate-900 dark:text-white bg-white dark:bg-slate-800 border-slate-300">
                                <SelectValue placeholder="Select a stop" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200">
                                {stops && stops.length > 0 ? (
                                    stops.map((stop) => (
                                        <SelectItem key={stop.id} value={stop.id}>
                                            {stop.name} ({stop.arrivalTime})
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-sm text-slate-500">
                                        No stops available - add stops first
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="h-11 text-slate-700 dark:text-slate-200 font-semibold border-2 hover:bg-slate-100"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        disabled={loading || !selectedStudent}
                        className="h-11 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold shadow-lg"
                    >
                        {loading ? "Assigning..." : "Assign Student"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
