
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getRouteHistory } from "@/lib/driver-transport-actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User, MapPin, Clock } from "lucide-react";
import Link from "next/link";

export default async function DriverHistoryPage({
    searchParams
}: {
    searchParams: Promise<{ date?: string }> | { date?: string }
}) {
    const session = await auth();

    if (!session || session.user.role !== "DRIVER") {
        redirect("/login");
    }

    // Get driver profile with route
    const driver = await prisma.driver.findUnique({
        where: { userId: session.user.id },
        include: { route: true }
    });

    if (!driver || !driver.route) {
        redirect("/driver");
    }

    // Resolve searchParams (Next.js 15)
    let dateParam = new Date().toISOString().split('T')[0];
    if (searchParams) {
        const resolved = searchParams instanceof Promise ? await searchParams : searchParams;
        if (resolved.date) dateParam = resolved.date;
    }

    const { success, raw } = await getRouteHistory(driver.route.id, new Date(dateParam), new Date(dateParam));
    const records = success ? raw : [];

    return (
        <div className="p-4 max-w-lg mx-auto pb-20">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/driver">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-xl font-bold text-slate-900">History</h1>
                    <p className="text-sm text-slate-500">Route {driver.route.routeNo}</p>
                </div>
            </div>

            {/* Date Filter */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4">
                <form className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <input
                        type="date"
                        name="date"
                        defaultValue={dateParam}
                        className="flex-1 bg-transparent outline-none text-slate-800 font-medium"
                        onChange={(e) => {
                            // Using form submission for simplicity or could use client component wrapper
                            e.target.form?.submit();
                        }}
                    />
                    <Button type="submit" size="sm" variant="outline">View</Button>
                </form>
            </div>

            {/* Records List */}
            <div className="space-y-3">
                {records.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No records found for this date.
                    </div>
                ) : (
                    records.map((record: any) => (
                        <div key={record.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${record.type === 'PICKUP' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {record.type === 'PICKUP' ? <ArrowLeft className="w-4 h-4 rotate-90" /> : <ArrowLeft className="w-4 h-4 -rotate-90" />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-800">{record.student.user.name}</h3>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <span className="mx-1">•</span>
                                        {record.student.class?.name || 'No Class'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${record.status === 'BOARDED' ? 'bg-green-100 text-green-700' :
                                        record.status === 'ALIGHTED' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                    {record.status}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
