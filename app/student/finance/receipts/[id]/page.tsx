import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import ReceiptActions from './ReceiptActions';
import ReceiptPrintStyles from './ReceiptPrintStyles';
import Link from 'next/link';
import { auth } from '@/auth';
import ReceiptTemplate from '@/components/finance/ReceiptTemplate';

// Month names for display
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

// Fetch school info for receipt header
async function getSchoolInfo() {
    const settings = await prisma.schoolSettings.findFirst();
    return settings;
}

async function getAdvancePayment(receiptNo: string) {
    try {
        const transaction = await prisma.walletTransaction.findFirst({
            where: {
                description: {
                    contains: receiptNo
                },
                type: 'CREDIT'
            }
        });
        return transaction ? transaction.amount : 0;
    } catch (error) {
        console.error("Error fetching advance payment:", error);
        return 0;
    }
}

async function getWalletBalance(studentId: string) {
    try {
        const wallet = await prisma.wallet.findUnique({
            where: { studentId }
        });
        return wallet ? wallet.balance : 0;
    } catch (error) {
        console.error("Error fetching wallet balance:", error);
        return 0;
    }
}

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

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

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

    // SECURITY CHECK: Ensure this receipt belongs to the logged-in student
    if (!student || student.userId !== session.user.id) {
        redirect('/student/finance');
    }

    const receiptNo = primaryPayment.consolidatedReceiptNo || primaryPayment.receiptNo || '';
    const [advanceAmount, walletBalance] = await Promise.all([
        getAdvancePayment(receiptNo),
        getWalletBalance(student.id)
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

    // Add advance to collected amount if we want to show "Total In" including advance? 
    // Usually Receipt shows "Paid Amount" as what covered the fees. 
    // The ReceiptTemplate handles advance logic visually.

    const totals = {
        totalBase,
        totalDiscount,
        totalTax,
        totalPreviousDebt,
        grandTotal,
        totalPaid,
        totalOutstanding,
        advanceAmount,
        walletBalance
    };

    return (
        <div className="p-6 max-w-3xl mx-auto print:p-0 print:max-w-none print:m-0">
            <ReceiptPrintStyles />

            {/* Back Button - Hidden in Print */}
            <div className="mb-6 print:hidden flex justify-between items-center">
                <Link href="/student/finance/receipts" className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 text-slate-700">
                    ← Back to Receipts
                </Link>
            </div>

            {/* Print/Download Actions - Hidden in Print */}
            <div className="mb-4 flex justify-end gap-2 print:hidden">
                <ReceiptActions paymentId={primaryPayment.id} receiptNumber={primaryPayment.receiptNo || "REC"} />
            </div>

            <ReceiptTemplate
                schoolInfo={schoolInfo}
                primaryPayment={primaryPayment}
                payments={payments}
                student={student}
                totals={totals}
                monthNames={MONTH_NAMES}
            />
        </div>
    );
}
