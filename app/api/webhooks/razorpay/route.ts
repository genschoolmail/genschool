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
        if (!webhookSecret || !signature) {
            return NextResponse.json({ error: 'Missing webhook signature or secret' }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        const { event: eventName, payload } = event;

        console.log(`Razorpay Webhook: ${eventName}`, payload.payment.entity.id);

        if (eventName === 'payment.captured') {
            const payment = payload.payment.entity;
            const orderId = payment.order_id;
            const transactionId = payment.id;
            const feeId = payment.notes?.feeId;
            const paymentType = payment.notes?.type;

            if (paymentType === 'SUBSCRIPTION_RENEWAL') {
                await handleSubscriptionRenewal(payment.notes, transactionId, payment);
            } else if (feeId) {
                // Handle standard Student Fee Payment Success
                await handlePaymentSuccess(feeId, orderId, transactionId, payment);
            }
        }

        if (eventName === 'transfer.processed') {
            const transfer = payload.transfer.entity;
            const transferId = transfer.id;
            const paymentId = transfer.source;
            const feeId = transfer.notes?.feeId;

            if (feeId) {
                // Update Transfer Status in DB
                await prisma.feePayment.update({
                    where: { id: feeId },
                    data: {
                        transferId: transferId,
                        splitStatus: 'SUCCESS'
                    }
                });
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function handlePaymentSuccess(feeId: string, orderId: string, transactionId: string, rawData: any) {
    // 1. Find the pending fee payment record
    const feePayment = await prisma.feePayment.findUnique({
        where: { id: feeId },
        include: { studentFee: true }
    });

    if (!feePayment || feePayment.status === 'PAID') return;

    // 2. Atomic Transaction: Update Fee, Mark Payment PAID, Update Student Fee status
    await prisma.$transaction(async (tx) => {
        // a. Update Payment Record
        await tx.feePayment.update({
            where: { id: feePayment.id },
            data: {
                status: 'PAID',
                reference: transactionId,
                paymentMethod: 'ONLINE',
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

async function handleSubscriptionRenewal(notes: any, transactionId: string, rawData: any) {
    const { schoolId, planId, billingCycle } = notes;
    if (!schoolId || !planId) return;

    // Billing cycle logic for extending dates
    let addMonths = billingCycle === 'YEARLY' ? 12 : 1;

    await prisma.$transaction(async (tx) => {
        // Find existing subscription
        let existingSub = await tx.subscription.findUnique({
            where: { schoolId }
        });

        const now = new Date();
        let newEndDate = new Date();

        if (existingSub && existingSub.endDate > now) {
            // Add onto existing time
            newEndDate = new Date(existingSub.endDate);
            newEndDate.setMonth(newEndDate.getMonth() + addMonths);
        } else {
            // Start from today
            newEndDate.setMonth(now.getMonth() + addMonths);
        }

        if (existingSub) {
            await tx.subscription.update({
                where: { id: existingSub.id },
                data: {
                    planId,
                    status: 'ACTIVE',
                    endDate: newEndDate,
                    billingCycle: billingCycle || 'MONTHLY',
                    lastPayment: now
                }
            });
        } else {
            await tx.subscription.create({
                data: {
                    schoolId,
                    planId,
                    status: 'ACTIVE',
                    startDate: now,
                    endDate: newEndDate,
                    billingCycle: billingCycle || 'MONTHLY',
                    lastPayment: now
                }
            });
        }

    });
}
