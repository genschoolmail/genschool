'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { School, Calendar, Clock, MapPin } from 'lucide-react';
import type { AdmitCardData, ExamScheduleData } from '@/types/exam';

interface AdmitCardTemplateProps {
    admitCard: AdmitCardData;
    schedules: ExamScheduleData[];
    schoolSettings?: {
        schoolName: string | null;
        logoUrl: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        contactNumber: string | null;
        email: string | null;
    } | null;
    emergencyContact?: {
        name: string;
        phone: string;
    } | null;
}

const format12Hour = (time24: string) => {
    if (!time24) return 'N/A';
    try {
        const [hours, minutes] = time24.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const hours12 = hours % 12 || 12;
        return `${hours12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
        return time24;
    }
};

export default function AdmitCardTemplate({ admitCard, schedules, schoolSettings, emergencyContact }: AdmitCardTemplateProps) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/admit-card/${admitCard.id}`;

    return (
        <div id="admit-card" className="max-w-[210mm] mx-auto bg-white p-8 shadow-xl print:shadow-none print:p-0">
            {/* Border Container */}
            <div className="border-4 border-double border-slate-800 p-6 print:p-4 h-full relative">

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                    <School className="w-96 h-96" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                        {schoolSettings?.logoUrl ? (
                            <img src={schoolSettings.logoUrl} alt="School Logo" className="w-20 h-20 object-contain" />
                        ) : (
                            <div className="w-20 h-20 bg-indigo-900 rounded-full flex items-center justify-center text-white">
                                <School className="w-10 h-10" />
                            </div>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">
                                {schoolSettings?.schoolName || 'SCHOOL NAME'}
                            </h1>
                            <p className="text-sm text-slate-600 font-medium">
                                {schoolSettings?.contactNumber && `Ph: ${schoolSettings.contactNumber}`}
                                {schoolSettings?.contactNumber && schoolSettings?.email && ' | '}
                                {schoolSettings?.email && `Email: ${schoolSettings.email}`}
                            </p>
                            <p className="text-xs text-slate-500">
                                {[schoolSettings?.address, schoolSettings?.city, schoolSettings?.state, schoolSettings?.pincode]
                                    .filter(Boolean).join(', ') || '123 School Street, Education City'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-xl font-bold text-indigo-900 uppercase">Admit Card</h2>
                        <p className="text-md font-semibold text-slate-700">{admitCard.examGroup.name}</p>
                        <p className="text-sm text-slate-600">Session: {admitCard.examGroup.academicYear}</p>
                    </div>
                </div>

                {/* Student Details & Photo */}
                <div className="flex gap-6 mb-8 relative z-10">
                    {/* Details */}
                    <div className="flex-1 grid grid-cols-2 gap-y-3 text-sm">
                        <div className="col-span-2 bg-slate-100 p-2 font-bold text-slate-800 uppercase tracking-wide mb-2">
                            Student Information
                        </div>

                        <div className="flex flex-col">
                            <span className="text-slate-500 text-xs uppercase">Student Name</span>
                            <span className="font-bold text-slate-900 text-lg">{admitCard.student.name}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-xs uppercase">Admission No.</span>
                            <span className="font-semibold text-slate-900">{admitCard.student.admissionNo}</span>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-slate-500 text-xs uppercase">Class & Section</span>
                            <span className="font-semibold text-slate-900">{admitCard.student.class.name} - {admitCard.student.class.section}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-slate-500 text-xs uppercase">Roll Number</span>
                            <span className="font-semibold text-slate-900">{admitCard.student.rollNo || 'N/A'}</span>
                        </div>
                    </div>

                    {/* Photo & QR */}
                    <div className="w-32 flex flex-col gap-2">
                        <div className="w-32 h-40 bg-slate-100 border-2 border-slate-300 flex items-center justify-center overflow-hidden">
                            {admitCard.student.profileImage ? (
                                <img
                                    src={admitCard.student.profileImage}
                                    alt="Student"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-xs text-slate-400 text-center px-2">Passport Size Photo</span>
                            )}
                        </div>
                        <div className="border border-slate-200 p-1 bg-white">
                            <QRCodeSVG value={verificationUrl} size={118} />
                        </div>
                    </div>
                </div>

                {/* Exam Schedule Table */}
                <div className="mb-8 relative z-10">
                    <div className="bg-slate-100 p-2 font-bold text-slate-800 uppercase tracking-wide mb-2">
                        Examination Schedule
                    </div>
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b-2 border-slate-300">
                                <th className="py-2 px-3 text-left font-semibold text-slate-700 w-1/4">Subject</th>
                                <th className="py-2 px-3 text-left font-semibold text-slate-700">Date</th>
                                <th className="py-2 px-3 text-left font-semibold text-slate-700">Time</th>
                                <th className="py-2 px-3 text-left font-semibold text-slate-700">Shift</th>
                                <th className="py-2 px-3 text-left font-semibold text-slate-700">Duration</th>
                                <th className="py-2 px-3 text-left font-semibold text-slate-700">Invigilator Sign</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map((schedule, index) => (
                                <tr key={index} className="border-b border-slate-200">
                                    <td className="py-3 px-3 font-medium text-slate-900">
                                        {schedule.subject.name}
                                        {schedule.subject.code && <span className="text-slate-500 text-xs ml-2">({schedule.subject.code})</span>}
                                    </td>
                                    <td className="py-3 px-3 text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3 text-slate-400" />
                                            {new Date(schedule.examDate).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            {format12Hour(schedule.startTime)}
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-slate-700 font-medium whitespace-nowrap">
                                        {schedule.shift || '1st Shift'}
                                    </td>
                                    <td className="py-3 px-3 text-slate-700">{schedule.duration} mins</td>
                                    <td className="py-3 px-3 border-l border-dashed border-slate-300"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Instructions */}
                <div className="mt-auto relative z-10">
                    {emergencyContact && (
                        <div className="bg-yellow-50 border-2 border-yellow-400 rounded px-3 py-2 mb-3 text-center">
                            <p className="text-sm font-bold text-yellow-900">
                                Emergency Contact: {emergencyContact.name} - {emergencyContact.phone}
                            </p>
                        </div>
                    )}
                    <div className="border-t-2 border-slate-800 pt-4 flex justify-between items-end">
                        <div className="text-xs text-slate-500 max-w-md">
                            <p className="font-bold text-slate-700 mb-1 uppercase">Important Instructions:</p>
                            <ul className="list-disc list-inside space-y-0.5">
                                <li>Carry this admit card to the exam hall.</li>
                                <li>Report 15 minutes before scheduled time.</li>
                                <li>Electronic gadgets are strictly prohibited.</li>
                            </ul>
                        </div>
                        <div className="flex gap-8">
                            <div className="text-center">
                                <div className="h-12 w-32 border-b border-slate-400 mb-1"></div>
                                <p className="text-xs font-bold text-slate-700 uppercase">Class Teacher</p>
                            </div>
                            <div className="text-center">
                                <div className="h-12 w-32 border-b border-slate-400 mb-1"></div>
                                <p className="text-xs font-bold text-slate-700 uppercase">Principal</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    #admit-card {
                        width: 210mm;
                        min-height: 297mm;
                        padding: 10mm;
                        box-shadow: none;
                    }
                }
            `}</style>
        </div>
    );
}
