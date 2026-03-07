import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHmac } from 'crypto';
import { ensureTenantId } from '@/lib/tenant';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id || (session.user as any).role === 'STUDENT' || (session.user as any).role === 'PARENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const schoolId = await ensureTenantId();
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            planId,
        } = await req.json();

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
            return NextResponse.json({ error: 'Missing required payment verification fields' }, { status: 400 });
        }

        // Step 1: Verify the Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        const body = `${razorpay_order_id}|${razorpay_payment_id}`;
        const expectedSignature = createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            console.error(`[SubVerify] Signature mismatch for order ${razorpay_order_id}`);
            return NextResponse.json({ error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
        }

        // Step 2: Fetch the plan
        const plan = await prisma.plan.findUnique({ where: { id: planId } });
        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        // Step 3: Compute new subscription end date
        const now = new Date();
        const existingSub = await prisma.subscription.findFirst({
            where: { schoolId },
            orderBy: { createdAt: 'desc' }
        });

        // Start from today or from the existing end-date (whichever is in the future)
        const startDate = existingSub && existingSub.endDate > now
            ? new Date(existingSub.endDate)
            : now;

        const endDate = new Date(startDate);
        if (plan.billingCycle === 'YEARLY') {
            endDate.setFullYear(endDate.getFullYear() + 1);
        } else {
            endDate.setMonth(endDate.getMonth() + 1);
        }

        // Step 4: Upsert the subscription record
        if (existingSub) {
            await prisma.subscription.update({
                where: { id: existingSub.id },
                data: {
                    planId: plan.id,
                    status: 'ACTIVE',
                    startDate,
                    endDate,
                    billingCycle: plan.billingCycle,
                    updatedAt: new Date(),
                },
            });
        } else {
            await prisma.subscription.create({
                data: {
                    schoolId,
                    planId: plan.id,
                    status: 'ACTIVE',
                    startDate,
                    endDate,
                    billingCycle: plan.billingCycle,
                    autoRenew: false,
                },
            });
        }

        console.log(`[SubVerify] Subscription renewed for school ${schoolId}, plan ${plan.name}, expires ${endDate.toISOString()}`);

        return NextResponse.json({
            success: true,
            message: 'Subscription renewed successfully',
            newExpiryDate: endDate.toISOString(),
        });
    } catch (error: any) {
        console.error('[SubVerify] Error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}
