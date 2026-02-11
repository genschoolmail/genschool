import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSchoolSettings, getEmergencyContacts } from '@/lib/actions';
import Link from 'next/link';

export default async function TeacherIdCardPage() {
    const session = await auth();

    if (!session || session.user.role !== 'TEACHER') {
        redirect('/login');
    }

    const [teacher, schoolSettings, emergencyContacts, school] = await Promise.all([
        prisma.teacher.findUnique({
            where: { userId: session.user.id },
            include: {
                user: true,
                subjects: {
                    include: {
                        class: true
                    }
                }
            }
        }),
        getSchoolSettings(),
        getEmergencyContacts(),
        prisma.school.findFirst({
            where: { id: session.user.schoolId as string }
        })
    ]);

    if (!teacher) {
        return <div className="p-8 text-center">Teacher profile not found</div>;
    }

    const primaryEmergency = emergencyContacts.find(c => c.isActive && c.priority === 1) || emergencyContacts[0];
    const academicYear = new Date().getFullYear();
    const nextYear = academicYear + 1;

    const qrData = {
        name: teacher.user.name,
        employeeId: teacher.employeeId,
        designation: teacher.designation,
        contact: teacher.user.phone || teacher.user.email,
        teacherId: teacher.id
    };

    const qrDataString = JSON.stringify(qrData);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrDataString)}`;

    return (
        <div className="max-w-4xl mx-auto space-y-4 md:space-y-6 p-2 md:p-4">
            {/* Back Button */}
            <div>
                <Link
                    href="/teacher"
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
                            <span className="text-2xl md:text-3xl">🆔</span>
                        </div>
                        <h3 className="font-bold text-white text-sm md:text-lg">Employee ID</h3>
                    </div>
                    <p className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">{teacher.employeeId}</p>
                    <p className="text-xs md:text-sm text-white/90 mt-1 font-medium">My Staff Number</p>
                </div>

                <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-4 md:p-6 rounded-xl shadow-lg hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 md:p-3 bg-white/30 rounded-full">
                            <span className="text-2xl md:text-3xl">📚</span>
                        </div>
                        <h3 className="font-bold text-white text-sm md:text-lg">Subjects</h3>
                    </div>
                    <p className="text-2xl md:text-4xl font-black text-white drop-shadow-lg">{teacher.subjects.length}</p>
                    <p className="text-xs md:text-sm text-white/90 mt-1 font-medium">Teaching</p>
                </div>

                <div className="bg-gradient-to-br from-purple-400 to-indigo-500 p-4 md:p-6 rounded-xl shadow-lg hover:scale-105 transition-all sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 md:p-3 bg-white/30 rounded-full">
                            <span className="text-2xl md:text-3xl">💼</span>
                        </div>
                        <h3 className="font-bold text-white text-sm md:text-lg">Designation</h3>
                    </div>
                    <p className="text-xl md:text-2xl font-black text-white drop-shadow-lg">
                        {teacher.designation || 'Teacher'}
                    </p>
                    <p className="text-xs md:text-sm text-white/90 mt-1 font-medium">Role</p>
                </div>
            </div>

            {/* Profile Details */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 rounded-xl md:rounded-2xl border-2 md:border-4 border-blue-300 dark:border-blue-600 overflow-hidden shadow-xl">
                <div className="p-4 md:p-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2 md:gap-3 drop-shadow-lg">
                        <span className="text-3xl md:text-4xl">👨‍🏫</span>
                        My Complete Profile
                    </h2>
                    <p className="text-white/90 mt-1 font-medium text-sm md:text-base">Professional Information</p>
                </div>
                <div className="p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 md:gap-6">
                        <div className="flex-shrink-0 mx-auto sm:mx-0">
                            {teacher.user.image ? (
                                <div className="relative">
                                    <img src={teacher.user.image} alt={teacher.user.name || 'Teacher'} className="w-32 h-32 md:w-36 md:h-36 object-cover rounded-xl md:rounded-2xl border-2 md:border-4 border-blue-300 dark:border-blue-500 shadow-xl" />
                                    <div className="absolute -top-2 -right-2 bg-blue-400 rounded-full p-1 md:p-2 shadow-lg">
                                        <span className="text-xl md:text-2xl">⭐</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    <div className="w-32 h-32 md:w-36 md:h-36 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl md:rounded-2xl border-2 md:border-4 border-blue-300 dark:border-blue-500 flex items-center justify-center shadow-xl">
                                        <span className="text-5xl md:text-6xl font-bold text-white drop-shadow-lg">
                                            {(teacher.user.name || 'T').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="absolute -top-2 -right-2 bg-blue-400 rounded-full p-1 md:p-2 shadow-lg">
                                        <span className="text-xl md:text-2xl">⭐</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div className="bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 p-3 md:p-4 rounded-xl border-l-4 border-blue-500 shadow-md">
                                    <p className="text-xs text-blue-700 dark:text-blue-400 font-bold mb-1 flex items-center gap-1">
                                        <span>👤</span> Name
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{teacher.user.name}</p>
                                </div>
                                <div className="bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 p-3 md:p-4 rounded-xl border-l-4 border-green-500 shadow-md">
                                    <p className="text-xs text-green-700 dark:text-green-400 font-bold mb-1 flex items-center gap-1">
                                        <span>🆔</span> Employee ID
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{teacher.employeeId}</p>
                                </div>
                                <div className="bg-gradient-to-br from-teal-100 to-cyan-100 dark:from-teal-900/30 dark:to-cyan-900/30 p-3 md:p-4 rounded-xl border-l-4 border-teal-500 shadow-md">
                                    <p className="text-xs text-teal-700 dark:text-teal-400 font-bold mb-1 flex items-center gap-1">
                                        <span>📞</span> Phone
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{teacher.user.phone || 'N/A'}</p>
                                </div>
                                <div className="bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 p-3 md:p-4 rounded-xl border-l-4 border-violet-500 shadow-md">
                                    <p className="text-xs text-violet-700 dark:text-violet-400 font-bold mb-1 flex items-center gap-1">
                                        <span>📧</span> Email
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white truncate">{teacher.user.email}</p>
                                </div>
                                <div className="col-span-1 sm:col-span-2 bg-gradient-to-br from-rose-100 to-red-100 dark:from-rose-900/30 dark:to-red-900/30 p-3 md:p-4 rounded-xl border-l-4 border-rose-500 shadow-md">
                                    <p className="text-xs text-rose-700 dark:text-rose-400 font-bold mb-1 flex items-center gap-1">
                                        <span>🏠</span> Address
                                    </p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{teacher.address || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Subjects Teaching */}
                    {teacher.subjects.length > 0 && (
                        <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-blue-200 dark:border-blue-700">
                            <h3 className="text-sm md:text-base font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                                <span className="text-xl md:text-2xl">📚</span>
                                Subjects Teaching
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                                {teacher.subjects.map((subject: any) => (
                                    <div key={subject.id} className="bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 px-3 md:px-4 py-2 md:py-3 rounded-lg border border-indigo-300 dark:border-indigo-700 shadow-sm">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{subject.name}</p>
                                        {subject.class && (
                                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                                Class {subject.class.name}-{subject.class.section}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Printable ID Card - Canva-inspired Design */}
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
                            <linearGradient id="teacherHeaderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#4c1d95', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#8b5cf6', stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>
                        <path d="M0,0 L500,0 L500,150 Q250,200 0,150 Z" fill="url(#teacherHeaderGrad)" />
                        <path d="M0,0 L500,0 L500,120 Q350,180 0,120 Z" fill="white" fillOpacity="0.1" />
                    </svg>

                    {/* Header Content */}
                    <div className="relative z-10 pt-4 px-4 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-1">
                            {schoolSettings?.logoUrl ? (
                                <img src={schoolSettings.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
                            ) : (
                                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-purple-900">SM</span>
                                </div>
                            )}
                            <h1 className="text-white font-bold text-[13px] tracking-tight uppercase leading-none drop-shadow-sm truncate max-w-[200px]">
                                {schoolSettings?.schoolName || 'SUCCESS MISSION SCHOOL'}
                            </h1>
                        </div>
                        <p className="text-white/80 text-[7px] uppercase tracking-wider font-medium text-center line-clamp-1 h-3 flex items-center">
                            {schoolSettings?.address || school?.address || 'School Address Not Configured'}
                        </p>
                    </div>

                    {/* Academic Year Badge */}
                    <div className="absolute top-3 right-4 z-20">
                        <span className="text-white/90 font-bold text-[9px] drop-shadow-sm">
                            {academicYear}-{nextYear % 100}
                        </span>
                    </div>
                </div>

                {/* 2. Photo Section - Centered & Overlapping */}
                <div className="relative -mt-16 flex justify-center z-30">
                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {teacher.user.image ? (
                            <img src={teacher.user.image} alt="Teacher" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-purple-100 text-purple-600 font-bold text-4xl">
                                {teacher.user.name?.charAt(0) || 'T'}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Name & Role */}
                <div className="text-center pt-3 pb-2 px-4 flex-shrink-0">
                    <h2 className="text-slate-900 font-extrabold text-lg uppercase tracking-tight leading-tight">
                        {teacher.user.name}
                    </h2>
                    <p className="text-purple-600 font-bold text-[10px] uppercase tracking-widest mt-0.5">
                        {teacher.designation || 'TEACHER'}
                    </p>
                </div>

                {/* 4. Details Section - Canva Style */}
                <div className="px-8 py-2 flex-grow overflow-hidden">
                    <div className="space-y-2 text-slate-800">
                        <div className="flex items-start text-[10px]">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-wider">EMP No</span>
                            <span className="mr-2 font-bold">:</span>
                            <span className="font-bold flex-1">{teacher.employeeId}</span>
                        </div>
                        <div className="flex items-start text-[10px]">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-wider">EMAIL</span>
                            <span className="mr-2 font-bold">:</span>
                            <span className="font-bold flex-1 truncate">{teacher.user.email}</span>
                        </div>
                        <div className="flex items-start text-[10px]">
                            <span className="w-24 font-bold text-slate-500 uppercase tracking-wider">ADDRESS</span>
                            <span className="mr-2 font-bold">:</span>
                            <span className="font-medium flex-1 line-clamp-2 leading-[1.2]">
                                {teacher.address || 'N/A'}
                            </span>
                        </div>

                        <div className="mt-4 pt-2 border-t border-slate-100">
                            <div className="flex items-start text-[10px]">
                                <span className="w-24 font-bold text-slate-500 uppercase tracking-wider leading-[1.2]">Contact Number</span>
                                <span className="mr-2 font-bold">:</span>
                                <span className="font-bold flex-1 text-purple-700">{teacher.phone || teacher.user.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Wavy Footer Section with QR Code */}
                <div className="h-32 relative mt-auto flex-shrink-0">
                    <svg viewBox="0 0 500 200" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-full rotate-180">
                        <path d="M0,0 L500,0 L500,150 Q250,200 0,150 Z" fill="#4c1d95" />
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="bg-white p-1 rounded-lg border-2 border-slate-200 shadow-sm z-10">
                            <img src={qrCodeUrl} alt="QR Code" className="w-20 h-20" style={{ imageRendering: 'pixelated' }} />
                        </div>
                    </div>

                    <div className="absolute bottom-2 left-0 w-full text-center z-10">
                        <p className="text-[6px] text-white/60 font-medium tracking-tight">
                            Faculty Card | {schoolSettings?.schoolName || 'SUCCESS MISSION SCHOOL'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
