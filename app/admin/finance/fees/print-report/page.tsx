import React from 'react';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { Phone, Mail, FileText } from 'lucide-react';

export default async function PrintReportPage({
    searchParams
}: {
    searchParams: Promise<{ period?: string }>
}) {
    const { period = 'thisMonth' } = await searchParams;

    // Date Logic
    const now = new Date();
    let startDate: Date, endDate: Date;
    let title = '';

    switch (period) {
        case 'thisWeek':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startDate = new Date(startOfWeek.setHours(0, 0, 0, 0));
            endDate = new Date();
            title = 'Weekly Fee Collection Report';
            break;
        case 'thisMonth':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date();
            title = `Monthly Fee Collection Report - ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
            break;
        case 'thisYear':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date();
            title = `Yearly Fee Collection Report - ${now.getFullYear()}`;
            break;
        default: // Today/Custom
            startDate = new Date(now.setHours(0, 0, 0, 0));
            endDate = new Date(now.setHours(23, 59, 59, 999));
            title = 'Daily Fee Collection Report';
    }

    // Fetch Data
    const [schoolInfo, payments] = await Promise.all([
        prisma.schoolSettings.findFirst(),
        prisma.feePayment.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                status: 'COMPLETED'
            },
            include: {
                studentFee: {
                    include: {
                        student: {
                            include: {
                                user: true,
                                class: true
                            }
                        },
                        feeStructure: true
                    }
                }
            },
            orderBy: { date: 'desc' }
        })
    ]);

    // Aggregate Stats
    const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);
    const byMode: Record<string, number> = {};
    payments.forEach(p => {
        byMode[p.method] = (byMode[p.method] || 0) + p.amount;
    });

    return (
        <div className="bg-white min-h-screen p-8 print:p-0 text-slate-900">
            <style>{`
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    nav, aside, header, .no-print { display: none !important; }
                    main { margin: 0 !important; padding: 0 !important; }
                }
            `}</style>

            {/* Header */}
            <div className="border-b-2 border-black pb-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                        {schoolInfo?.logoUrl ? (
                            <Image src={schoolInfo.logoUrl} alt="Logo" width={80} height={80} className="object-contain" />
                        ) : (
                            <div className="w-20 h-20 bg-gray-200 flex items-center justify-center font-bold text-xl">
                                {schoolInfo?.schoolName?.charAt(0) || 'S'}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 text-center">
                        <h1 className="text-2xl font-bold uppercase">{schoolInfo?.schoolName || 'School Name'}</h1>
                        <p className="text-sm">{schoolInfo?.address}</p>
                        <div className="flex justify-center gap-4 text-sm mt-1">
                            {schoolInfo?.contactNumber && <span>PH: {schoolInfo.contactNumber}</span>}
                            {schoolInfo?.email && <span>Email: {schoolInfo.email}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Title */}
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold underline decoration-2 underline-offset-4">{title}</h2>
                <p className="text-sm text-slate-600 mt-1">
                    Period: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                </p>
            </div>

            {/* Summary Box */}
            <div className="border border-black p-4 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 print:bg-gray-100">
                <div>
                    <p className="text-xs uppercase font-bold text-gray-500">Total Collected</p>
                    <p className="text-lg font-bold">₹{totalCollected.toLocaleString()}</p>
                </div>
                <div>
                    <p className="text-xs uppercase font-bold text-gray-500">Transactions</p>
                    <p className="text-lg font-bold">{payments.length}</p>
                </div>
                {Object.entries(byMode).map(([mode, amount]) => (
                    <div key={mode}>
                        <p className="text-xs uppercase font-bold text-gray-500">{mode}</p>
                        <p className="text-lg font-medium">₹{amount.toLocaleString()}</p>
                    </div>
                ))}
            </div>

            {/* Transactions Table */}
            <table className="w-full text-sm border-collapse border border-black mb-6">
                <thead>
                    <tr className="bg-gray-200 print:bg-gray-300">
                        <th className="border border-black p-2 text-left">Date & Time</th>
                        <th className="border border-black p-2 text-left">Rcpt No</th>
                        <th className="border border-black p-2 text-left">Student</th>
                        <th className="border border-black p-2 text-left">Class</th>
                        <th className="border border-black p-2 text-left">Fee Head</th>
                        <th className="border border-black p-2 text-left">Mode</th>
                        <th className="border border-black p-2 text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {payments.map((p) => (
                        <tr key={p.id} className="print:break-inside-avoid">
                            <td className="border border-black p-2">
                                {new Date(p.date).toLocaleString('en-IN', {
                                    day: '2-digit', month: '2-digit',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </td>
                            <td className="border border-black p-2 font-mono text-xs">
                                {p.consolidatedReceiptNo || p.receiptNo || '-'}
                            </td>
                            <td className="border border-black p-2">
                                {p.studentFee?.student?.user?.name || 'Unknown'}
                                <br /><span className="text-xs text-gray-500">{p.studentFee?.student?.admissionNo || 'N/A'}</span>
                            </td>
                            <td className="border border-black p-2">
                                {p.studentFee?.student?.class?.name || 'N/A'}-{p.studentFee?.student?.class?.section || ''}
                            </td>
                            <td className="border border-black p-2">
                                {p.studentFee?.feeStructure?.name || 'Unknown Fee'}
                            </td>
                            <td className="border border-black p-2 capitalize">{p.method}</td>
                            <td className="border border-black p-2 text-right font-bold">
                                ₹{p.amount.toLocaleString()}
                            </td>
                        </tr>
                    ))}
                    {payments.length === 0 && (
                        <tr>
                            <td colSpan={7} className="border border-black p-4 text-center italic text-gray-500">
                                No records found for this period.
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-200 print:bg-gray-300 font-bold">
                        <td colSpan={6} className="border border-black p-2 text-right">Grand Total</td>
                        <td className="border border-black p-2 text-right">₹{totalCollected.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer */}
            <div className="mt-8 pt-8 border-t border-dashed border-gray-400 flex justify-between text-xs text-gray-500">
                <p>Generated on {new Date().toLocaleString()}</p>
                <div className="text-center">
                    <p className="mb-8 font-bold">Authorized Signatory</p>
                    <p>(Accountant / Admin)</p>
                </div>
            </div>

            <div className="no-print fixed bottom-8 right-8">
                <button
                    className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg font-bold print-btn"
                >
                    Print Report
                </button>
            </div>
            <script dangerouslySetInnerHTML={{
                __html: `
                document.querySelector('.print-btn').addEventListener('click', () => window.print());
            `}} />
        </div>
    );
}
