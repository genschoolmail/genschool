"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, DollarSign, Calendar, CheckCircle, AlertCircle, Loader2, School } from "lucide-react";
import { assignFeeToStudent, assignFeesToClass } from "@/lib/fee-master-actions";
import { getCurrentAcademicYear } from "@/lib/actions/academic-year";
import { toast } from "sonner";

interface FeeAssignmentClientProps {
    students: any[];
    classes: any[];
    feeStructures: any[];
}

export default function FeeAssignmentClient({ students, classes, feeStructures }: FeeAssignmentClientProps) {
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedStructures, setSelectedStructures] = useState<string[]>([]);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [feeMonth, setFeeMonth] = useState(new Date().getMonth() + 1); // 1-12
    const [activeAcademicYear, setActiveAcademicYear] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<"individual" | "bulk">("bulk");

    useEffect(() => {
        const fetchYear = async () => {
            const year = await getCurrentAcademicYear();
            if (year) {
                setActiveAcademicYear(year);
            }
        };
        fetchYear();
    }, []);

    const MONTHS = [
        { value: 1, label: 'January' }, { value: 2, label: 'February' }, { value: 3, label: 'March' },
        { value: 4, label: 'April' }, { value: 5, label: 'May' }, { value: 6, label: 'June' },
        { value: 7, label: 'July' }, { value: 8, label: 'August' }, { value: 9, label: 'September' },
        { value: 10, label: 'October' }, { value: 11, label: 'November' }, { value: 12, label: 'December' }
    ];

    const getCalculatedFeeYear = () => {
        if (!activeAcademicYear) return new Date().getFullYear();
        const startYear = new Date(activeAcademicYear.startDate).getFullYear();
        const endYear = new Date(activeAcademicYear.endDate).getFullYear();
        // Assuming session starts in April (Month 4).
        // If feeMonth is 4, 5, ... 12 -> use Start Year
        // If feeMonth is 1, 2, 3 -> use End Year
        return feeMonth >= 4 ? startYear : endYear;
    };

    const calculatedYear = getCalculatedFeeYear();

    const filteredStudents = selectedClass
        ? students.filter(s => s.classId === selectedClass)
        : students;

    const handleToggleStructure = (id: string) => {
        setSelectedStructures(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAllStructures = (checked: boolean) => {
        if (checked) {
            setSelectedStructures(feeStructures.map(f => f.id));
        } else {
            setSelectedStructures([]);
        }
    };

    const handleBulkAssign = async () => {
        if (!selectedClass || selectedStructures.length === 0 || !dueDate) {
            return toast.error("Please select class, at least one fee structure, and due date");
        }

        if (!activeAcademicYear) {
            return toast.error("Active Academic Year not found. Please contact admin.");
        }

        setLoading(true);
        const res = await assignFeesToClass({
            classId: selectedClass,
            feeStructureIds: selectedStructures,
            dueDate: new Date(dueDate),
            feeMonth,
            feeYear: calculatedYear,
            academicYearId: activeAcademicYear.id
        });

        if (res.success) {
            toast.success(`Assigned to ${res.count} students (${res.skipped} skipped/duplicate)`);
            setSelectedClass("");
            setSelectedStructures([]);
            // setDueDate(""); // Keep due date for convenience
        } else {
            toast.error(res.error || "Failed to assign");
        }
        setLoading(false);
    };

    const handleIndividualAssign = async () => {
        if (!selectedStudent || selectedStructures.length === 0 || !dueDate) {
            return toast.error("Please select student, at least one fee structure, and due date");
        }

        if (!activeAcademicYear) {
            return toast.error("Active Academic Year not found. Please contact admin.");
        }

        setLoading(true);
        const res = await assignFeeToStudent({
            studentId: selectedStudent,
            feeStructureIds: selectedStructures,
            dueDate: new Date(dueDate),
            feeMonth,
            feeYear: calculatedYear,
            academicYearId: activeAcademicYear.id
        });

        if (res.success) {
            toast.success("Fees assigned successfully!");
            setSelectedStudent("");
            setSelectedStructures([]);
        } else {
            toast.error(res.error || "Failed to assign");
        }
        setLoading(false);
    };

    const FeeSelectionList = () => (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-2 px-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <Checkbox
                        id="select-all-fees"
                        checked={selectedStructures.length === feeStructures.length && feeStructures.length > 0}
                        onCheckedChange={handleSelectAllStructures}
                    />
                    <Label htmlFor="select-all-fees" className="text-xs font-semibold uppercase text-slate-500">Select Fees to Assign</Label>
                </div>
                <span className="text-xs text-slate-500">{selectedStructures.length} selected</span>
            </div>
            <div className="max-h-[250px] overflow-y-auto p-2 space-y-1 bg-white dark:bg-slate-900">
                {feeStructures.map(f => (
                    <div
                        key={f.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${selectedStructures.includes(f.id) ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        onClick={() => handleToggleStructure(f.id)}
                    >
                        <div className="flex items-center gap-3">
                            <Checkbox checked={selectedStructures.includes(f.id)} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{f.name}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">₹{f.amount.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Fee Assignment</h1>
                    <p className="text-slate-500 dark:text-slate-400">Assign fees to students for the current academic session.</p>
                </div>

                {activeAcademicYear ? (
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 shadow-sm px-4 py-2 rounded-xl">
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                            <School className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Active Session</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{activeAcademicYear.name}</p>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2 hidden sm:block"></div>
                        <div className="hidden sm:block">
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        </div>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400 hidden sm:block">Live Linked</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900">
                        <AlertCircle className="h-5 w-5" />
                        <span className="font-medium">No Active Academic Year Set</span>
                    </div>
                )}
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
                <Button
                    variant={mode === "bulk" ? "default" : "outline"}
                    onClick={() => setMode("bulk")}
                    className={mode === "bulk" ? "bg-indigo-600" : ""}
                >
                    <Users className="h-4 w-4 mr-2" />
                    Bulk Assign (Class)
                </Button>
                <Button
                    variant={mode === "individual" ? "default" : "outline"}
                    onClick={() => setMode("individual")}
                    className={mode === "individual" ? "bg-indigo-600" : ""}
                >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Individual
                </Button>
            </div>

            {/* Bulk Assignment Card */}
            {mode === "bulk" && (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-indigo-600" />
                            Bulk Assign to Class
                        </CardTitle>
                        <CardDescription>
                            Assign multiple fees to all students in a class at once
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Select Class</Label>
                                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose class..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 max-h-[200px] overflow-y-auto">
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    Class {c.name}-{c.section}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>

                                {selectedClass && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-start gap-3 border border-blue-100 dark:border-blue-900">
                                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="font-semibold text-blue-800 dark:text-blue-200 text-sm">
                                                Target Audience
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                {filteredStudents.length} students in this class will be assigned {selectedStructures.length} fee(s).
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Fee Structures</Label>
                                <FeeSelectionList />
                            </div>
                        </div>

                        {/* Month Selection */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-indigo-600" />
                                    Fee Month
                                </Label>
                                <Select value={feeMonth.toString()} onValueChange={v => setFeeMonth(parseInt(v))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800">
                                        {MONTHS.map(m => (
                                            <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Finance Year</Label>
                                <div className="flex items-center gap-3 p-2.5 border border-indigo-100 dark:border-indigo-900/50 rounded-lg bg-indigo-50/50 dark:bg-indigo-900/10">
                                    <div className="font-mono text-lg font-bold text-indigo-700 dark:text-indigo-300">
                                        {calculatedYear}
                                    </div>
                                    <span className="text-xs text-indigo-400 dark:text-indigo-500 font-medium ml-auto">
                                        Auto-calculated
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleBulkAssign}
                            disabled={loading || !selectedClass || selectedStructures.length === 0 || !dueDate}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-6 text-lg shadow-md"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                            Assign {selectedStructures.length} Fee(s) to Class
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Individual Assignment Card */}
            {mode === "individual" && (
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            Individual Assignment
                        </CardTitle>
                        <CardDescription>
                            Assign fees to a specific student
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Filter by Class (Optional)</Label>
                                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="All classes" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 max-h-[200px] overflow-y-auto">
                                            <SelectItem value="">All Classes</SelectItem>
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    Class {c.name}-{c.section}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Select Student</Label>
                                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose student..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white dark:bg-slate-800 max-h-[200px] overflow-y-auto">
                                            {filteredStudents.map(s => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    {s.user?.name} ({s.admissionNo})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input
                                        type="date"
                                        value={dueDate}
                                        onChange={e => setDueDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Fee Structures</Label>
                                <FeeSelectionList />
                            </div>
                        </div>

                        {/* Month Selection - Same as Bulk */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-800">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-green-600" />
                                    Fee Month
                                </Label>
                                <Select value={feeMonth.toString()} onValueChange={v => setFeeMonth(parseInt(v))}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-800">
                                        {MONTHS.map(m => (
                                            <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Target Finance Year</Label>
                                <div className="flex items-center gap-3 p-2.5 border border-green-100 dark:border-green-900/50 rounded-lg bg-green-50/50 dark:bg-green-900/10">
                                    <div className="font-mono text-lg font-bold text-green-700 dark:text-green-300">
                                        {calculatedYear}
                                    </div>
                                    <span className="text-xs text-green-600 dark:text-green-500 font-medium ml-auto">
                                        Auto-calculated
                                    </span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleIndividualAssign}
                            disabled={loading || !selectedStudent || selectedStructures.length === 0 || !dueDate}
                            className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 py-6 text-lg shadow-md"
                        >
                            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle className="h-5 w-5 mr-2" />}
                            Assign {selectedStructures.length} Fee(s) to Student
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
