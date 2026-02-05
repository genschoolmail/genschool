"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    GraduationCap, ArrowRight, AlertTriangle, CheckCircle,
    Download, Users, TrendingUp, Loader2, Trophy
} from "lucide-react";
import { toast } from "sonner";
import { executeMeritPromotion, getStudentsForPromotion } from "@/lib/promotion-system-actions";

interface Class {
    id: string;
    name: string;
    section: string;
    _count: { students: number };
}

interface PromotionResult {
    studentId: string;
    name: string;
    rank: number;
    fromSection: string | undefined;
    toSection: string;
    newRoll: number;
    percentage: number;
}

export default function PromotionClient({ classes }: { classes: Class[] }) {
    const [fromClassId, setFromClassId] = useState('');
    const [toClassName, setToClassName] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [preview, setPreview] = useState<any[]>([]);
    const [results, setResults] = useState<PromotionResult[]>([]);
    const [promoted, setPromoted] = useState(false);

    const uniqueClassNames = [...new Set(classes.map(c => c.name))].sort((a, b) =>
        parseInt(a) - parseInt(b)
    );

    const handlePreview = async () => {
        if (!fromClassId) {
            toast.error("Select source class first");
            return;
        }
        setPreviewLoading(true);
        try {
            const students = await getStudentsForPromotion(fromClassId, '2024-2025');
            setPreview(students);
        } catch (error) {
            toast.error("Failed to load preview");
        }
        setPreviewLoading(false);
    };

    const handlePromote = async () => {
        if (!fromClassId || !toClassName) {
            toast.error("Select both source and target class");
            return;
        }
        setLoading(true);
        try {
            const result = await executeMeritPromotion(fromClassId, toClassName, '2024-2025', 40);
            setResults(result.results);
            setPromoted(true);
            toast.success(`Successfully promoted ${result.promoted} students!`);
        } catch (error: any) {
            toast.error(error.message || "Promotion failed");
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <GraduationCap className="h-8 w-8 text-indigo-600" />
                        Merit-Based Promotion
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Promote students to next class based on their final exam marks
                    </p>
                </div>
            </div>

            <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200">
                <CardContent className="p-4 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800 dark:text-amber-200">Important</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300">
                            Students will be sorted by their final exam percentage and assigned to sections
                            (Section A = Top performers, Section B = Next, etc.). Roll numbers will be
                            assigned based on rank within each section.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {!promoted && (
                <Card>
                    <CardHeader>
                        <CardTitle>Select Classes</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div>
                                <label className="block text-sm font-medium mb-2">From Class</label>
                                <select
                                    value={fromClassId}
                                    onChange={(e) => {
                                        setFromClassId(e.target.value);
                                        setPreview([]);
                                    }}
                                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}-{cls.section} ({cls._count.students} students)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-center">
                                <ArrowRight className="h-8 w-8 text-indigo-600" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">To Class</label>
                                <select
                                    value={toClassName}
                                    onChange={(e) => setToClassName(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg bg-white dark:bg-slate-800"
                                >
                                    <option value="">Select Class</option>
                                    {uniqueClassNames.map(name => (
                                        <option key={name} value={name}>
                                            Class {name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={handlePreview}
                                disabled={!fromClassId || previewLoading}
                            >
                                {previewLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Preview Students
                            </Button>
                            <Button
                                onClick={handlePromote}
                                disabled={!fromClassId || !toClassName || loading}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <GraduationCap className="h-4 w-4 mr-2" />}
                                Promote All Students
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Preview Table */}
            {preview.length > 0 && !promoted && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Students Preview (Sorted by Marks)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 dark:bg-slate-700">
                                    <tr>
                                        <th className="p-3 text-left">Rank</th>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-left">Admission No</th>
                                        <th className="p-3 text-center">Current Roll</th>
                                        <th className="p-3 text-center">Total Marks</th>
                                        <th className="p-3 text-center">Percentage</th>
                                        <th className="p-3 text-center">New Section</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.map((student, idx) => (
                                        <tr key={student.id} className="border-b">
                                            <td className="p-3">
                                                {idx < 3 ? (
                                                    <span className="flex items-center gap-1">
                                                        <Trophy className={`h-4 w-4 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : 'text-amber-600'}`} />
                                                        {idx + 1}
                                                    </span>
                                                ) : idx + 1}
                                            </td>
                                            <td className="p-3 font-medium">{student.name}</td>
                                            <td className="p-3 font-mono text-sm">{student.admissionNo}</td>
                                            <td className="p-3 text-center">{student.rollNo}</td>
                                            <td className="p-3 text-center">{student.totalMarks}/{student.maxMarks}</td>
                                            <td className="p-3 text-center">
                                                <span className={`font-bold ${student.percentage >= 75 ? 'text-green-600' : student.percentage >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                                                    {student.percentage}%
                                                </span>
                                            </td>
                                            <td className="p-3 text-center">
                                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                                                    Section {String.fromCharCode(65 + Math.floor(idx / 40))}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Results */}
            {promoted && results.length > 0 && (
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-800">
                            <CheckCircle className="h-5 w-5" />
                            Promotion Complete!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-green-700 mb-4">
                            Successfully promoted {results.length} students to Class {toClassName}
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-green-100 dark:bg-green-800">
                                    <tr>
                                        <th className="p-3 text-left">Rank</th>
                                        <th className="p-3 text-left">Name</th>
                                        <th className="p-3 text-center">Percentage</th>
                                        <th className="p-3 text-center">New Section</th>
                                        <th className="p-3 text-center">New Roll</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {results.slice(0, 20).map((result) => (
                                        <tr key={result.studentId} className="border-b border-green-100">
                                            <td className="p-3">{result.rank}</td>
                                            <td className="p-3 font-medium">{result.name}</td>
                                            <td className="p-3 text-center font-bold">{result.percentage}%</td>
                                            <td className="p-3 text-center">Section {result.toSection}</td>
                                            <td className="p-3 text-center">{result.newRoll}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {results.length > 20 && (
                                <p className="text-sm text-muted-foreground mt-2 text-center">
                                    ...and {results.length - 20} more students
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
