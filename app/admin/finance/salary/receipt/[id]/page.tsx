import React from 'react';
import { prisma } from '@/lib/prisma';
import BackButton from '@/components/ui/BackButton';
import { notFound } from 'next/navigation';
import { Download, Phone, MapPin, Mail } from 'lucide-react';
import Image from 'next/image';

import PrintButton from './PrintButton';

// ... existing imports ...

export default async function SalaryReceiptPage({ params }: { params: { id: string } }) {
    // ... setup code ...
    const { id } = await Promise.resolve(params);

    try {
        const salary = await prisma.salary.findUnique({
            where: { id },
            include: {
                teacher: { include: { user: true } },
                driver: { include: { user: true } }
            }
        });

        if (!salary) return <div className="p-10 text-center">Salary record not found.</div>;

        // ... Type casting for safety if needed, but prisma returns typed object
        const record = salary as any;


        const staff = salary.teacher || salary.driver;
        const user = staff?.user;
        const designation = salary.teacher ? (salary.teacher.designation || 'Teacher') : 'Driver';
        const staffId = salary.teacher ? salary.teacher.employeeId : salary.driver?.licenseNo; // Fallback ID

        const schoolInfo = await prisma.schoolSettings.findFirst();

        return (
            <div className="p-6 max-w-3xl mx-auto print:p-0 print:max-w-none print:m-0">
                <style>{`
                 @media print {
                     body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background: white !important; }
                     header, nav, aside, .no-print, .sidebar, #sidebar { display: none !important; }
                     main { margin: 0 !important; padding: 0 !important; width: 100% !important; }
                     .print-visible { display: block !important; }
                 }
             `}</style>

                {/* Action Bar */}
                <div className="no-print mb-6 flex justify-between items-center">
                    <BackButton href="/admin/finance/salary" />
                    <PrintButton />
                </div>

                {/* Receipt Card */}
                <div className="bg-white border border-slate-300 rounded-xl overflow-hidden print:border-2 print:border-black print:rounded-none">

                    {/* Header */}
                    <div className="p-6 border-b border-slate-200 print:border-black flex justify-between items-start">
                        <div className="flex gap-4">
                            {schoolInfo?.logoUrl && (
                                <img src={schoolInfo.logoUrl} alt="Logo" className="w-20 h-20 object-contain" />
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">
                                    {schoolInfo?.schoolName || 'School Name'}
                                </h1>
                                <p className="text-sm text-slate-600 max-w-sm mt-1">
                                    {schoolInfo?.address || 'Address Line 1'}
                                </p>
                                <div className="flex gap-3 mt-2 text-xs text-slate-500">
                                    {schoolInfo?.contactNumber && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {schoolInfo.contactNumber}</span>}
                                    {schoolInfo?.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {schoolInfo.email}</span>}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="inline-block px-3 py-1 border-2 border-indigo-600 text-indigo-600 font-bold text-sm uppercase rounded print:border-black print:text-black">
                                Salary Slip
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Slip / Receipt No.</p>
                            <p className="font-mono font-bold text-lg">{salary.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                    </div>

                    {/* Staff Details */}
                    <div className="p-6 grid grid-cols-2 gap-6 bg-slate-50 print:bg-white border-b border-slate-200 print:border-black">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Employee Name</p>
                            <p className="font-bold text-slate-900 text-lg">{user?.name}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Month / Year</p>
                            <p className="font-bold text-slate-900 text-lg">
                                {salary.month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-semibold">Designation</p>
                            <p className="font-medium text-slate-800">{designation}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 uppercase font-semibold">Payment Date</p>
                            <p className="font-medium text-slate-800">
                                {salary.createdAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Earnings & Deductions Table */}
                    <div className="p-6">
                        <div className="border border-slate-200 rounded-lg overflow-hidden print:border-black">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 print:bg-gray-100 border-b border-slate-200 print:border-black text-slate-700 font-semibold">
                                    <tr>
                                        <th className="px-4 py-2 text-left w-1/2 border-r border-slate-200 print:border-black">Earnings</th>
                                        <th className="px-4 py-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 print:divide-slate-300">
                                    <tr>
                                        <td className="px-4 py-3 text-slate-600 border-r border-slate-100">Basic Salary</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-900">₹{salary.basicSalary.toLocaleString()}</td>
                                    </tr>
                                    {salary.allowances > 0 && (
                                        <tr>
                                            <td className="px-4 py-3 text-slate-600 border-r border-slate-100">Allowances</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900">₹{salary.allowances.toLocaleString()}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {(salary.deductions > 0) && (
                            <div className="border border-slate-200 rounded-lg overflow-hidden print:border-black mt-4">
                                <table className="w-full text-sm">
                                    <thead className="bg-red-50 print:bg-gray-100 border-b border-red-100 print:border-black text-red-700 font-semibold">
                                        <tr>
                                            <th className="px-4 py-2 text-left w-1/2 border-r border-red-100 print:border-black">Deductions</th>
                                            <th className="px-4 py-2 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="px-4 py-3 text-slate-600 border-r border-slate-100">Total Deductions</td>
                                            <td className="px-4 py-3 text-right font-medium text-red-600">- ₹{salary.deductions.toLocaleString()}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Net Pay */}
                    <div className="bg-indigo-50 print:bg-gray-200 p-6 flex justify-between items-center border-t border-indigo-100 print:border-black">
                        <div>
                            <p className="text-xs uppercase font-bold text-indigo-800 print:text-black tracking-wide">Net Salary Payable</p>
                            <p className="text-xs text-indigo-600 print:text-black italic mt-1">In words: {numberToWords(Math.floor(salary.netSalary))}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-indigo-700 print:text-black">
                                ₹{salary.netSalary.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-8 mt-4 flex justify-between text-xs text-slate-500 pt-12">
                        <div className="text-center w-40 border-t border-slate-300 pt-2">
                            Employee Signature
                        </div>
                        <div className="text-center w-40 border-t border-slate-300 pt-2">
                            Authorized Signature
                        </div>
                    </div>
                </div>

            </div>
        );
    } catch (error: any) {
        return (
            <div className="p-8 text-center text-red-600">
                <h3 className="text-lg font-bold">Error Loading Receipt</h3>
                <p className="text-sm">{error?.message || 'Unknown error'}</p>
                <div className="mt-4 p-4 bg-slate-100 rounded text-xs text-left overflow-auto max-w-2xl mx-auto">
                    {JSON.stringify(error, null, 2)}
                </div>
                <BackButton href="/admin/finance/salary" />
            </div>
        );
    }
}

function PrintScript() {
    'use client';
    return (
        <script dangerouslySetInnerHTML={{
            __html: `
            if (document.querySelector("button span")) {
                document.querySelector("button span").addEventListener("click", () => window.print());
            }
        `}} />
    );
}

// Simple Helper for Number to Words (Simplified)
function numberToWords(amount: number) {
    // Ideally use a library, but for now placeholder
    return "Rupees " + amount + " Only";
}
