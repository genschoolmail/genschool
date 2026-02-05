"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, Edit2, Save, X, Trash2, Plus } from "lucide-react";
import { updateClassCapacity } from "@/lib/actions/updateClassCapacity";
import { toast } from "sonner";

interface ClassData {
    id: string;
    name: string;
    section: string;
    capacity: number;
    enrolled: number;
    available: number;
    academicYear: string;
}

export default function ClassSectionsClient({ initialClasses }: { initialClasses: ClassData[] }) {
    const [classes, setClasses] = useState(initialClasses);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editCapacity, setEditCapacity] = useState<number>(0);

    const handleEdit = (cls: ClassData) => {
        setEditingId(cls.id);
        setEditCapacity(cls.capacity);
    };

    const handleSave = async (classId: string) => {
        try {
            await updateClassCapacity(classId, editCapacity);
            setClasses(prev => prev.map(c =>
                c.id === classId ? { ...c, capacity: editCapacity, available: editCapacity - c.enrolled } : c
            ));
            setEditingId(null);
            toast.success("Capacity updated successfully!");
        } catch (error) {
            toast.error("Failed to update capacity");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
    };

    // Group classes by name
    const groupedClasses = classes.reduce((acc, cls) => {
        if (!acc[cls.name]) acc[cls.name] = [];
        acc[cls.name].push(cls);
        return acc;
    }, {} as Record<string, ClassData[]>);

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <Users className="h-8 w-8 text-indigo-600" />
                        Class & Section Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage section capacity for each class
                    </p>
                </div>
            </div>

            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <CardContent className="p-4">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                        💡 <strong>Tip:</strong> Set section capacity to control how many students can be enrolled in each section.
                        This is used for automatic section assignment during new admissions and promotions.
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-6">
                {Object.entries(groupedClasses).map(([className, sections]) => (
                    <Card key={className} className="bg-white dark:bg-slate-800">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Class {className}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 dark:bg-slate-700">
                                        <tr>
                                            <th className="p-3 text-left font-semibold">Section</th>
                                            <th className="p-3 text-center font-semibold">Capacity</th>
                                            <th className="p-3 text-center font-semibold">Enrolled</th>
                                            <th className="p-3 text-center font-semibold">Available</th>
                                            <th className="p-3 text-center font-semibold">Status</th>
                                            <th className="p-3 text-right font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sections.map(cls => (
                                            <tr key={cls.id} className="border-b border-slate-100 dark:border-slate-700">
                                                <td className="p-3">
                                                    <span className="font-bold text-indigo-600">Section {cls.section}</span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {editingId === cls.id ? (
                                                        <Input
                                                            type="number"
                                                            value={editCapacity}
                                                            onChange={e => setEditCapacity(parseInt(e.target.value) || 0)}
                                                            className="w-20 mx-auto text-center"
                                                            min={cls.enrolled}
                                                        />
                                                    ) : (
                                                        <span className="font-mono">{cls.capacity}</span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-center font-mono">{cls.enrolled}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`font-mono ${cls.available > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {cls.available}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {cls.available > 0 ? (
                                                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                            Open
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                                                            Full
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right">
                                                    {editingId === cls.id ? (
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" onClick={() => handleSave(cls.id)} className="bg-green-600 hover:bg-green-700">
                                                                <Save className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="sm" variant="outline" onClick={handleCancel}>
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <Button size="sm" variant="outline" onClick={() => handleEdit(cls)}>
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {Object.keys(groupedClasses).length === 0 && (
                <Card className="bg-slate-50 dark:bg-slate-800">
                    <CardContent className="p-8 text-center text-muted-foreground">
                        No classes found. Create classes first in the Academic section.
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
