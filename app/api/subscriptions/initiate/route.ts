import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RazorpayGateway } from '@/lib/payment-gateway/razorpay';
import { ensureTenantId } from '@/lib/tenant';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        // Allow ADMIN or SUPER_ADMIN
        if (!session?.user?.id || (session.user as any).role === 'STUDENT' || (session.user as any).role === 'PARENT') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const schoolId = await ensureTenantId();
        const { planId } = await req.json();

        if (!planId) {
            return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 });
        }

        const plan = await prisma.plan.findUnique({
            where: { id: planId }
        });

        if (!plan) {
            return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
        }

        const school = await prisma.school.findUnique({
            where: { id: schoolId }
        });

        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        const razorpay = new RazorpayGateway(
            process.env.RAZORPAY_KEY_ID || '',
            process.env.RAZORPAY_KEY_SECRET || '',
            process.env.NEXT_PUBLIC_APP_URL || ''
        );

        // Generate a unique transaction reference
        const receiptNo = `SUB-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

        // Initiate payment on the platform account (NO transfers array)
        const response = await razorpay.initiatePayment({
            amount: plan.price,
            currency: 'INR',
            receiptNo,
            studentId: 'admin-renewal', // Not applicable for sub but required by type
            schoolId: school.id,
            studentFeeId: 'N/A',
            description: `Subscription Renewal: ${plan.name} for ${school.name}`,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/settings`, // Optional
            customerName: school.name,
            customerEmail: school.contactEmail || 'billing@example.com',
            customerPhone: school.contactPhone || '9999999999'
            // NO subMerchantId here, money goes straight to Platform
        });

        if (!response.success || !response.orderId) {
            return NextResponse.json({ error: response.error || 'Failed to initialize subscription payment' }, { status: 400 });
        }

        // Normally we might log a 'SubscriptionPayment' record here for webhook tracking.
        // For simplicity, we'll store order info in webhook notes since order creation succeeded.

        return NextResponse.json({
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: response.orderId,
            amount: plan.price * 100,
            currency: 'INR',
            name: "PlatformHQ Subscription",
            description: `Renewal for ${plan.name}`,
            prefill: {
                name: school.name,
                email: school.contactEmail || '',
                contact: school.contactPhone || ''
            },
            notes: {
                type: 'SUBSCRIPTION_RENEWAL',
                schoolId: school.id,
                planId: plan.id,
                billingCycle: plan.billingCycle
            }
        });

    } catch (error: any) {
        console.error('Subscription initiation error:', error);
        return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
    }
}
