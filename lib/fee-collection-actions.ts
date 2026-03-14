"use server";

import { prisma } from "@/lib/prisma";
import { ensureTenantId } from "@/lib/tenant";
import { revalidatePath } from "next/cache";

export interface PendingFee {
    id: string;
    amount: number;
    paidAmount: number;
    pendingAmount: number;
    dueDate: Date;
    status: string;
    feeStructure: {
        id: string;
        name: string;
        feeHeadId: string;
        amount: number;
    };
}

export async function getStudentPendingFees(studentId: string): Promise<PendingFee[]> {
    const schoolId = await ensureTenantId();

    const fees = await prisma.studentFee.findMany({
        where: {
            studentId,
            schoolId,
            status: { not: "PAID" }
        },
        include: {
            feeStructure: true
        },
        orderBy: { dueDate: "asc" }
    });

    return fees.map((f: any) => {
        const total = (f.amount || 0) + (f.taxAmount || 0) + (f.previousDebt || 0) + (f.fine || 0);
        const paid = f.paidAmount || 0;
        const discount = f.discount || 0;
        const pending = Math.max(0, total - paid - discount);
        
        return {
            id: f.id,
            amount: total,
            paidAmount: paid,
            pendingAmount: pending,
            dueDate: f.dueDate,
            status: f.status,
            feeStructure: {
                id: f.feeStructure.id,
                name: f.feeStructure.name,
                feeHeadId: f.feeStructure.feeHeadId,
                amount: f.feeStructure.amount,
            }
        };
    });
}

interface CollectFeesArgs {
    studentId: string;
    feesToPay: { studentFeeId: string; amount: number }[];
    method: string;
    reference?: string;
    remarks?: string;
    collectedBy: string;
}

export async function collectFees(params: CollectFeesArgs) {
    try {
        const schoolId = await ensureTenantId();
        const { studentId, feesToPay, method, reference, remarks, collectedBy } = params;

        // Verify Student
        const student = await prisma.student.findUnique({
            where: { id: studentId, schoolId },
            include: { user: true, class: true }
        });

        if (!student) {
            return { success: false, error: "Student not found" };
        }

        const consolidatedReceiptNo = `REC-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        const date = new Date();

        let totalPaid = 0;
        let advanceAmount = 0;

        // Perform in a transaction to ensure atomic updates
        const result = await prisma.$transaction(async (tx) => {
            let txTotalPaid = 0;

            for (const item of feesToPay) {
                if (item.amount <= 0) continue;

                const sf = await tx.studentFee.findUnique({
                    where: { id: item.studentFeeId }
                });

                if (!sf || sf.schoolId !== schoolId) {
                    throw new Error(`StudentFee ${item.studentFeeId} not found`);
                }

                const feeTotal = (sf.amount || 0) + (sf.taxAmount || 0) + (sf.previousDebt || 0) + (sf.fine || 0);
                const paidSoFar = sf.paidAmount || 0;
                const discount = sf.discount || 0;
                const currentPending = Math.max(0, feeTotal - paidSoFar - discount);

                // If user is paying more than pending for this fee, limit to pending
                // Any excess could be handled as wallet, or we just trust the UI
                const amountAllocated = Math.min(item.amount, currentPending);
                txTotalPaid += amountAllocated;

                const newPaidAmount = paidSoFar + amountAllocated;
                const newStatus = newPaidAmount + discount >= feeTotal ? 'PAID' : 'PARTIAL';

                // Update StudentFee
                await tx.studentFee.update({
                    where: { id: sf.id },
                    data: {
                        paidAmount: newPaidAmount,
                        status: newStatus
                    }
                });

                // Create FeePayment record
                const individualReceiptNo = `R-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
                const payment = await tx.feePayment.create({
                    data: {
                        schoolId,
                        studentFeeId: sf.id,
                        amount: amountAllocated,
                        method,
                        paymentMethod: method, // explicit mirroring to support multiple access patterns
                        status: 'PAID',
                        date,
                        receiptNo: individualReceiptNo,
                        consolidatedReceiptNo,
                        reference,
                        remarks,
                        collectedBy,
                        splitStatus: 'SUCCESS', // Offline payment does not undergo route split
                    }
                });

                // Update: Create Income record for unified tracking
                await tx.income.create({
                    data: {
                        schoolId,
                        source: 'FEE_PAYMENT',
                        amount: amountAllocated,
                        description: `Offline fee payment - ${student.user.name || 'Student'}`,
                        date,
                        reference: individualReceiptNo,
                        feePaymentId: payment.id
                    }
                });
            }

            // Wallet logic if they paid more than required across the board
            const sumReceived = feesToPay.reduce((acc, curr) => acc + curr.amount, 0);
            const sumAllocated = txTotalPaid;
            let txAdvanceAmount = sumReceived - sumAllocated;
            let txWalletBalance = 0;

            if (txAdvanceAmount > 0) {
                // Find or create wallet
                let wallet = await tx.wallet.findUnique({
                    where: { studentId }
                });

                if (!wallet) {
                    wallet = await tx.wallet.create({
                        data: {
                            studentId,
                            balance: txAdvanceAmount
                        }
                    });
                } else {
                    wallet = await tx.wallet.update({
                        where: { id: wallet.id },
                        data: { balance: { increment: txAdvanceAmount } }
                    });
                }

                // Create WalletTransaction
                await tx.walletTransaction.create({
                    data: {
                        schoolId,
                        walletId: wallet.id,
                        amount: txAdvanceAmount,
                        type: 'CREDIT',
                        description: `Advance from payment ${consolidatedReceiptNo}`,
                        balance: wallet.balance
                    }
                });
                
                txWalletBalance = wallet.balance;
            } else {
                 const wallet = await tx.wallet.findUnique({
                    where: { studentId }
                });
                txWalletBalance = wallet?.balance || 0;
            }

            return {
                totalPaid: sumAllocated,
                totalReceived: sumReceived,
                advanceAmount: txAdvanceAmount,
                walletBalance: txWalletBalance
            };
        });

        revalidatePath("/admin/finance/fees");
        revalidatePath("/student/finance");

        return {
            success: true,
            receiptNo: consolidatedReceiptNo,
            date: date.toISOString(),
            totalPaid: result.totalPaid,
            totalReceived: result.totalReceived,
            advanceAmount: result.advanceAmount,
            walletBalance: result.walletBalance,
            student
        };

    } catch (error: any) {
        console.error("collectFees error:", error);
        return { success: false, error: error.message || "An error occurred during fee collection." };
    }
}