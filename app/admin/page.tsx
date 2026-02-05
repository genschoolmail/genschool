import React from 'react';
import { prisma } from '@/lib/prisma';
import { getActiveAnnouncements } from '@/lib/actions/global-notifications';
import { getTenantId } from '@/lib/tenant';
import {
    Users, GraduationCap, IndianRupee, Bus, TrendingUp,
    Sparkles, Image as ImageIcon, Award, BookOpen,
    Target, Heart, Lightbulb
} from 'lucide-react';
import StatCard from '@/components/StatCard';
import Link from 'next/link';

export default async function AdminDashboard() {
    try {
        const schoolId = await getTenantId();
        if (!schoolId) {
            throw new Error('Tenant ID not found');
        }

        const announcements = await getActiveAnnouncements();

        // Fetch school data with settings
        const school = await prisma.school.findUnique({
            where: { id: schoolId }
        });

        const settings = school?.settings || {};
        const gallery = settings.galleryJson ? JSON.parse(settings.galleryJson as string) : [];

        // Fetch stats
        const studentCount = await prisma.student.count({ where: { schoolId } });
        const teacherCount = await prisma.teacher.count({ where: { schoolId } });
        const transportCount = await prisma.transportRoute.count({ where: { schoolId } });

        const payments = await prisma.feePayment.aggregate({
            where: {
                schoolId,
                status: { in: ['SUCCESS', 'PAID', 'COMPLETED'] }
            },
            _sum: { amount: true }
        });
        const totalFees = payments._sum.amount || 0;

        const recentStudents = await prisma.student.findMany({
            where: { schoolId },
            take: 5,
            orderBy: { user: { createdAt: 'desc' } },
            include: {
                user: true,
                class: true
            }
        });

        return (
            <div className="space-y-6 animate-in fade-in duration-700">
                {/* Global Announcements with animation */}
                {announcements.length > 0 && (
                    <div className="space-y-3 animate-in slide-in-from-top duration-500">
                        {announcements.map((ann: any) => (
                            <div key={ann.id} className={`p-4 rounded-2xl border flex items-center gap-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md ${ann.priority === 'CRITICAL' ? 'bg-red-50 border-red-100 text-red-900 dark:bg-red-900/20 dark:border-red-800' :
                                ann.priority === 'WARNING' ? 'bg-amber-50 border-amber-100 text-amber-900 dark:bg-amber-900/20 dark:border-amber-800' :
                                    'bg-indigo-50 border-indigo-100 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-800'
                                }`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 animate-pulse ${ann.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                                    ann.priority === 'WARNING' ? 'bg-amber-500 text-white' :
                                        'bg-indigo-600 text-white'
                                    }`}>
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-sm">{ann.title}</h4>
                                    <p className="text-xs opacity-70 font-medium">{ann.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Hero Welcome Banner with gradient animation */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl animate-in slide-in-from-bottom duration-700">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse delay-150"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                            Welcome back, Administrator!
                            <span className="animate-wave inline-block">👋</span>
                        </h2>
                        <p className="text-indigo-100 max-w-xl">
                            Here's what's happening in {school?.name || 'your school'} today.
                        </p>
                    </div>
                </div>

                {/* Stats Grid with stagger animation */}
                <div className="grid-responsive-4 gap-6">
                    <div className="animate-in slide-in-from-left duration-500">
                        <StatCard
                            title="Total Students"
                            value={studentCount.toString()}
                            icon={Users}
                            color="text-blue-600"
                            trend="+12%"
                        />
                    </div>
                    <div className="animate-in slide-in-from-left duration-500 delay-100">
                        <StatCard
                            title="Total Teachers"
                            value={teacherCount.toString()}
                            icon={GraduationCap}
                            color="text-purple-600"
                            trend="+2%"
                        />
                    </div>
                    <div className="animate-in slide-in-from-left duration-500 delay-200">
                        <StatCard
                            title="Fee Collection"
                            value={`₹ ${totalFees.toLocaleString()}`}
                            icon={IndianRupee}
                            color="text-emerald-600"
                            trend="+8%"
                        />
                    </div>
                    <div className="animate-in slide-in-from-left duration-500 delay-300">
                        <StatCard
                            title="Transport"
                            value={`${transportCount} Routes`}
                            icon={Bus}
                            color="text-orange-600"
                        />
                    </div>
                </div>

                {/* Gallery Section */}
                {gallery.length > 0 && (
                    <section id="gallery" className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 animate-in fade-in duration-700 delay-400">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <ImageIcon className="w-6 h-6 text-indigo-500" />
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">School Memories</h3>
                            </div>
                            <Link href="/admin/settings/website" className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold dark:text-indigo-400">
                                Manage Gallery →
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {gallery.slice(0, 8).map((item: any, idx: number) => (
                                <div key={idx} className="group relative aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all hover:scale-105">
                                    <img
                                        src={item.url}
                                        alt={item.caption || 'Gallery image'}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    {item.caption && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                            <p className="text-white text-xs font-semibold">{item.caption}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Recent Activities & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-700 delay-600">
                    {/* Recent Admissions */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-500" />
                                Recent Admissions
                            </h3>
                            <Link href="/admin/students" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</Link>
                        </div>
                        <div className="space-y-4">
                            {recentStudents.length === 0 ? (
                                <p className="text-slate-500 text-center py-4 text-sm">No recent admissions found.</p>
                            ) : (
                                recentStudents.map((student) => (
                                    <div key={student.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all cursor-pointer group">
                                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                                            <div className="w-12 h-12 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center text-sm font-bold text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-500 shrink-0">
                                                {(student.user.name || 'U').charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors truncate">
                                                    {student.user.name || 'Unknown Student'}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">
                                                    Class {student.class?.name || 'N/A'} • Adm #{student.admissionNo}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0 ml-2">Today</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <Link href="/admin/students/new" className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all group">
                                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add Student</p>
                            </Link>
                            <Link href="/admin/finance/fees/collect" className="p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all group">
                                <IndianRupee className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Collect Fee</p>
                            </Link>
                            <Link href="/admin/library/issue" className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all group">
                                <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Issue Book</p>
                            </Link>
                            <Link href="/admin/inventory/add" className="p-4 bg-purple-50 dark:bg-purple-500/10 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all group">
                                <Bus className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Add Item</p>
                            </Link>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">System Status</h4>
                            <div className="flex items-center justify-between text-sm mb-2">
                                <span className="text-slate-600 dark:text-slate-300">Server</span>
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                                    Online
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-300">Database</span>
                                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                                    Connected
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Admin Dashboard Error:', error);
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Dashboard Loading Error</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-4">Unable to load dashboard data. Please check your database connection.</p>
                    <a href="/admin" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                        Retry
                    </a>
                </div>
            </div>
        );
    }
}
