import Image from 'next/image';
import { Phone, Mail, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';

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
    const { totalOutstanding, totalTax, totalPreviousDebt, grandTotal, totalPaid, advanceAmount, walletBalance } = totals as any;

    return (
        <div className="receipt-container bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">

            {/* Header with School Info + Logo */}
            <div className="p-6 md:p-8 border-b-2 border-slate-200 relative overflow-hidden bg-gradient-to-br from-white to-slate-50">
                {/* Subtle Decorative Gradient */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row print:flex-row items-center md:items-start justify-between gap-6 relative z-10">
                    {/* Logo with shadow and border */}
                    <div className="flex-shrink-0">
                        {schoolInfo?.logoUrl ? (
                            <div className="bg-white p-1 rounded-xl shadow-md border border-slate-100">
                                <Image
                                    src={schoolInfo.logoUrl}
                                    alt="School Logo"
                                    width={100}
                                    height={100}
                                    className="rounded-lg object-contain w-20 h-20 md:w-24 md:h-24"
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-2xl md:text-3xl shadow-lg">
                                {schoolInfo?.schoolName?.charAt(0) || 'S'}
                            </div>
                        )}
                    </div>

                    {/* School Info - Enhanced Typography */}
                    <div className="flex-1 text-center md:text-left print:text-left">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                            {schoolInfo?.schoolName || 'School Name'}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium max-w-sm mb-3 leading-relaxed">{schoolInfo?.address || 'School Address'}</p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start print:justify-start gap-4 text-xs md:text-sm">
                            {schoolInfo?.contactNumber && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-slate-200 text-slate-600 font-medium shadow-sm">
                                    <Phone className="w-3.5 h-3.5 text-indigo-500" /> {schoolInfo.contactNumber}
                                </span>
                            )}
                            {schoolInfo?.email && (
                                <span className="flex items-center gap-1.5 px-2.5 py-1 bg-white rounded-full border border-slate-200 text-slate-600 font-medium shadow-sm">
                                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> {schoolInfo.email}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Receipt Label - More Modern */}
                    <div className="text-right flex-shrink-0 items-center justify-center flex flex-col pt-2">
                        <div className="px-5 py-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-100">
                            <span className="text-lg font-black text-white uppercase tracking-widest">
                                Fee Receipt
                            </span>
                        </div>
                        <p className="mt-2 text-[10px] uppercase tracking-tighter text-slate-400 font-bold">Official Document</p>
                    </div>
                </div>
            </div>

            {/* Receipt Details */}
            <div className="p-6 md:p-8 space-y-6 md:space-y-8 relative">
                {/* Watermark Logo (Simplified, using text or faint logo) */}
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none z-0">
                    <span className="text-[12rem] font-black -rotate-12 border-4 border-current rounded-full px-20">PAID</span>
                </div>

                {/* Receipt Number and Date Row - Better Layout */}
                <div className="grid grid-cols-2 border-b border-slate-100 pb-6 gap-8 relative z-10">
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Receipt Number</p>
                        <p className="font-mono font-bold text-base md:text-xl text-slate-800 break-all">
                            {primaryPayment.consolidatedReceiptNo || primaryPayment.receiptNo || primaryPayment.id.slice(0, 12).toUpperCase()}
                        </p>
                    </div>
                    <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Date of Payment</p>
                        <p className="font-bold text-base md:text-xl text-slate-800" suppressHydrationWarning>
                            {new Date(primaryPayment.date).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Student Details - Premium Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden z-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Student Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Student Name</p>
                            <p className="text-lg font-bold tracking-tight">{student?.user.name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Admission No.</p>
                            <p className="text-lg font-bold tracking-tight">{student?.admissionNo}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Class & Section</p>
                            <p className="text-lg font-bold tracking-tight px-3 py-1 bg-white/10 rounded-lg inline-block">
                                {student?.class?.name} - {student?.class?.section}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fee Breakdown Table - Clean and Professional */}
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Details</h3>
                        <div className="h-px flex-1 bg-slate-100"></div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 text-left border-y border-slate-100">
                                    <th className="py-4 px-4 font-bold text-slate-600 uppercase text-[10px] tracking-widest">Description</th>
                                    <th className="py-4 px-4 text-center font-bold text-slate-600 uppercase text-[10px] tracking-widest">Month</th>
                                    <th className="py-4 px-4 text-right font-bold text-slate-600 uppercase text-[10px] tracking-widest">Base Amount</th>
                                    <th className="py-4 px-4 text-right font-bold text-slate-600 uppercase text-[10px] tracking-widest">Discount</th>
                                    <th className="py-4 px-4 text-right font-bold text-slate-600 uppercase text-[10px] tracking-widest">Net Total</th>
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
                                        <tr key={payment.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="py-5 px-4">
                                                <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{feeName}</p>
                                                <p className="text-[11px] font-medium text-slate-400">
                                                    {sf?.feeStructure?.feeHead?.name}
                                                </p>
                                            </td>
                                            <td className="py-5 px-4 text-center text-slate-600 font-medium">
                                                {monthDisplay}
                                            </td>
                                            <td className="py-5 px-4 text-right font-medium text-slate-600">
                                                ₹{baseAmount.toLocaleString('en-IN')}
                                            </td>
                                            <td className="py-5 px-4 text-right font-bold text-emerald-600">
                                                {discount > 0 ? `-₹${discount.toLocaleString('en-IN')}` : '-'}
                                            </td>
                                            <td className="py-5 px-4 text-right font-black text-slate-900">
                                                ₹{(baseAmount - discount).toLocaleString('en-IN')}
                                            </td>
                                        </tr>
                                    );
                                })}

                                {/* Tax Row */}
                                {totalTax > 0 && (
                                    <tr className="text-slate-500 italic bg-gray-50/30">
                                        <td className="py-4 px-4 font-semibold" colSpan={4}>Tax (GST/IGST Applied)</td>
                                        <td className="py-4 px-4 text-right font-bold">+ ₹{totalTax.toLocaleString('en-IN')}</td>
                                    </tr>
                                )}

                                {/* Previous Debt Row */}
                                {totalPreviousDebt > 0 && (
                                    <tr className="text-orange-600 bg-orange-50/20">
                                        <td className="py-4 px-4 font-semibold" colSpan={4}>Outstanding Balance B/F</td>
                                        <td className="py-4 px-4 text-right font-bold text-orange-700">+ ₹{totalPreviousDebt.toLocaleString('en-IN')}</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-900">
                                <tr className="bg-slate-900 text-white">
                                    <td className="py-4 px-6 font-black uppercase text-xs tracking-widest" colSpan={4}>Grand Total</td>
                                    <td className="py-4 px-6 text-right font-black text-xl">
                                        ₹{grandTotal.toLocaleString('en-IN')}
                                    </td>
                                </tr>
                                <tr className="bg-emerald-600 text-white">
                                    <td className="py-4 px-6 font-bold uppercase text-xs tracking-widest" colSpan={4}>Amount Paid</td>
                                    <td className="py-4 px-6 text-right font-black text-lg">
                                        ₹{totalPaid.toLocaleString('en-IN')}
                                    </td>
                                </tr>

                                {/* Advance Payment Row */}
                                {advanceAmount > 0 && (
                                    <tr className="bg-indigo-600 text-white border-t border-indigo-500/30">
                                        <td className="py-4 px-6 font-bold uppercase text-xs tracking-widest" colSpan={4}>
                                            <span className="flex items-center gap-2">
                                                Adv. Deposit Applied
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-right font-black">
                                            ₹{advanceAmount.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                )}

                                {/* Advance Balance Display (Informational) */}
                                {walletBalance > 0 && (
                                    <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold border-t border-slate-100">
                                        <td className="py-2 px-6 text-right italic uppercase tracking-tighter" colSpan={5}>
                                            Current Wallet Balance: ₹{walletBalance.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                )}

                                {totalOutstanding > 0 ? (
                                    <tr className="bg-rose-50 border-t-2 border-rose-600 text-rose-700">
                                        <td className="py-4 px-6 font-black uppercase text-xs tracking-widest" colSpan={4}>Net Due Balance</td>
                                        <td className="py-4 px-6 text-right font-black text-lg">
                                            ₹{totalOutstanding.toLocaleString('en-IN')}
                                        </td>
                                    </tr>
                                ) : (
                                    <tr className="bg-emerald-50 text-emerald-700 border-t border-emerald-200">
                                        <td className="py-3 px-6 text-center italic font-bold text-xs uppercase tracking-tighter" colSpan={5}>
                                            Account Fully Settled - Nil Outstanding
                                        </td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Final Status and Payment Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 pt-4">
                     <div className={`flex items-center gap-4 p-5 rounded-2xl border-2 shadow-sm ${totalOutstanding > 0
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        }`}>
                        <div className={`p-3 rounded-full ${totalOutstanding > 0 ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                            {totalOutstanding > 0 ? (
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            ) : (
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                            )}
                        </div>
                        <div>
                            <p className="font-black uppercase text-[10px] tracking-widest opacity-60 mb-0.5">Payment Status</p>
                            <p className="font-black text-lg leading-none">
                                {totalOutstanding > 0 ? 'PARTIAL' : 'PAID IN FULL'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm text-slate-800">
                        <div className="p-3 bg-white rounded-full border border-slate-200 shadow-sm">
                            <CreditCard className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <p className="font-black uppercase text-[10px] tracking-widest opacity-60 mb-0.5">Payment Method</p>
                            <p className="font-black text-lg leading-none">
                                {primaryPayment.method || 'NOT SPECIFIED'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer and Security Notice */}
                <div className="pt-10 space-y-4">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-2">Certification</p>
                        <div className="flex items-center justify-center gap-2 text-slate-400">
                            <div className="h-px w-8 bg-slate-200"></div>
                            <p className="text-[11px] font-medium italic">Computer-generated receipt valid without physical signature</p>
                            <div className="h-px w-8 bg-slate-200"></div>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
                        <p className="text-slate-600 font-bold mb-1">Thank you for your timely payment!</p>
                        <p className="text-xs text-slate-400 font-medium">For any discrepancies, please contact the school administration office within 48 hours.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
