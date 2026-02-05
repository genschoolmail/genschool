import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Razorpay Webhook Handler
 * Standardizes payments and split transfers from gateway events
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // 1. Verify Signature
        if (webhookSecret && signature) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(body)
                .digest('hex');

            if (expectedSignature !== signature) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
            }
        }

        const event = JSON.parse(body);
        const { event: eventName, payload } = event;

        console.log(`Razorpay Webhook: ${eventName}`, payload.payment.entity.id);

        if (eventName === 'payment.captured') {
            const payment = payload.payment.entity;
            const orderId = payment.order_id;
            const transactionId = payment.id;

            // Handle Payment Success
            await handlePaymentSuccess(orderId, transactionId, payment);
        }

        if (eventName === 'transfer.processed') {
            const transfer = payload.transfer.entity;
            const transferId = transfer.id;
            const paymentId = transfer.source;

            // Update Transfer Status in DB
            await (prisma.feePayment as any).updateMany({
                where: { transactionId: paymentId },
                data: {
                    transferId: transferId,
                    splitStatus: 'SUCCESS'
                }
            });
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handlePaymentSuccess(orderId: string, transactionId: string, rawData: any) {
    // 1. Find the pending fee payment record
    const feePayment = await prisma.feePayment.findFirst({
        where: { transactionId: orderId },
        include: { studentFee: true }
    });

    if (!feePayment || feePayment.status === 'COMPLETED') return;

    // 2. Atomic Transaction: Update Fee, Mark Payment COMPLETED, Update Student Fee status
    await prisma.$transaction(async (tx) => {
        // a. Update Payment Record
        await tx.feePayment.update({
            where: { id: feePayment.id },
            data: {
                status: 'COMPLETED',
                bankRefNo: transactionId,
                gatewayResponse: JSON.stringify(rawData),
                date: new Date()
            }
        });

        // b. Update Student Fee
        const currentTotalPaid = feePayment.studentFee.paidAmount + feePayment.amount;
        const totalDue = feePayment.studentFee.amount - feePayment.studentFee.discount;
        const isPaid = currentTotalPaid >= (totalDue - 0.5);

        await tx.studentFee.update({
            where: { id: feePayment.studentFeeId },
            data: {
                paidAmount: currentTotalPaid,
                status: isPaid ? 'PAID' : 'PARTIAL'
            }
        });

        // c. Create Income Record
        await tx.income.create({
            data: {
                schoolId: feePayment.schoolId,
                source: 'FEE',
                description: `Webhook: Fee Payment (Split)`,
                amount: feePayment.amount,
                date: new Date(),
                reference: feePayment.receiptNo || transactionId,
                feePaymentId: feePayment.id,
                remarks: `Razorpay Webhook | Txn: ${transactionId}`
            }
        });
    });
}
