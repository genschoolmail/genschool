import { getDefaulters } from "@/lib/report-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Phone, User, IndianRupee, Calendar } from "lucide-react";
import Link from "next/link";
import { DefaultersExport } from "./DefaultersExport";

export default async function DefaultersPage() {
    const defaulters = await getDefaulters();

    const totalPending = defaulters.reduce((sum, d) => sum + d.pendingAmount, 0);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                        Fee Defaulters
                    </h1>
                    <p className="text-muted-foreground">Students with overdue fee payments</p>
                </div>
                <div className="flex flex-col sm:flex-row items-end gap-3">
                    <DefaultersExport defaulters={defaulters} />
                    <Card className="bg-red-50 dark:bg-red-900/20 border-red-200">
                        <CardContent className="p-4">
                            <p className="text-sm text-red-600 font-medium">Total Pending</p>
                            <p className="text-2xl font-bold text-red-700">₹{totalPending.toLocaleString()}</p>
                            <p className="text-xs text-red-500">{defaulters.length} students</p>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div id="defaulters-list">

                {defaulters.length === 0 ? (
                    <Card className="bg-green-50 dark:bg-green-900/20">
                        <CardContent className="p-8 text-center">
                            <p className="text-green-700 font-medium">🎉 No defaulters! All fees are up to date.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {defaulters.map((defaulter, idx) => (
                            <Card key={defaulter.student.id} className="bg-white dark:bg-slate-800">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg flex items-center gap-2">
                                                    <User className="h-4 w-4" />
                                                    {defaulter.student.user?.name}
                                                </CardTitle>
                                                <p className="text-sm text-muted-foreground">
                                                    {defaulter.student.admissionNo} • Class {defaulter.student.class?.name}-{defaulter.student.class?.section}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-red-600">₹{defaulter.pendingAmount.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">{defaulter.feeCount} overdue fees</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-4 mb-3">
                                        {defaulter.student.user?.phone && (
                                            <a href={`tel:${defaulter.student.user.phone}`} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                                                <Phone className="h-3 w-3" /> {defaulter.student.user.phone}
                                            </a>
                                        )}
                                        {defaulter.student.parent?.user?.phone && (
                                            <a href={`tel:${defaulter.student.parent.user.phone}`} className="flex items-center gap-1 text-sm text-green-600 hover:underline">
                                                <Phone className="h-3 w-3" /> Parent: {defaulter.student.parent.user.phone}
                                            </a>
                                        )}
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">Overdue Fees:</p>
                                        <div className="space-y-1">
                                            {defaulter.fees.slice(0, 3).map((fee: any) => (
                                                <div key={fee.id} className="flex justify-between text-sm">
                                                    <span>{fee.feeStructure?.feeHead?.name || 'Fee'}</span>
                                                    <span className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-muted-foreground" />
                                                        {new Date(fee.dueDate).toLocaleDateString('en-IN')}
                                                        <IndianRupee className="h-3 w-3" />
                                                        {(fee.amount - fee.paidAmount).toLocaleString()}
                                                    </span>
                                                </div>
                                            ))}
                                            {defaulter.fees.length > 3 && (
                                                <p className="text-xs text-muted-foreground">+ {defaulter.fees.length - 3} more...</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <Link
                                            href={`/admin/finance/fees/collect?studentId=${defaulter.student.id}`}
                                            className="text-sm px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                        >
                                            Collect Payment
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
