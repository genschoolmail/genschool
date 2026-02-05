import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    User, Phone, Mail, MapPin, Calendar, GraduationCap,
    Heart, Bus, IndianRupee, CreditCard, AlertCircle,
    CheckCircle2, Clock, Edit
} from "lucide-react";
import { redirect } from "next/navigation";

async function getStudentProfile(userId: string) {
    const student: any = await prisma.student.findUnique({
        where: { userId },
        include: {
            user: true,
            class: true,
            parent: {
                include: { user: true }
            },
            transport: {
                include: {
                    vehicle: true,
                    driver: { include: { user: true } }
                }
            },
            transportMapping: {
                include: {
                    pickupStop: true,
                    dropStop: true
                }
            },
            studentFees: {
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    feeStructure: true,
                    payments: true
                }
            },
        }
    });
    return student;
}

export default async function StudentProfilePage() {
    const session = await auth();
    if (!session?.user?.id) redirect('/login');

    const student = await getStudentProfile(session.user.id);
    if (!student) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="text-center">
                    <User className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600">Student profile not found</p>
                </div>
            </div>
        );
    }

    // Calculate fee summary
    const totalFees = student.studentFees.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
    const paidAmount = student.studentFees.reduce((sum: number, f: any) => sum + (f.paidAmount || 0), 0);
    const pendingFees = totalFees - paidAmount;

    // Flatten payments
    const recentPayments = student.studentFees
        .flatMap((f: any) => f.payments)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

    return (
        <div className="space-y-6 pb-10">
            {/* Header Card */}
            <Card className="border-none shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 md:p-8 text-white">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="h-24 w-24 md:h-28 md:w-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl font-bold border-4 border-white/30 shadow-lg">
                            {student.user?.name?.charAt(0) || 'S'}
                        </div>
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold mb-1">{student.user?.name || 'Student'}</h1>
                            <p className="text-white/80 mb-3">{student.class?.name || 'No Class'}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2">
                                <Badge className="bg-white/20 text-white border-white/30">
                                    <CreditCard className="h-3 w-3 mr-1" />
                                    {student.admissionNo}
                                </Badge>
                                {student.rollNo && (
                                    <Badge className="bg-white/20 text-white border-white/30">
                                        Roll: {student.rollNo}
                                    </Badge>
                                )}
                                <Badge className="bg-white/20 text-white border-white/30">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {student.admissionYear || 'N/A'}
                                </Badge>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <Link href="/student/id-card">
                                <Button variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                                    <CreditCard className="h-4 w-4 mr-2" /> View ID Card
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <User className="h-5 w-5 text-indigo-600" />
                                Personal Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoRow icon={<Calendar />} label="Date of Birth" value={student.dob ? new Date(student.dob).toLocaleDateString('en-IN') : 'N/A'} />
                                <InfoRow icon={<User />} label="Gender" value={student.gender || 'N/A'} />
                                <InfoRow icon={<Heart />} label="Blood Group" value={student.bloodGroup || 'N/A'} />
                                <InfoRow icon={<Phone />} label="Phone" value={student.phone || 'N/A'} />
                                <InfoRow icon={<Mail />} label="Email" value={student.user?.email || 'N/A'} />
                                <InfoRow icon={<MapPin />} label="Address" value={student.address || 'N/A'} full />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Info */}
                    <Card className="border-none shadow-md">
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <GraduationCap className="h-5 w-5 text-purple-600" />
                                Academic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <InfoRow icon={<GraduationCap />} label="Class" value={student.class?.name || 'N/A'} />
                                <InfoRow icon={<CreditCard />} label="Roll Number" value={student.rollNo || 'N/A'} />
                                <InfoRow icon={<Calendar />} label="Admission Year" value={student.admissionYear || 'N/A'} />
                                <InfoRow icon={<CreditCard />} label="Admission No" value={student.admissionNo} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Parent Info */}
                    {student.parent && (
                        <Card className="border-none shadow-md">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <User className="h-5 w-5 text-cyan-600" />
                                    Parent/Guardian
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                    <div className="h-14 w-14 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-xl">
                                        {student.parent.user?.name?.charAt(0) || 'P'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">{student.parent.user?.name}</p>
                                        <p className="text-slate-500">{student.parent.phone}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Fee Summary */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <IndianRupee className="h-5 w-5" />
                                Fee Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="text-slate-600">Total Fees</span>
                                    <span className="font-bold text-lg">₹{totalFees.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                    <span className="text-slate-600">Paid</span>
                                    <span className="font-bold text-lg text-blue-600">₹{paidAmount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                    <span className="text-slate-600">Pending</span>
                                    <span className="font-bold text-lg text-red-600">₹{pendingFees.toLocaleString()}</span>
                                </div>
                            </div>

                            {recentPayments.length > 0 && (
                                <div className="mt-4 pt-4 border-t">
                                    <p className="text-sm font-semibold text-slate-700 mb-3">Recent Payments</p>
                                    <div className="space-y-2">
                                        {recentPayments.map((payment: any) => (
                                            <div key={payment.id} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span>{new Date(payment.date).toLocaleDateString('en-IN')}</span>
                                                </div>
                                                <span className="font-medium">₹{payment.amount.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Link href="/student/finance/fees">
                                <Button className="w-full mt-4" variant="outline">View All Fees</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Transport Info */}
                    <Card className="border-none shadow-md overflow-hidden">
                        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Bus className="h-5 w-5" />
                                Transport
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {student.transport ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                        <Bus className="h-8 w-8 text-orange-600" />
                                        <div>
                                            <p className="font-semibold">{student.transport.name}</p>
                                            <p className="text-sm text-slate-500">Route: {student.transport.routeNo}</p>
                                        </div>
                                    </div>

                                    {student.transport.vehicle && (
                                        <InfoRow icon={<Bus />} label="Vehicle" value={student.transport.vehicle.number} />
                                    )}

                                    {student.transport.driver?.user && (
                                        <InfoRow icon={<User />} label="Driver" value={student.transport.driver.user.name || 'N/A'} />
                                    )}

                                    {student.transportMapping?.pickupStop && (
                                        <InfoRow icon={<MapPin />} label="Pickup Stop" value={student.transportMapping.pickupStop.name} />
                                    )}

                                    {student.transportMapping?.dropStop && (
                                        <InfoRow icon={<MapPin />} label="Drop Stop" value={student.transportMapping.dropStop.name} />
                                    )}

                                    <Link href="/student/transport">
                                        <Button className="w-full mt-2 bg-orange-600 hover:bg-orange-700">
                                            Track My Bus
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Bus className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No transport assigned</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon, label, value, full }: { icon: React.ReactNode; label: string; value: string; full?: boolean }) {
    return (
        <div className={`flex items-center gap-3 p-3 bg-slate-50 rounded-lg ${full ? 'md:col-span-2' : ''}`}>
            <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center text-slate-500 shadow-sm">
                {icon}
            </div>
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="font-medium text-slate-800">{value}</p>
            </div>
        </div>
    );
}
