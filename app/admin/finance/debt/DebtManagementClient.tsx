"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, Eye, CheckCircle, Smartphone } from "lucide-react";
import { toast } from "sonner";
// import { sendWhatsAppReminder } from "@/lib/actions/notification-actions"; // Future Implementation

interface DebtManagementClientProps {
    students: any[];
}

export default function DebtManagementClient({ students }: DebtManagementClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredStudents, setFilteredStudents] = useState(students);
    const [sending, setSending] = useState<string | null>(null);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        if (!term) {
            setFilteredStudents(students);
            return;
        }

        const lower = term.toLowerCase();
        const filtered = students.filter(s =>
            s.name.toLowerCase().includes(lower) ||
            s.class.toLowerCase().includes(lower) ||
            s.phone?.includes(term)
        );
        setFilteredStudents(filtered);
    };

    const handleSendReminder = async (studentId: string, name: string) => {
        setSending(studentId);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In future: await sendWhatsAppReminder(studentId);
        toast.success(`Reminder sent to ${name}`);
        setSending(null);
    };

    const totalDebt = students.reduce((sum, s) => sum + s.totalDebt, 0);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-red-600 to-red-700 text-white border-none">
                    <CardContent className="p-6">
                        <p className="text-sm font-medium opacity-90">Total Outstanding Debt</p>
                        <h3 className="text-3xl font-bold mt-2">₹{totalDebt.toLocaleString()}</h3>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground">Students with Dues</p>
                        <h3 className="text-3xl font-bold mt-2 text-slate-800">{students.length}</h3>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <p className="text-sm font-medium text-muted-foreground">Critical Cases (&gt; ₹10k)</p>
                        <h3 className="text-3xl font-bold mt-2 text-red-600">
                            {students.filter(s => s.totalDebt > 10000).length}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Debtor List</CardTitle>
                    <CardDescription>Manage and follow up on pending student fees</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, class, phone..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border overflow-hidden">
                        {/* Desktop Table */}
                        <table className="hidden md:table w-full text-sm text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-muted-foreground">
                                <tr>
                                    <th className="p-4 font-medium">Student Name</th>
                                    <th className="p-4 font-medium">Class</th>
                                    <th className="p-4 font-medium">Phone</th>
                                    <th className="p-4 font-medium">Pending Fees</th>
                                    <th className="p-4 font-medium">Total Debt</th>
                                    <th className="p-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filteredStudents.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                            No students found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                            <td className="p-4 font-medium">{student.name}</td>
                                            <td className="p-4">
                                                <Badge variant="outline">{student.class}</Badge>
                                            </td>
                                            <td className="p-4 font-mono text-xs">{student.phone || '-'}</td>
                                            <td className="p-4">{student.pendingFeesCount}</td>
                                            <td className="p-4 font-bold text-red-600">₹{student.totalDebt.toLocaleString()}</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            const phone = student.phone?.replace(/\D/g, ''); // Remove non-digits
                                                            const validPhone = phone?.length === 10 ? `91${phone}` : phone;
                                                            window.open(`https://wa.me/${validPhone}?text=Dear parent, pending fees of Rs ${student.totalDebt} is due.`, '_blank');
                                                        }}
                                                        disabled={!student.phone}
                                                        title="WhatsApp Reminder"
                                                    >
                                                        <Smartphone className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleSendReminder(student.id, student.name)}
                                                        disabled={sending === student.id}
                                                    >
                                                        {sending === student.id ? (
                                                            <span className="animate-spin mr-2">...</span>
                                                        ) : (
                                                            <Bell className="h-4 w-4 mr-2" />
                                                        )}
                                                        Remind
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredStudents.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">
                                    No students found matching your criteria.
                                </div>
                            ) : (
                                filteredStudents.map((student) => (
                                    <div key={student.id} className="p-4 space-y-3 bg-white dark:bg-slate-900">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-semibold text-slate-800 dark:text-white">{student.name}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="outline" className="text-xs">{student.class}</Badge>
                                                    <span className="text-xs text-slate-500 font-mono">{student.phone || 'No Phone'}</span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-red-600">₹{student.totalDebt.toLocaleString()}</p>
                                                <p className="text-xs text-slate-500">{student.pendingFeesCount} Due Item(s)</p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1 border-green-200 hover:bg-green-50 text-green-700"
                                                onClick={() => {
                                                    const phone = student.phone?.replace(/\D/g, '');
                                                    const validPhone = phone?.length === 10 ? `91${phone}` : phone;
                                                    window.open(`https://wa.me/${validPhone}?text=Dear parent, pending fees of Rs ${student.totalDebt} is due.`, '_blank');
                                                }}
                                                disabled={!student.phone}
                                            >
                                                <Smartphone className="h-4 w-4 mr-2" />
                                                WhatsApp
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => handleSendReminder(student.id, student.name)}
                                                disabled={sending === student.id}
                                            >
                                                {sending === student.id ? (
                                                    <span className="animate-spin mr-2">...</span>
                                                ) : (
                                                    <Bell className="h-4 w-4 mr-2" />
                                                )}
                                                Remind
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
