import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSchoolSettings, getEmergencyContacts } from '@/lib/actions';
import Link from 'next/link';

export default async function StudentIdCardPage() {
    const session = await auth();

    if (!session || session.user.role !== 'STUDENT') {
        redirect('/login');
    }

    const [student, schoolSettings, emergencyContacts, school] = await Promise.all([
        prisma.student.findUnique({
            where: { userId: session.user.id },
            include: {
                user: true,
                class: true,
                parent: true,
            }
        }),
        getSchoolSettings(),
        getEmergencyContacts(),
        prisma.school.findFirst({
            where: { id: session.user.schoolId as string }
        })
    ]);

    if (!student) {
        return <div className="p-8 text-center">Student profile not found</div>;
    }

    const primaryEmergency = emergencyContacts.find(c => c.isActive && c.priority === 1) || emergencyContacts[0];
    const academicYear = new Date().getFullYear();
    const nextYear = academicYear + 1;

    const qrData = {
        name: student.user.name,
        rollNo: student.rollNo,
        class: `${student.class?.name}-${student.class?.section}`,
        contact: student.user.phone || student.user.email,
        studentId: student.id
    };

    const qrDataString = JSON.stringify(qrData);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataString)}`;

    return (
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 p-2 md:p-4">
            {/* Back Button */}
            <div>
                <Link
                    href="/student"
                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">My Profile</h1>
                    <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">View your details and ID card</p>
                </div>
            </div>

            {/* Profile Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-gradient-to-br from-blue-400 to-cyan-500 p-4 md:p-6 rounded-xl shadow-lg hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 md:p-3 bg-white/30 rounded-full">
                            <span className="text-2xl md:text-3xl">📝</span>
                        </div>
                        <h3 className="font-bold text-white text-sm md:text-lg">Roll Number</h3>
                    </div>
                    <p className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">{student.rollNo}</p>
                    <p className="text-xs md:text-sm text-white/90 mt-1 font-medium">My Class Identity</p>
                </div>

                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 md:p-6 rounded-xl shadow-lg hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 md:p-3 bg-white/30 rounded-full">
                            <span className="text-2xl md:text-3xl">🏫</span>
                        </div>
                        <h3 className="font-bold text-white text-sm md:text-lg">My Class</h3>
                    </div>
                    <p className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">{student.class?.name}</p>
                    <p className="text-xs md:text-sm text-white/90 mt-1 font-medium">Section {student.class?.section}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-400 to-indigo-500 p-4 md:p-6 rounded-xl shadow-lg hover:scale-105 transition-all sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 md:p-3 bg-white/30 rounded-full">
                            <span className="text-2xl md:text-3xl">👤</span>
                        </div>
                        <h3 className="font-bold text-white text-sm md:text-lg">Attendance</h3>
                    </div>
                    <p className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">95%</p>
                    <p className="text-xs md:text-sm text-white/90 mt-1 font-medium">Present this Month</p>
                </div>
            </div>

            {/* Profile Details */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-slate-800 dark:to-slate-700 rounded-xl md:rounded-2xl border-2 md:border-4 border-orange-300 dark:border-orange-600 overflow-hidden shadow-xl">
                <div className="p-4 md:p-6 bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3 drop-shadow-lg">
                        <span className="text-3xl md:text-4xl">⭐</span>
                        My Beautiful Profile
                    </h2>
                    <p className="text-white/90 mt-1 font-medium text-sm md:text-base">Personal Information</p>
                </div>
                <div className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                            {student.user.image ? (
                                <div className="relative">
                                    <img src={student.user.image} alt={student.user.name || 'Student'} className="w-32 h-32 md:w-36 md:h-36 object-cover rounded-xl md:rounded-2xl border-2 md:border-4 border-orange-300 dark:border-orange-500 shadow-xl" />
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 md:p-2 shadow-lg">
                                        <span className="text-xl md:text-2xl">🏆</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="w-32 h-32 md:w-36 md:h-36 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-xl md:rounded-2xl border-2 md:border-4 border-orange-300 dark:border-orange-500 flex items-center justify-center shadow-xl">
                                        <span className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                                            {(student.user.name || 'S').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1 md:p-2 shadow-lg">
                                        <span className="text-xl md:text-2xl">🏆</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900/30 dark:to-yellow-900/30 p-3 md:p-4 rounded-xl border-l-4 border-orange-500 shadow-md">
                                    <p className="text-xs text-orange-700 dark:text-orange-400 font-bold mb-1 flex items-center gap-1">
                                        <span>👤</span> Name
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{student.user.name}</p>
                                </div>
                                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-3 md:p-4 rounded-xl border-l-4 border-blue-500 shadow-md">
                                    <p className="text-xs text-blue-700 dark:text-blue-400 font-bold mb-1 flex items-center gap-1">
                                        <span>📝</span> Roll Number
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{student.rollNo}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3 md:p-4 rounded-xl border-l-4 border-green-500 shadow-md">
                                    <p className="text-xs text-green-700 dark:text-green-400 font-bold mb-1 flex items-center gap-1">
                                        <span>🏫</span> Class & Section
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{student.class?.name} - {student.class?.section}</p>
                                </div>
                                <div className="bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 p-3 md:p-4 rounded-xl border-l-4 border-purple-500 shadow-md">
                                    <p className="text-xs text-purple-700 dark:text-purple-400 font-bold mb-1 flex items-center gap-1">
                                        <span>📞</span> Phone
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{student.user.phone || 'N/A'}</p>
                                </div>
                                <div className="col-span-1 sm:col-span-2 bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/30 dark:to-rose-900/30 p-3 md:p-4 rounded-xl border-l-4 border-pink-500 shadow-md">
                                    <p className="text-xs text-pink-700 dark:text-pink-400 font-bold mb-1 flex items-center gap-1">
                                        <span>🏠</span> Address
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{student.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Parent Details (New Section) */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl md:rounded-2xl border-2 md:border-4 border-indigo-200 dark:border-indigo-600 overflow-hidden shadow-xl">
                <div className="p-4 md:p-6 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3 drop-shadow-lg">
                        <span className="text-3xl md:text-4xl">👨‍👩‍👦</span>
                        My Family Details
                    </h2>
                    <p className="text-white/90 mt-1 font-medium text-sm md:text-base">Parent Information</p>
                </div>
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-white/50 dark:bg-slate-700/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900">
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1 uppercase tracking-wider">Father's Name</p>
                            <p className="text-base font-black text-slate-900 dark:text-white">{student.parent?.fatherName || 'N/A'}</p>
                        </div>
                        <div className="bg-white/50 dark:bg-slate-700/50 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900">
                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1 uppercase tracking-wider">Mother's Name</p>
                            <p className="text-base font-black text-slate-900 dark:text-white">{student.parent?.motherName || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Original Printable ID Card - Canva-inspired Design */}
            <div
                id="id-card"
                className="bg-white overflow-hidden w-[320px] h-[480px] mx-auto relative flex flex-col font-sans shadow-2xl border border-black"
                style={{
                    backgroundImage: 'radial-gradient(#f0f0f0 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            >
                {/* 1. Wavy Header Section */}
                <div className="h-32 relative overflow-hidden flex-shrink-0">
                    <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full">
                        <defs>
                            <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <path d="M0,0 L500,0 L500,150 Q250,200 0,150 Z" fill="url(#headerGrad)" />
                        <path d="M0,0 L500,0 L500,120 Q350,180 0,120 Z" fill="white" fillOpacity="0.1" />
                    </svg>

                    {/* Header Content */}
                    <div className="relative z-10 pt-4 px-4 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                            {(school?.logo || schoolSettings?.logoUrl) ? (
                                <img src={school?.logo || schoolSettings?.logoUrl || ''} className="w-8 h-8 object-contain" alt="Logo" />
                            ) : (
                                <div className="w-8 h-8 bg-white/20 backdrop-blur-md rounded border border-white/30 flex items-center justify-center">
                                    <svg height="16" viewBox="0 0 24 24" width="16" xmlns="http://www.w3.org/2000/svg" className="text-white">
                                        <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l4-2.18L12 3z" fill="currentColor" />
                                    </svg>
                                </div>
                            )}
                            <h1 className="text-white font-bold text-[13px] tracking-tight uppercase leading-none drop-shadow-sm truncate max-w-[200px]">
                                {school?.name || schoolSettings?.schoolName || 'SUCCESS MISSION SCHOOL'}
                            </h1>
                        </div>
                        <p className="text-white/80 text-[7px] uppercase tracking-wider font-medium text-center line-clamp-1 h-3 flex items-center">
                            {schoolSettings?.address || 'School Address Not Configured'}
                        </p>
                    </div>

                </div>

                {/* 2. Photo Section - Centered & Overlapping */}
                <div className="relative -mt-16 flex justify-center z-30">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {student.user.image ? (
                            <img src={student.user.image} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200 font-bold text-4xl">
                                {student.user.name?.charAt(0) || 'S'}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Name & Role */}
                <div className="text-center pt-3 pb-2 px-4 flex-shrink-0">
                    <h2 className="text-slate-900 font-extrabold text-lg uppercase tracking-tight leading-tight">
                        {student.user.name}
                    </h2>
                    <p className="text-blue-600 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                        STUDENT | CLASS {student.class?.name}-{student.class?.section}
                    </p>
                </div>

                {/* 4. Details Section - Original Style */}
                <div className="px-8 py-2 flex-grow overflow-hidden">
                    <div className="space-y-2 text-slate-800">
                        <div className="flex items-start text-[10px]">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-wider">ADDRESS</span>
                            <span className="mr-2 font-bold">:</span>
                            <span className="font-medium flex-1 line-clamp-2 leading-[1.2]">
                                {student.address || 'N/A'}
                            </span>
                        </div>
                        <div className="flex items-start text-[10px]">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-wider">FATHER</span>
                            <span className="mr-2 font-bold">:</span>
                            <span className="font-bold flex-1 uppercase">{student.parent?.fatherName || 'N/A'}</span>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-100">
                            <div className="flex items-start text-[10px]">
                                <span className="w-24 font-bold text-slate-500 uppercase tracking-wider leading-[1.2]">EMERGENCY CONTACT</span>
                                <span className="mr-2 font-bold">:</span>
                                <span className="font-bold flex-1 text-blue-700">{student.user.phone || primaryEmergency?.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Wavy Footer Section with QR Code */}
                <div className="h-32 relative mt-auto flex-shrink-0">
                    <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full rotate-180">
                        <path d="M0,0 L500,0 L500,150 Q250,200 0,150 Z" fill="#1e3a8a" />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-white p-1 rounded-lg border-2 border-slate-200 shadow-sm z-10">
                            <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" style={{ imageRendering: 'pixelated' }} />
                        </div>
                    </div>

                    <div className="absolute bottom-2 left-0 w-full text-center z-10">
                        <p className="text-[6px] text-white/60 font-medium tracking-tight">
                            Identity Card | {schoolSettings?.schoolName || 'SUCCESS MISSION SCHOOL'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
