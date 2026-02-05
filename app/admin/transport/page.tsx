import React from 'react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Bus, MapPin, Users, Navigation, BarChart3, Calendar } from 'lucide-react';

export default async function TransportPage() {
    try {
        const routesCount = await prisma.transportRoute.count();
        const vehiclesCount = await prisma.vehicle.count();
        const driversCount = await prisma.driver.count();
        const activeRoutes = await prisma.transportRoute.count({ where: { isActive: true } });

        // Get recent activity
        const recentAttendance = await prisma.transportAttendance.count({
            where: {
                date: {
                    gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
            }
        });

        return (
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                        Transport Management 🚌
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage routes, vehicles, drivers, and track your fleet in real-time
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Link
                        href="/admin/transport/routes"
                        className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Total Routes</p>
                                <p className="text-4xl font-bold mt-2">{routesCount}</p>
                                <p className="text-blue-100 text-xs mt-1">{activeRoutes} active</p>
                            </div>
                            <MapPin className="h-12 w-12 opacity-80" />
                        </div>
                    </Link>

                    <Link
                        href="/admin/transport/vehicles"
                        className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <p className="text-emerald-100 text-sm font-medium">Total Vehicles</p>
                                <p className="text-4xl font-bold mt-2">{vehiclesCount}</p>
                                <p className="text-emerald-100 text-xs mt-1">Fleet size</p>
                            </div>
                            <Bus className="h-12 w-12 opacity-80" />
                        </div>
                    </Link>

                    <Link
                        href="/admin/transport/drivers"
                        className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                    >
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Total Drivers</p>
                                <p className="text-4xl font-bold mt-2">{driversCount}</p>
                                <p className="text-purple-100 text-xs mt-1">Staff members</p>
                            </div>
                            <Users className="h-12 w-12 opacity-80" />
                        </div>
                    </Link>

                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between text-white">
                            <div>
                                <p className="text-amber-100 text-sm font-medium">Today's Activity</p>
                                <p className="text-4xl font-bold mt-2">{recentAttendance}</p>
                                <p className="text-amber-100 text-xs mt-1">Attendance records</p>
                            </div>
                            <Calendar className="h-12 w-12 opacity-80" />
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Primary Features */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600" />
                            Route Management
                        </h2>
                        <div className="space-y-3">
                            <Link
                                href="/admin/transport/routes"
                                className="block w-full text-center py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Manage Routes & Stops
                            </Link>
                            <Link
                                href="/admin/transport/routes"
                                className="block w-full text-center py-3 px-4 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Assign Students
                            </Link>
                        </div>
                    </div>

                    {/* Fleet Management */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <Bus className="h-5 w-5 text-emerald-600" />
                            Fleet Management
                        </h2>
                        <div className="space-y-3">
                            <Link
                                href="/admin/transport/vehicles"
                                className="block w-full text-center py-3 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                            >
                                Manage Vehicles
                            </Link>
                            <Link
                                href="/admin/transport/drivers"
                                className="block w-full text-center py-3 px-4 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                Manage Drivers
                            </Link>
                        </div>
                    </div>

                    {/* Live Tracking */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <Navigation className="h-5 w-5 text-purple-600" />
                            Live Tracking
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            Monitor real-time location of all active buses
                        </p>
                        <Link
                            href="/admin/transport/tracking"
                            className="block w-full text-center py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium shadow-lg"
                        >
                            Open Live Map 📍
                        </Link>
                    </div>

                    {/* Reports & Analytics */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-800">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-amber-600" />
                            Reports & Analytics
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                            View attendance reports and route efficiency
                        </p>
                        <Link
                            href="/admin/transport/reports"
                            className="block w-full text-center py-3 px-4 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg hover:from-amber-700 hover:to-orange-700 transition-colors font-medium shadow-lg"
                        >
                            View Analytics 📊
                        </Link>
                    </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-lg border border-blue-200 dark:border-blue-800">
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Route Planning
                        </h3>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                            Create optimized routes with multiple stops and assign students based on location
                        </p>
                    </div>

                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        <h3 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2 flex items-center gap-2">
                            <Bus className="h-4 w-4" />
                            Fleet Tracking
                        </h3>
                        <p className="text-sm text-emerald-800 dark:text-emerald-200">
                            Monitor vehicle locations in real-time and receive instant notifications
                        </p>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-5 rounded-lg border border-purple-200 dark:border-purple-800">
                        <h3 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Attendance System
                        </h3>
                        <p className="text-sm text-purple-800 dark:text-purple-200">
                            Track student boarding/alighting with GPS-based attendance marking
                        </p>
                    </div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('Transport Page Error:', error);
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-red-800 dark:text-red-200 mb-2">Transport Module Error</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-4">Unable to load transport data. Please check your database connection and try again.</p>
                    <a href="/admin/transport" className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                        Retry
                    </a>
                </div>
            </div>
        );
    }
}
