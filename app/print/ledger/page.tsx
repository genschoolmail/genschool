import React from 'react';
import { prisma } from '@/lib/prisma';
import { getSchoolInfo } from '@/lib/schoolInfo';

// Type for Unified Transaction
type LedgerTransaction = {
    id: string;
    date: Date;
    description: string;
    category: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    reference?: string | null;
    mode?: string;
};

export default async function LedgerPrintPage({
    searchParams
}: {
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
    }>
}) {
    const { startDate, endDate } = await searchParams;

    // Fetch School Info
    const schoolInfo = await getSchoolInfo();

    // Date Filters
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date();

    // Fetch Income
    const incomes = await prisma.income.findMany({
        where: { date: { gte: start, lte: end } },
        include: { feePayment: true }
    });

    // Fetch Expenses
    const expenses = await prisma.expense.findMany({
        where: { date: { gte: start, lte: end } },
        include: { salary: true }
    });

    // Merge and Sort
    const transactions: LedgerTransaction[] = [
        ...incomes.map(i => ({
            id: i.id,
            date: i.date,
            description: i.description,
            category: i.source,
            type: 'CREDIT' as const,
            amount: i.amount,
            reference: i.reference,
            mode: i.feePayment?.method || 'N/A',
        })),
        ...expenses.map(e => ({
            id: e.id,
            date: e.date,
            description: e.description,
            category: e.category,
            type: 'DEBIT' as const,
            amount: e.amount,
            reference: null,
            mode: 'N/A',
        }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime());

    // Calculate Stats
    const totalCredit = transactions.filter(t => t.type === 'CREDIT').reduce((sum, t) => sum + t.amount, 0);
    const totalDebit = transactions.filter(t => t.type === 'DEBIT').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalCredit - totalDebit;

    return (
        <div className="p-8 max-w-5xl mx-auto bg-white min-h-screen text-black print:p-0">
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @page { size: A4; margin: 15mm; }
                @media print { 
                    body { -webkit-print-color-adjust: exact; background: white; }
                    .no-print { display: none; }
                }
            `}} />

            {/* Header */}
            <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-wider">{schoolInfo?.schoolName}</h1>
                    <p className="text-sm text-gray-600">{schoolInfo?.address}</p>
                    <p className="text-sm text-gray-600">Ph: {schoolInfo?.phone} | Email: {schoolInfo?.email}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold bg-black text-white px-3 py-1 inline-block">FINANCIAL LEDGER</h2>
                    <p className="text-sm mt-1 font-medium">
                        Period: {start.toLocaleDateString()} - {end.toLocaleDateString()}
                    </p>
                </div>
            </div>

            {/* Summary Box */}
            <div className="flex gap-4 mb-6 text-sm">
                <div className="flex-1 border border-gray-300 p-2 rounded">
                    <p className="text-gray-500 uppercase text-xs font-bold">Total Income</p>
                    <p className="text-lg font-bold text-green-700">₹{totalCredit.toLocaleString()}</p>
                </div>
                <div className="flex-1 border border-gray-300 p-2 rounded">
                    <p className="text-gray-500 uppercase text-xs font-bold">Total Expense</p>
                    <p className="text-lg font-bold text-red-700">₹{totalDebit.toLocaleString()}</p>
                </div>
                <div className="flex-1 border border-gray-300 p-2 rounded bg-gray-50">
                    <p className="text-gray-500 uppercase text-xs font-bold">Net Balance</p>
                    <p className={`text-lg font-bold ${netBalance >= 0 ? 'text-black' : 'text-red-600'}`}>
                        {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Table */}
            <table className="w-full text-left text-sm border-collapse">
                <thead>
                    <tr className="border-b-2 border-black">
                        <th className="py-2 font-bold">Date</th>
                        <th className="py-2 font-bold">Description</th>
                        <th className="py-2 font-bold">Category</th>
                        <th className="py-2 font-bold text-right">Credit</th>
                        <th className="py-2 font-bold text-right">Debit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {transactions.map(t => (
                        <tr key={t.id} className="break-inside-avoid page-break-check">
                            <td className="py-2 align-top">{t.date.toLocaleDateString()}</td>
                            <td className="py-2 align-top">
                                <div className="font-medium">{t.description}</div>
                                {t.reference && <div className="text-xs text-gray-500">Ref: {t.reference}</div>}
                            </td>
                            <td className="py-2 align-top capitalize text-gray-600">
                                {t.category} <span className="text-xs">({t.mode})</span>
                            </td>
                            <td className="py-2 text-right font-medium text-green-700">
                                {t.type === 'CREDIT' ? `₹${t.amount.toLocaleString()}` : '-'}
                            </td>
                            <td className="py-2 text-right font-medium text-red-700">
                                {t.type === 'DEBIT' ? `₹${t.amount.toLocaleString()}` : '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="border-t-2 border-black font-bold">
                        <td colSpan={3} className="py-3 text-right pr-4">Grand Totals</td>
                        <td className="py-3 text-right">₹{totalCredit.toLocaleString()}</td>
                        <td className="py-3 text-right">₹{totalDebit.toLocaleString()}</td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer */}
            <div className="mt-8 text-center text-xs text-gray-400 border-t pt-4">
                <p>Generated on {new Date().toLocaleString()}</p>
            </div>

            {/* Auto Print Script */}
            <script dangerouslySetInnerHTML={{
                __html: `window.onload = function() { window.print(); }`
            }} />
        </div>
    );
}
