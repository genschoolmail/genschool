'use server';

import { prisma } from '@/lib/prisma';
import { ensureTenantId } from '@/lib/tenant';
import { auth } from '@/auth';
import { RazorpayGateway } from '@/lib/payment-gateway/razorpay';

export async function initiateStudentPayment(feeId: string, amount: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const schoolId = await ensureTenantId();

        // 1. Get Student
        const student = await prisma.student.findUnique({
            where: { userId: session.user.id },
            include: { user: true }
        });

        if (!student) {
            return { success: false, error: 'Student not found' };
        }

        // 2. Get Fee details + school (for subMerchantId)
        const fee = await prisma.studentFee.findUnique({
            where: { id: feeId },
            include: { feeStructure: { include: { feeHead: true } } }
        });

        if (!fee || fee.studentId !== student.id) {
            return { success: false, error: 'Fee record not found or access denied' };
        }

        // 3. Fetch school for routing info
        const school = await prisma.school.findUnique({
            where: { id: schoolId },
            select: { name: true, subMerchantId: true, commissionPercentage: true }
        });

        // 4. Generate school-prefixed receipt number for isolation
        const schoolCode = (school?.name || 'SCH').replace(/[^A-Za-z]/g, '').slice(0, 3).toUpperCase();
        const receiptNo = `${schoolCode}-ON-${Date.now()}`;

        // 5. Initiate with Razorpay (with school routing if available)
        const gateway = new RazorpayGateway(
            process.env.RAZORPAY_KEY_ID!,
            process.env.RAZORPAY_KEY_SECRET!,
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        );

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const returnUrl = `${baseUrl}/student/finance/verify`;

        const result = await gateway.initiatePayment({
            amount,
            currency: 'INR',
            receiptNo,
            studentId: student.id,
            schoolId,
            studentFeeId: feeId,
            description: `Fee: ${fee.feeStructure.name}`,
            returnUrl,
            customerName: student.user.name || 'Student',
            customerEmail: student.user.email || '',
            customerPhone: (student as any).phone || '',
            // School routing for fund isolation
            subMerchantId: school?.subMerchantId || undefined,
            commissionPercentage: school?.commissionPercentage || 2.5,
        });

        if (!result.success) {
            return { success: false, error: result.error || 'Gateway initiation failed' };
        }

        // 6. Create a PENDING FeePayment record
        const payment = await prisma.feePayment.create({
            data: {
                schoolId,
                studentFeeId: feeId,
                amount,
                method: 'ONLINE',
                status: 'PENDING',
                receiptNo,
                reference: result.orderId,
                paymentMethod: 'RAZORPAY',
                date: new Date(),
                platformFee: result.platformFee || 0,
                schoolShare: result.schoolShare || 0,
            }
        });

        return {
            success: true,
            checkoutData: {
                key: process.env.RAZORPAY_KEY_ID,
                amount: Math.round(amount * 100),
                currency: 'INR',
                orderId: result.orderId,
                paymentId: payment.id,
            }
        };

    } catch (error: any) {
        console.error('initiateStudentPayment error:', error);
        return { success: false, error: error.message || 'Internal server error' };
    }
}

export async function verifyTransaction(paymentId: string, transactionId: string, status: string) {
    try {
        const schoolId = await ensureTenantId();

        // 1. Get the existing payment record
        const payment = await prisma.feePayment.findUnique({
            where: { id: paymentId, schoolId },
            include: { studentFee: true }
        });

        if (!payment) {
            return { success: false, error: 'Payment record not found' };
        }

        if (payment.status === 'PAID') {
            return { success: true, payment };
        }

        if (status !== 'SUCCESS') {
            await prisma.feePayment.update({
                where: { id: paymentId },
                data: { status: 'FAILED', remarks: 'Payment failed at gateway' }
            });
            return { success: false, error: 'Payment failed at gateway' };
        }

        // 2. Verify with Gateway
        const gateway = new RazorpayGateway(
            process.env.RAZORPAY_KEY_ID!,
            process.env.RAZORPAY_KEY_SECRET!,
            process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        );

        const verifyResult = await gateway.verifyPayment(transactionId);

        if (!verifyResult.success) {
            return { success: false, error: verifyResult.error || 'Verification failed' };
        }

        // 3. Update Payment and StudentFee in transaction
        await prisma.$transaction(async (tx) => {
            // Generate receipt number if missing
            const receiptNo = payment.receiptNo || `REC-ON-${Date.now()}`;

            // Update Payment
            await tx.feePayment.update({
                where: { id: paymentId },
                data: {
                    status: 'PAID',
                    reference: transactionId,
                    receiptNo: receiptNo,
                    date: new Date(),
                }
            });

            // Update StudentFee
            const sf = payment.studentFee;
            const newPaidAmount = (sf.paidAmount || 0) + payment.amount;
            const feeTotal = (sf.amount || 0) + (sf.taxAmount || 0) + (sf.previousDebt || 0) + (sf.fine || 0);
            const discount = sf.discount || 0;
            const newStatus = (newPaidAmount + discount) >= feeTotal ? 'PAID' : 'PARTIAL';

            await tx.studentFee.update({
                where: { id: sf.id },
                data: {
                    paidAmount: newPaidAmount,
                    status: newStatus
                }
            });

            // Create Income record
            await tx.income.create({
                data: {
                    schoolId,
                    source: 'FEE_PAYMENT',
                    amount: payment.amount,
                    description: `Online fee payment - ${paymentId}`,
                    date: new Date(),
                    feePaymentId: paymentId
                }
            });
        });

        // Re-fetch updated payment for return
        const updatedPayment = await prisma.feePayment.findUnique({
            where: { id: paymentId }
        });

        return { success: true, payment: updatedPayment };

    } catch (error: any) {
        console.error('verifyTransaction error:', error);
        return { success: false, error: error.message || 'Internal server error' };
    }
}

export async function reVerifyPayment(paymentId: string) {
    try {
        const schoolId = await ensureTenantId();

        const payment = await prisma.feePayment.findUnique({
            where: { id: paymentId, schoolId }
        });

        if (!payment || payment.status === 'PAID') {
            return { success: true, message: 'Already paid or not found' };
        }

        if (!payment.reference) {
            return { success: false, error: 'No reference found for this payment' };
        }

        const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64');
        
        // 1. Fetch payments for this order
        const response = await fetch(`https://api.razorpay.com/v1/orders/${payment.reference}/payments`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error?.description || 'Failed to fetch order status' };
        }

        // 2. Look for any captured (successful) payment
        const successfulPayment = data.items.find((p: any) => p.status === 'captured');

        if (successfulPayment) {
            // Found a successful payment! Verify and update.
            return await verifyTransaction(paymentId, successfulPayment.id, 'SUCCESS');
        } else {
            // Check if any payment failed or is still authorized
            const failedPayment = data.items.find((p: any) => p.status === 'failed');
            if (failedPayment) {
                await prisma.feePayment.update({
                    where: { id: paymentId },
                    data: { status: 'FAILED', remarks: failedPayment.error_description || 'Payment failed' }
                });
                return { success: false, error: 'Payment failed', details: failedPayment.error_description };
            }
        }

        return { success: false, error: 'No successful payment found yet. If you have been charged, please wait a few minutes or contact support.' };

    } catch (error: any) {
        console.error('reVerifyPayment error:', error);
        return { success: false, error: 'Failed to re-verify payment' };
    }
}