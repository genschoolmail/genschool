"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, User, GraduationCap, CreditCard, X, Check, RefreshCw } from "lucide-react";
import { removeStudentFromRoute, updateStudentStopAssignment } from "@/lib/driver-transport-actions";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Student {
    id: string;
    admissionNo: string;
    user?: { name: string | null };
    class?: { name: string } | null;
    transportMapping?: {
        pickupStop?: { id: string; name: string } | null;
        dropStop?: { id: string; name: string } | null;
    } | null;
}

interface Stop {
    id: string;
    name: string;
}

interface Props {
    students: Student[];
    stops: Stop[];
    routeId: string;
}

export default function AssignedStudentsList({ students, stops, routeId }: Props) {
    const [editStudent, setEditStudent] = useState<Student | null>(null);
    const [deleteStudent, setDeleteStudent] = useState<Student | null>(null);
    const [pickupStopId, setPickupStopId] = useState<string>("");
    const [dropStopId, setDropStopId] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const handleEdit = (student: Student) => {
        setEditStudent(student);
        setPickupStopId(student.transportMapping?.pickupStop?.id || 'none');
        setDropStopId(student.transportMapping?.dropStop?.id || 'none');
    };

    const handleSaveEdit = async () => {
        if (!editStudent) return;
        setLoading(true);

        // Convert 'none' to null for API
        const pickup = pickupStopId === 'none' ? null : (pickupStopId || null);
        const drop = dropStopId === 'none' ? null : (dropStopId || null);

        const result = await updateStudentStopAssignment(
            editStudent.id,
            pickup,
            drop
        );

        setLoading(false);
        if (result.success) {
            toast.success("स्टॉप अपडेट हो गया!");
            setEditStudent(null);
            window.location.reload();
        } else {
            toast.error(result.error || "अपडेट फेल हुआ");
        }
    };

    const handleDelete = async () => {
        if (!deleteStudent) return;
        setLoading(true);

        const result = await removeStudentFromRoute(deleteStudent.id);

        setLoading(false);
        if (result.success) {
            toast.success("छात्र को रूट से हटा दिया!");
            setDeleteStudent(null);
            window.location.reload();
        } else {
            toast.error(result.error || "हटाना फेल हुआ");
        }
    };

    if (!students || students.length === 0) {
        return (
            <div className="text-center py-10 text-slate-500">
                <User className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>कोई छात्र असाइन नहीं है</p>
                <p className="text-sm text-slate-400 mt-1">छात्र जोड़ने के लिए ऊपर बटन दबाएं</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-3">
                {students.map((student) => (
                    <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center text-blue-600 font-bold border-2 border-white shadow-sm">
                                {student.user?.name?.charAt(0) || student.admissionNo.slice(-2)}
                            </div>
                            <div>
                                <p className="font-semibold text-slate-900 text-lg">
                                    {student.user?.name || "Unknown Student"}
                                </p>
                                <div className="flex items-center gap-3 mt-1 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <GraduationCap className="h-3.5 w-3.5" />
                                        {student.class?.name || "No Class"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <CreditCard className="h-3.5 w-3.5" />
                                        {student.admissionNo}
                                    </span>
                                </div>
                                {/* Stop assignments */}
                                {(student.transportMapping?.pickupStop || student.transportMapping?.dropStop) && (
                                    <div className="flex gap-2 mt-2">
                                        {student.transportMapping?.pickupStop && (
                                            <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                                                📍 Pickup: {student.transportMapping.pickupStop.name}
                                            </Badge>
                                        )}
                                        {student.transportMapping?.dropStop && (
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                                🏠 Drop: {student.transportMapping.dropStop.name}
                                            </Badge>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                onClick={() => handleEdit(student)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 text-red-600 hover:bg-red-50 hover:border-red-300"
                                onClick={() => setDeleteStudent(student)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editStudent} onOpenChange={() => setEditStudent(null)}>
                <DialogContent className="sm:max-w-[450px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl">स्टॉप एडिट करें</DialogTitle>
                        <DialogDescription>
                            {editStudent?.user?.name || editStudent?.admissionNo} के लिए Pickup और Drop स्टॉप सेट करें
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <span className="text-green-600">📍</span> Pickup Stop
                            </Label>
                            <Select value={pickupStopId} onValueChange={setPickupStopId}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Pickup स्टॉप चुनें" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="none">कोई नहीं</SelectItem>
                                    {stops && stops.map((stop) => (
                                        <SelectItem key={stop.id} value={stop.id}>{stop.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <span className="text-blue-600">🏠</span> Drop Stop
                            </Label>
                            <Select value={dropStopId} onValueChange={setDropStopId}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Drop स्टॉप चुनें" />
                                </SelectTrigger>
                                <SelectContent className="bg-white">
                                    <SelectItem value="none">कोई नहीं</SelectItem>
                                    {stops && stops.map((stop) => (
                                        <SelectItem key={stop.id} value={stop.id}>{stop.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditStudent(null)}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                            Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteStudent} onOpenChange={() => setDeleteStudent(null)}>
                <DialogContent className="sm:max-w-[400px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl text-red-600">छात्र हटाएं?</DialogTitle>
                        <DialogDescription>
                            क्या आप <strong>{deleteStudent?.user?.name || deleteStudent?.admissionNo}</strong> को इस रूट से हटाना चाहते हैं?
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                            ⚠️ इससे छात्र का transport assignment हट जाएगा।
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteStudent(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                            {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
                            हां, हटाएं
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
