import { prisma } from '@/lib/prisma';
import { getSchoolInfo } from '@/lib/schoolInfo';
import BackButton from '@/components/ui/BackButton';
import { notFound } from 'next/navigation';
import { CheckCircle, Phone, Mail, AlertTriangle } from 'lucide-react';
import PrintButton from './PrintButton';
import RefundButton from '@/components/finance/RefundButton';
import Image from 'next/image';
import ReceiptPrintStyles from './ReceiptPrintStyles';
import ReceiptTemplate from '@/components/finance/ReceiptTemplate';
import ManagePaymentButton from '@/components/finance/ManagePaymentButton';
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// Removed local getSchoolInfo function

// Fetch payment details - supports consolidated receipts
async function getPaymentDetails(id: string) {
    // First, try to find by consolidatedReceiptNo (batch payment)
    let payments = await prisma.feePayment.findMany({
        where: { consolidatedReceiptNo: id },
        include: {
            studentFee: {
                include: {
                    student: {
                        include: {
                            user: { select: { name: true, email: true } },
                            class: { select: { name: true, section: true } }
                        }
                    },
                    feeStructure: {
                        include: {
                            feeHead: true,
                            tax: true
                        }
                    }
                }
            }
        }
    });

    // If no consolidated receipt found, try single payment by receiptNo or id
    if (payments.length === 0) {
        const singlePayment = await prisma.feePayment.findFirst({
            where: { OR: [{ receiptNo: id }, { id: id }] },
            include: {
                studentFee: {
                    include: {
                        student: {
                            include: {
                                user: { select: { name: true, email: true } },
                                class: { select: { name: true, section: true } }
                            }
                        },
                        feeStructure: {
                            include: {
                                feeHead: true,
                                tax: true
                            }
                        }
                    }
                }
            }
        });
        if (singlePayment) {
            payments = [singlePayment];
        }
    }

    return payments;
}

// Fetch advance payment for this receipt
async function getAdvancePayment(receiptNo: string | null) {
    if (!receiptNo) return 0;
    const transaction = await prisma.walletTransaction.findFirst({
        where: {
            description: { contains: receiptNo },
            type: 'CREDIT'
        }
    });
    return transaction ? transaction.amount : 0;
}

// Fetch current wallet balance
async function getWalletBalance(studentId: string) {
    const wallet = await prisma.wallet.findUnique({
        where: { studentId }
    });
    return wallet ? wallet.balance : 0;
}

export default async function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const [payments, schoolInfo] = await Promise.all([
        getPaymentDetails(id),
        getSchoolInfo()
    ]);

    if (payments.length === 0) {
        notFound();
    }

    // Get primary student info (all payments in batch are for same student)
    const primaryPayment = payments[0];
    const student = primaryPayment.studentFee?.student;

    // Fetch Advance & Wallet
    // Use the receipt number that matched (either consolidated or individual)
    const effectiveReceiptNo = primaryPayment.consolidatedReceiptNo === id ? primaryPayment.consolidatedReceiptNo : (primaryPayment.receiptNo === id ? primaryPayment.receiptNo : primaryPayment.receiptNo); // Fallback logic

    // Actually, collectFees generates one receiptNo for the batch.
    // If we accessed by ID, we might not have the receiptNo string directly if it was just ID.
    // But collectFees saves receiptNo.
    const receiptNoForSearch = primaryPayment.consolidatedReceiptNo || primaryPayment.receiptNo;

    const [advanceAmount, walletBalance] = await Promise.all([
        getAdvancePayment(receiptNoForSearch),
        student ? getWalletBalance(student.id) : 0
    ]);

    // Calculate totals across all fees in this receipt
    let totalBase = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalPreviousDebt = 0;
    let totalPaid = 0; // This receipt's total
    let totalOutstanding = 0; // Live outstanding balance

    payments.forEach(p => {
        const studentFee = p.studentFee;
        if (studentFee) {
            totalBase += studentFee.amount || 0;
            totalDiscount += studentFee.discount || 0;
            totalTax += studentFee.taxAmount || 0;
            totalPreviousDebt += (studentFee as any).previousDebt || 0;

            // Calculate outstanding for this specific fee (Live data)
            const feeTotal = (studentFee.amount || 0) + (studentFee.taxAmount || 0) - (studentFee.discount || 0) + ((studentFee as any).previousDebt || 0);
            const feeOutstanding = Math.max(0, feeTotal - studentFee.paidAmount);
            totalOutstanding += feeOutstanding;
        }
        totalPaid += p.amount;
    });

    const grandTotal = totalBase - totalDiscount + totalTax + totalPreviousDebt;

    // Total Paid should technically include the advance amount if we consider "Total Received from User"
    // But totalPaid here sums up FeePayments.
    // If User paid 1000, and 800 went to fees (FeePayments sum=800) and 200 to wallet.
    // We should show "Paid for Fees: 800", "Credited to Wallet: 200".
    // Total Receipt Amount: 1000.

    return (
        <div className="p-6 max-w-3xl mx-auto print:p-0 print:max-w-none print:m-0">
            <ReceiptPrintStyles />

            <div className="mb-6 print:hidden">
                <BackButton href="/admin/finance/ledger" />
            </div>



            {/* Print/Download Actions - Hidden in Print */}
            <div className="mb-4 flex justify-end gap-2 print:hidden relative z-10">
                {primaryPayment.status === 'SUCCESS' && (
                    <ManagePaymentButton
                        paymentId={primaryPayment.id}
                        studentName={student?.user.name || 'Student'}
                        amount={primaryPayment.amount}
                        status={primaryPayment.status}
                    />
                )}
                {primaryPayment.status === 'REFUNDED' && (
                    <span className="px-3 py-2 bg-red-100 text-red-700 rounded-md text-sm font-medium border border-red-200">
                        Refunded
                    </span>
                )}
                <PrintButton />
            </div>

            <ReceiptTemplate
                schoolInfo={schoolInfo}
                primaryPayment={primaryPayment}
                payments={payments}
                student={student}
                totals={{
                    totalBase,
                    totalDiscount,
                    totalTax,
                    totalPreviousDebt,
                    grandTotal,
                    totalPaid,
                    totalOutstanding,
                    advanceAmount,
                    walletBalance
                }}
                monthNames={MONTH_NAMES}
            />
        </div>
    );
}
