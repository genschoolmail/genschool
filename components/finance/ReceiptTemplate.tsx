import Image from 'next/image';
import { Phone, Mail, AlertTriangle, CheckCircle } from 'lucide-react';

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
            <div className="p-4 md:p-6 border-b-2 border-slate-200 relative">
                <div className="flex flex-col md:flex-row print:flex-row items-center md:items-start justify-between gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {schoolInfo?.logoUrl ? (
                            <Image
                                src={schoolInfo.logoUrl}
                                alt="School Logo"
                                width={80}
                                height={80}
                                className="rounded-lg object-contain w-16 h-16 md:w-20 md:h-20"
                            />
                        ) : (
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl md:text-2xl">
                                {schoolInfo?.schoolName?.charAt(0) || 'S'}
                            </div>
                        )}
                    </div>

                    {/* School Info */}
                    <div className="flex-1 text-center md:text-left print:text-left">
                        <h1 className="text-xl md:text-2xl font-bold text-slate-800">
                            {schoolInfo?.schoolName || 'School Name'}
                        </h1>
                        <p className="text-xs md:text-sm text-slate-600 mt-1">{schoolInfo?.address || 'School Address'}</p>
                        <div className="flex flex-wrap items-center justify-center md:justify-start print:justify-start gap-3 md:gap-4 mt-2 text-xs md:text-sm text-slate-500">
                            {schoolInfo?.contactNumber && (
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3 h-3" /> {schoolInfo.contactNumber}
                                </span>
                            )}
                            {schoolInfo?.email && (
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3 h-3" /> {schoolInfo.email}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Receipt Label */}
                    <div className="text-right flex-shrink-0 mt-2 md:mt-0 w-full md:w-auto text-center md:text-right print:text-right print:w-auto">
                        <div className="text-lg md:text-xl font-bold text-indigo-600 border-2 border-indigo-600 px-3 py-1 rounded inline-block uppercase">
                            Fee Receipt
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt Details */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                {/* Receipt Number and Date Row */}
                {/* Receipt Number and Date Row - Consistent Layout */}
                <div className="flex flex-row justify-between items-center border-b border-slate-200 pb-4 gap-4">
                    <div>
                        <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">Receipt No.</p>
                        <p className="font-mono font-bold text-sm md:text-lg text-slate-800 break-all">
                            {primaryPayment.consolidatedReceiptNo || primaryPayment.receiptNo || primaryPayment.id.slice(0, 12).toUpperCase()}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">Date</p>
                        <p className="font-medium text-sm md:text-base text-slate-800" suppressHydrationWarning>
                            {new Date(primaryPayment.date).toLocaleDateString('en-IN', {
                                day: '2-digit', month: 'long', year: 'numeric'
                            })}
                        </p>
                    </div>
                </div>

                {/* Student Details */}
                <div className="bg-slate-50 rounded-lg p-3 md:p-4 print:bg-slate-50">
                    <h3 className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 md:mb-3">Student Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                        <div>
                            <p className="text-[10px] md:text-xs text-slate-500">Name</p>
                            <p className="font-semibold text-sm md:text-base text-slate-800">{student?.user.name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs text-slate-500">Admission No.</p>
                            <p className="font-medium text-sm md:text-base text-slate-800">{student?.admissionNo}</p>
                        </div>
                        <div>
                            <p className="text-[10px] md:text-xs text-slate-500">Class</p>
                            <p className="font-medium text-sm md:text-base text-slate-800">
                                {student?.class?.name}-{student?.class?.section}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Fee Breakdown Table */}
                <div className="overflow-x-auto">
                    <h3 className="text-[10px] md:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 md:mb-3">Fee Details</h3>
                    <table className="w-full text-[10px] xs:text-xs md:text-sm">
                        <thead>
                            <tr className="bg-slate-100 print:bg-slate-100 text-left">
                                <th className="py-2 px-1 md:px-3 font-semibold text-slate-700">Desc</th>
                                <th className="py-2 px-1 md:px-3 text-center font-semibold text-slate-700">Month</th>
                                <th className="py-2 px-1 md:px-3 text-right font-semibold text-slate-700">Base</th>
                                <th className="py-2 px-1 md:px-3 text-right font-semibold text-slate-700">Disc</th>
                                <th className="py-2 px-1 md:px-3 text-right font-semibold text-slate-700">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment, index) => {
                                const sf = payment.studentFee;
                                const feeName = sf?.feeStructure?.name || 'Fee';
                                const feeMonth = (sf as any)?.feeMonth;
                                const feeYear = (sf as any)?.feeYear;
                                const monthDisplay = feeMonth ? `${monthNames[feeMonth]} ${feeYear || ''}` : '-';
                                const baseAmount = sf?.amount || 0;
                                const discount = sf?.discount || 0;

                                return (
                                    <tr key={payment.id} className="border-b border-slate-100">
                                        <td className="py-2 px-1 md:px-3">
                                            <p className="font-medium text-slate-800 truncate max-w-[80px] sm:max-w-none">{feeName}</p>
                                            <p className="text-[9px] md:text-[10px] text-slate-500 truncate max-w-[80px] sm:max-w-none">
                                                {sf?.feeStructure?.feeHead?.name}
                                            </p>
                                        </td>
                                        <td className="py-2 px-1 md:px-3 text-center text-slate-700 whitespace-nowrap">
                                            {monthDisplay}
                                        </td>
                                        <td className="py-2 px-1 md:px-3 text-right font-medium text-slate-600">
                                            ₹{baseAmount.toLocaleString()}
                                        </td>
                                        <td className="py-2 px-1 md:px-3 text-right font-medium text-green-600">
                                            {discount > 0 ? `-₹${discount.toLocaleString()}` : '-'}
                                        </td>
                                        <td className="py-2 md:py-3 px-2 md:px-3 text-right font-bold text-slate-800">
                                            ₹{(baseAmount - discount).toLocaleString()}
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Tax Row */}
                            {totalTax > 0 && (
                                <tr className="border-b border-slate-100 text-slate-600">
                                    <td className="py-2 px-2 md:px-3" colSpan={4}>Tax (GST)</td>
                                    <td className="py-2 px-2 md:px-3 text-right">+ ₹{totalTax.toLocaleString()}</td>
                                </tr>
                            )}

                            {/* Previous Debt Row */}
                            {totalPreviousDebt > 0 && (
                                <tr className="border-b border-slate-100 text-orange-600">
                                    <td className="py-2 px-2 md:px-3" colSpan={4}>Prev. Balance</td>
                                    <td className="py-2 px-2 md:px-3 text-right">+ ₹{totalPreviousDebt.toLocaleString()}</td>
                                </tr>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-100 print:bg-slate-100">
                                <td className="py-2 px-1 md:px-3 font-bold text-slate-800" colSpan={4}>Grand Total</td>
                                <td className="py-2 px-1 md:px-3 text-right font-bold text-sm md:text-lg text-slate-800">
                                    ₹{grandTotal.toLocaleString()}
                                </td>
                            </tr>
                            <tr className="bg-green-50 print:bg-green-50">
                                <td className="py-2 px-1 md:px-3 font-semibold text-green-700" colSpan={4}>Paid</td>
                                <td className="py-2 px-1 md:px-3 text-right font-bold text-green-600">
                                    ₹{totalPaid.toLocaleString()}
                                </td>
                            </tr>

                            {/* Advance Payment Row */}
                            {advanceAmount > 0 && (
                                <tr className="bg-indigo-50 print:bg-indigo-50 border-t border-indigo-100">
                                    <td className="py-2 px-1 md:px-3 font-semibold text-indigo-700" colSpan={4}>
                                        <span className="flex items-center gap-2">
                                            Added to Advance
                                        </span>
                                    </td>
                                    <td className="py-2 px-1 md:px-3 text-right font-bold text-indigo-600">
                                        ₹{advanceAmount.toLocaleString()}
                                    </td>
                                </tr>
                            )}

                            {/* Advance Balance Display (Informational) */}
                            {walletBalance > 0 && (
                                <tr className="bg-slate-50 print:bg-slate-50 text-[10px] text-slate-500 border-t border-slate-200">
                                    <td className="py-1 px-1 md:px-3 text-right italic" colSpan={5}>
                                        Adv. Bal: ₹{walletBalance.toLocaleString()}
                                    </td>
                                </tr>
                            )}

                            {totalOutstanding > 0 ? (
                                <tr className="bg-red-50 print:bg-red-50 border-t border-red-100">
                                    <td className="py-2 px-1 md:px-3 font-semibold text-red-700" colSpan={4}>Due</td>
                                    <td className="py-2 px-1 md:px-3 text-right font-bold text-red-600">
                                        ₹{totalOutstanding.toLocaleString()}
                                    </td>
                                </tr>
                            ) : null}
                        </tfoot>
                    </table>
                </div>

                {/* Payment Status */}
                {/* Payment Status - Consistent Row */}
                <div className={`flex flex-row items-center justify-between p-3 md:p-4 rounded-lg border print:border-current gap-3 ${totalOutstanding > 0
                    ? 'bg-orange-50 border-orange-200 print:bg-orange-50'
                    : 'bg-green-50 border-green-200 print:bg-green-50'
                    }`}>
                    <div className="flex items-center gap-2 md:gap-3">
                        {totalOutstanding > 0 ? (
                            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-600 flex-shrink-0" />
                        ) : (
                            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
                        )}
                        <div>
                            <p className={`font-medium text-sm md:text-base ${totalOutstanding > 0 ? 'text-orange-800' : 'text-green-800'}`}>
                                {totalOutstanding > 0 ? 'Partial Payment' : 'Payment Successful'}
                            </p>
                            <p className={`text-[10px] md:text-sm ${totalOutstanding > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                Via {primaryPayment.method}
                            </p>
                        </div>
                    </div>
                    <span className={`px-2 py-1 md:px-3 rounded-full text-[10px] md:text-sm font-medium ${totalOutstanding > 0
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {primaryPayment.status}
                    </span>
                </div>

                {/* Footer Note */}
                <div className="text-center text-[10px] md:text-xs text-slate-500 pt-4 border-t border-dashed border-slate-200">
                    <p>Computer-generated receipt. No signature required.</p>
                    <p className="mt-1 font-medium">Thank you for your payment!</p>
                </div>
            </div>
        </div>
    );
}
