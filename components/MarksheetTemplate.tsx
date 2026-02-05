'use client';

import React from 'react';
import { School } from 'lucide-react';

interface MarksheetTemplateProps {
    student: {
        name: string;
        rollNo: string;
        admissionNo: string;
        fatherName?: string;
        class: {
            name: string;
            section: string;
        };
        profileImage: string | null;
        dateOfBirth?: Date | string | null;
    };
    examGroup: {
        name: string;
        academicYear: string;
    };
    results: Array<{
        subject: {
            name: string;
            code?: string;
        };
        maxMarks: number;
        marksObtained: number;
        grade: string | null;
        remarks: string | null;
    }>;
    summary: {
        totalMax: number;
        totalObtained: number;
        percentage: number;
        division: string | null;
        result: 'PASS' | 'FAIL';
    };
    schoolSettings?: {
        schoolName: string | null;
        logoUrl: string | null;
        watermarkUrl: string | null;
        address: string | null;
        city: string | null;
        state: string | null;
        pincode: string | null;
        contactNumber: string | null;
        email: string | null;
        affiliationNumber: string | null;
        affiliatedTo: string | null;
        gradingSystem?: any[];
    } | null;
}

export default function MarksheetTemplate({ student, examGroup, results, summary, schoolSettings }: MarksheetTemplateProps) {
    // Helper for grade colors
    const getGradeColor = (grade: string | null) => {
        if (!grade) return 'text-slate-700';
        if (['A+', 'A', 'O'].includes(grade)) return 'text-emerald-700 font-bold';
        if (['B+', 'B', 'C'].includes(grade)) return 'text-indigo-700 font-semibold';
        if (['D', 'E'].includes(grade)) return 'text-amber-600';
        if (['F'].includes(grade)) return 'text-rose-600 font-bold';
        return 'text-slate-700';
    };

    return (
        <div id="marksheet" className="max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none overflow-hidden relative font-sans text-slate-800">
            {/* Decorative Top Border */}
            <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 print:block"></div>

            <div className="p-6 relative h-[296mm] flex flex-col justify-between">

                {/* Content Wrapper */}
                <div className="flex-1 flex flex-col">

                    {/* Watermark */}
                    {schoolSettings?.watermarkUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
                            <img src={schoolSettings.watermarkUrl} alt="Watermark" className="w-[400px] h-[400px] object-contain grayscale" />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none z-0">
                            <School className="w-80 h-80 text-indigo-900" />
                        </div>
                    )}

                    {/* Header Section - Compact */}
                    <div className="relative z-10 border-b border-indigo-100 pb-4 mb-4 flex items-center gap-5">
                        {schoolSettings?.logoUrl ? (
                            <img src={schoolSettings.logoUrl} alt="School Logo" className="w-20 h-20 object-contain ml-2" />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-700 to-purple-800 rounded-lg flex items-center justify-center text-white shadow-md ml-2">
                                <School className="w-8 h-8" />
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 uppercase tracking-tight mb-1 leading-none">
                                {schoolSettings?.schoolName || 'SCHOOL NAME'}
                            </h1>
                            <div className="text-xs text-slate-500 font-medium space-y-0.5">
                                {schoolSettings?.address && <p>{schoolSettings.address}</p>}
                                <p className="flex gap-3">
                                    {schoolSettings?.contactNumber && <span>📞 {schoolSettings.contactNumber}</span>}
                                    {schoolSettings?.email && <span>✉️ {schoolSettings.email}</span>}
                                    {schoolSettings?.affiliationNumber && <span>📜 Aff No: {schoolSettings.affiliationNumber}</span>}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-lg text-center">
                                <h2 className="text-sm font-bold text-indigo-900 uppercase tracking-widest leading-tight">Report Card</h2>
                                <p className="text-[10px] font-bold text-indigo-500 uppercase mt-0.5">{examGroup.academicYear}</p>
                            </div>
                        </div>
                    </div>

                    {/* Student Info - Compact Grid with Photo */}
                    <div className="relative z-10 mb-4 bg-indigo-50/40 rounded-xl border border-indigo-100 p-4 flex gap-6 items-center">
                        {/* Student Photo */}
                        <div className="flex-shrink-0 w-24 h-32 bg-white border-2 border-slate-200 rounded-lg shadow-sm overflow-hidden flex items-center justify-center relative">
                            {student.profileImage ? (
                                <img src={student.profileImage} alt="Student" className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-center p-2 opacity-50">
                                    <span className="text-3xl block mb-1">👤</span>
                                    <span className="text-[9px] uppercase font-bold text-slate-400">Photo</span>
                                </div>
                            )}
                        </div>

                        {/* Details Grid */}
                        <div className="flex-1 grid grid-cols-[auto_1fr_auto_1fr] gap-x-4 gap-y-2 text-sm items-center">
                            <span className="text-xs font-bold text-indigo-400 uppercase">Student Name</span>
                            <span className="font-bold text-slate-900 text-lg">{student.name}</span>

                            <span className="text-xs font-bold text-indigo-400 uppercase">Class/Roll No</span>
                            <span className="font-semibold text-slate-900">{student.class.name}-{student.class.section} / {student.rollNo || 'N/A'}</span>

                            <span className="text-xs font-bold text-indigo-400 uppercase">Father's Name</span>
                            <span className="font-semibold text-slate-900">{student.fatherName || 'N/A'}</span>

                            <span className="text-xs font-bold text-indigo-400 uppercase">Admission No</span>
                            <span className="font-semibold text-slate-900">{student.admissionNo}</span>

                            <span className="text-xs font-bold text-indigo-400 uppercase">Date of Birth</span>
                            <span className="font-semibold text-slate-900">
                                {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    {/* Exam Title */}
                    <div className="relative z-10 text-center mb-4">
                        <span className="inline-block border-b-2 border-indigo-200 text-lg font-bold text-indigo-900 px-6 pb-1">
                            {examGroup.name}
                        </span>
                    </div>

                    {/* Marks Table - Compact */}
                    <div className="relative z-10 mb-4">
                        <table className="w-full text-sm border-separate border-spacing-0 rounded-lg overflow-hidden border border-slate-200">
                            <thead className="bg-slate-800 text-white text-xs uppercase">
                                <tr>
                                    <th className="p-2 text-left font-bold w-[35%]">Subject</th>
                                    <th className="p-2 text-center font-bold w-[12%]">Max</th>
                                    <th className="p-2 text-center font-bold w-[12%]">Obt</th>
                                    <th className="p-2 text-center font-bold w-[12%]">Grade</th>
                                    <th className="p-2 text-left font-bold w-[29%]">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {results.map((res, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                        <td className="p-2 font-semibold text-slate-800 border-r border-slate-100">
                                            {res.subject.name}
                                        </td>
                                        <td className="p-2 text-center text-slate-500 border-r border-slate-100">{res.maxMarks}</td>
                                        <td className="p-2 text-center font-bold text-slate-900 border-r border-slate-100 text-sm">{res.marksObtained}</td>
                                        <td className={`p-2 text-center border-r border-slate-100 ${getGradeColor(res.grade)}`}>{res.grade || '-'}</td>
                                        <td className="p-2 text-slate-500 italic truncate max-w-[150px]">{res.remarks || '-'}</td>
                                    </tr>
                                ))}
                                <tr className="bg-indigo-50 border-t border-indigo-200 font-bold">
                                    <td className="p-2 text-right text-indigo-900 uppercase text-xs">Total</td>
                                    <td className="p-2 text-center text-slate-700">{summary.totalMax}</td>
                                    <td className="p-2 text-center text-indigo-900 text-base">{summary.totalObtained}</td>
                                    <td className="p-2 text-center text-indigo-900" colSpan={2}>
                                        {summary.percentage.toFixed(1)}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Grid: Grading & Result */}
                    <div className="relative z-10 grid grid-cols-2 gap-6 mt-auto mb-4">
                        {/* Grading Scale - Compact */}
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-500 text-[10px] uppercase tracking-wider mb-2 border-b pb-1">Grading System</h3>
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                                {schoolSettings?.gradingSystem && schoolSettings.gradingSystem.length > 0 ? (
                                    schoolSettings.gradingSystem.slice(0, 8).map((g: any) => (
                                        <div key={g.id} className="flex justify-between items-center text-[9px] border-b border-slate-50 last:border-0">
                                            <span className={`${getGradeColor(g.grade)}`}>{g.grade}</span>
                                            <span className="text-slate-400">{g.minMarks}-{g.maxMarks}%</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-[9px] text-slate-400">Standard Scale</p>
                                )}
                            </div>
                        </div>

                        {/* Result & Attendance (Placeholder) */}
                        <div className="flex flex-col gap-3">
                            <div className={`flex-1 rounded-lg p-2 flex flex-col items-center justify-center border ${summary.result === 'PASS' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                                <span className="text-[10px] font-bold uppercase text-slate-400">Final Result</span>
                                <span className={`text-2xl font-black ${summary.result === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>{summary.result}</span>
                                <span className="text-xs font-bold text-slate-600 mt-1">{summary.division || ''}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Signatures */}
                <div className="relative z-10 pt-6 mt-2">
                    <div className="flex justify-between items-end px-4 pb-2">
                        <div className="text-center">
                            <div className="h-8 w-24 border-b border-slate-300 mb-1"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Class Teacher</p>
                        </div>
                        <div className="text-center">
                            <div className="h-8 w-24 border-b border-slate-300 mb-1"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Exam Controller</p>
                        </div>
                        <div className="text-center">
                            <div className="h-8 w-24 border-b border-slate-300 mb-1"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Principal</p>
                        </div>
                    </div>
                    {/* Bottom Strip */}
                    <div className="h-1.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 rounded-full mt-2"></div>
                </div>

            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    #marksheet {
                        width: 210mm;
                        height: 296mm;
                        overflow: hidden;
                        padding: 0;
                        box-shadow: none !important;
                        border: none !important;
                    }
                }
            `}</style>
        </div>
    );
}
