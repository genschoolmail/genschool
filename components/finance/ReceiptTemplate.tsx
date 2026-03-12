import Image from 'next/image';
import { CheckCircle, AlertTriangle, CreditCard, Phone, Mail } from 'lucide-react';

interface ReceiptTemplateProps {
    schoolInfo: any;
    primaryPayment: any;
    payments: any[];
    student: any;
    totals: {
        totalBase: number;
        totalDiscount: number;
        totalTax: number;
        totalPreviousDebt: number;
        grandTotal: number;
        totalPaid: number;
        totalOutstanding: number;
        advanceAmount?: number;
        walletBalance?: number;
    };
    monthNames: string[];
}

export default function ReceiptTemplate({
    schoolInfo,
    primaryPayment,
    payments,
    student,
    totals,
    monthNames
}: ReceiptTemplateProps) {
    const { totalOutstanding, totalTax, totalPreviousDebt, grandTotal, totalPaid, totalDiscount, advanceAmount } = totals;
    const isPaid = totalOutstanding <= 0;
    const receiptNumber = primaryPayment.consolidatedReceiptNo || primaryPayment.receiptNo || primaryPayment.id?.slice(0, 12).toUpperCase();

    return (
        <div className="receipt-container bg-white text-slate-900 rounded-xl shadow-lg overflow-hidden border border-slate-200 print:shadow-none print:border-none print:rounded-none">

            {/* ── TOP HEADER ─────────────────────────────────────── */}
            <div className="print-header bg-gradient-to-r from-indigo-700 to-purple-700 text-white px-5 py-4 sm:px-8 sm:py-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {schoolInfo?.logoUrl ? (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-xl overflow-hidden p-0.5 shadow-lg">
                                <Image
                                    src={schoolInfo.logoUrl}
                                    alt="School Logo"
                                    width={64}
                                    height={64}
                                    className="w-full h-full object-contain rounded-lg"
                                />
                            </div>
                        ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white/20 rounded-xl flex items-center justify-center text-2xl font-black">
                                {schoolInfo?.schoolName?.charAt(0) || 'S'}
                            </div>
                        )}
                    </div>

                    {/* School Info */}
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg sm:text-xl font-black leading-tight truncate">
                            {schoolInfo?.schoolName || 'School Name'}
                        </h1>
                        {schoolInfo?.address && (
                            <p className="text-xs sm:text-sm opacity-80 font-medium mt-0.5 line-clamp-2">
                                {schoolInfo.address}
                            </p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1.5">
                            {schoolInfo?.contactNumber && (
                                <span className="flex items-center gap-1 text-xs opacity-80">
                                    <Phone className="w-3 h-3" />{schoolInfo.contactNumber}
                                </span>
                            )}
                            {schoolInfo?.email && (
                                <span className="flex items-center gap-1 text-xs opacity-80">
                                    <Mail className="w-3 h-3" />{schoolInfo.email}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Receipt Badge */}
                    <div className="flex-shrink-0 text-right">
                        <div className="inline-block bg-white/15 border border-white/30 rounded-lg px-3 py-1.5">
                            <p className="text-[9px] font-black uppercase tracking-widest opacity-75">Fee Receipt</p>
                            <p className="text-xs font-black font-mono">{receiptNumber}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── RECEIPT META ───────────────────────────────────── */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 sm:px-8">
                <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-600">
                    <div>
                        <span className="font-semibold text-slate-400 uppercase tracking-wider mr-1.5">Date:</span>
                        <span className="font-semibold text-slate-800" suppressHydrationWarning>
                            {new Date(primaryPayment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-400 uppercase tracking-wider mr-1.5">Method:</span>
                        <span className="font-semibold text-slate-800">{primaryPayment.method || primaryPayment.paymentMethod || 'N/A'}</span>
                    </div>
                    <div>
                        <span className="font-semibold text-slate-400 uppercase tracking-wider mr-1.5">Status:</span>
                        <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {isPaid ? 'PAID' : 'PARTIAL'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="px-5 py-4 sm:px-8 sm:py-5 space-y-4">

                {/* ── STUDENT CARD ───────────────────────────────── */}
                <div className="bg-slate-900 rounded-xl px-4 py-3 sm:px-5 sm:py-4 text-white">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Student Details</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                        <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Name</p>
                            <p className="font-bold text-sm leading-tight">{student?.user?.name || '-'}</p>
                        </div>
                        <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Admission No.</p>
                            <p className="font-bold text-sm font-mono">{student?.admissionNo || '-'}</p>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Class</p>
                            <p className="font-bold text-sm">{student?.class?.name}{student?.class?.section ? ` - ${student.class.section}` : ''}</p>
                        </div>
                    </div>
                </div>

                {/* ── FEE TABLE ──────────────────────────────────── */}
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fee Breakdown</p>
                    <div className="overflow-hidden rounded-xl border border-slate-100">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left">
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-wider">Description</th>
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center hidden sm:table-cell">Period</th>
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Amount</th>
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Discount</th>
                                    <th className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Net</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payments.map((payment, index) => {
                                    const sf = payment.studentFee;
                                    const feeName = sf?.feeStructure?.name || 'Fee';
                                    const feeMonth = (sf as any)?.feeMonth;
                                    const feeYear = (sf as any)?.feeYear;
                                    const monthDisplay = feeMonth ? `${monthNames[feeMonth]} ${feeYear || ''}` : '-';
                                    const baseAmount = sf?.amount || 0;
                                    const discount = sf?.discount || 0;

                                    return (
                                        <tr key={payment.id} className="hover:bg-slate-50/70">
                                            <td className="px-3 py-2.5">
                                                <p className="font-semibold text-slate-800 text-xs leading-tight">{feeName}</p>
                                                <p className="text-[10px] text-slate-400">{sf?.feeStructure?.feeHead?.name}</p>
                                                <p className="text-[10px] text-slate-400 sm:hidden">{monthDisplay}</p>
                                            </td>
                                            <td className="px-3 py-2.5 text-center text-xs text-slate-500 hidden sm:table-cell">{monthDisplay}</td>
                                            <td className="px-3 py-2.5 text-right text-xs font-medium text-slate-600">₹{baseAmount.toLocaleString('en-IN')}</td>
                                            <td className="px-3 py-2.5 text-right text-xs font-medium text-emerald-600">
                                                {discount > 0 ? `-₹${discount.toLocaleString('en-IN')}` : '-'}
                                            </td>
                                            <td className="px-3 py-2.5 text-right text-xs font-bold text-slate-900">₹{(baseAmount - discount).toLocaleString('en-IN')}</td>
                                        </tr>
                                    );
                                })}

                                {totalTax > 0 && (
                                    <tr className="bg-slate-50/60 italic text-slate-500">
                                        <td className="px-3 py-2 text-xs" colSpan={4}>Tax Applied</td>
                                        <td className="px-3 py-2 text-right text-xs font-bold">+₹{totalTax.toLocaleString('en-IN')}</td>
                                    </tr>
                                )}
                                {totalPreviousDebt > 0 && (
                                    <tr className="bg-orange-50/60 text-orange-700">
                                        <td className="px-3 py-2 text-xs" colSpan={4}>Previous Balance</td>
                                        <td className="px-3 py-2 text-right text-xs font-bold">+₹{totalPreviousDebt.toLocaleString('en-IN')}</td>
                                    </tr>
                                )}
                            </tbody>

                            {/* Totals Footer */}
                            <tfoot>
                                <tr className="bg-slate-900 text-white">
                                    <td className="px-3 py-2.5 text-xs font-black uppercase tracking-wider" colSpan={4}>Grand Total</td>
                                    <td className="px-3 py-2.5 text-right text-base font-black">₹{grandTotal.toLocaleString('en-IN')}</td>
                                </tr>
                                <tr className="bg-emerald-600 text-white">
                                    <td className="px-3 py-2 text-xs font-bold uppercase tracking-wider" colSpan={4}>Amount Paid</td>
                                    <td className="px-3 py-2 text-right text-sm font-black">₹{totalPaid.toLocaleString('en-IN')}</td>
                                </tr>
                                {advanceAmount && advanceAmount > 0 && (
                                    <tr className="bg-indigo-600 text-white">
                                        <td className="px-3 py-2 text-xs font-bold" colSpan={4}>Advance Applied</td>
                                        <td className="px-3 py-2 text-right text-sm font-black">₹{advanceAmount.toLocaleString('en-IN')}</td>
                                    </tr>
                                )}
                                {totalOutstanding > 0 ? (
                                    <tr className="bg-rose-50 text-rose-700 border-t-2 border-rose-400">
                                        <td className="px-3 py-2 text-xs font-black uppercase" colSpan={4}>Balance Due</td>
                                        <td className="px-3 py-2 text-right text-sm font-black">₹{totalOutstanding.toLocaleString('en-IN')}</td>
                                    </tr>
                                ) : (
                                    <tr className="bg-emerald-50 text-emerald-700">
                                        <td className="px-3 py-2 text-center text-xs font-bold italic" colSpan={5}>
                                            ✓ Account Fully Settled
                                        </td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* ── STATUS + PAYMENT METHOD ROW ────────────────── */}
                <div className="grid grid-cols-2 gap-3">
                    <div className={`flex items-center gap-2.5 p-3 rounded-xl border-2 ${isPaid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        <div className={`p-1.5 rounded-full ${isPaid ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                            {isPaid ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-wider opacity-60">Status</p>
                            <p className="text-sm font-black leading-none">{isPaid ? 'PAID' : 'PARTIAL'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
                        <div className="p-1.5 bg-white rounded-full border border-slate-200">
                            <CreditCard className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">Method</p>
                            <p className="text-sm font-black leading-none">{primaryPayment.method || primaryPayment.paymentMethod || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                {/* ── FOOTER ─────────────────────────────────────── */}
                <div className="border-t border-dashed border-slate-200 pt-4 text-center space-y-1">
                    <p className="text-[10px] text-slate-400 font-medium">Computer-generated receipt · Valid without signature</p>
                    <p className="text-[10px] text-slate-500 font-semibold">
                        For discrepancies, contact school administration within 48 hours.
                    </p>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    .receipt-container {
                        box-shadow: none !important;
                        border: none !important;
                        border-radius: 0 !important;
                        max-width: 100% !important;
                    }
                    .print-header {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}
