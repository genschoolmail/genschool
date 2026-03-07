import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RazorpayGateway } from '@/lib/payment-gateway/razorpay';
import { getTenantId } from '@/lib/tenant';
import { auth } from '@/auth';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const schoolId = await getTenantId();
        const { feeId } = await req.json();

        if (!feeId) {
            return NextResponse.json({ error: 'Fee ID is required' }, { status: 400 });
        }

        const feePayment = await prisma.feePayment.findFirst({
            where: { id: feeId, schoolId },
            include: {
                studentFee: {
                    include: {
                        student: { include: { user: true } }
                    }
                },
                school: true
            }
        });

        if (!feePayment) {
            return NextResponse.json({ error: 'Fee not found' }, { status: 404 });
        }

        if (feePayment.status === 'PAID') {
            return NextResponse.json({ error: 'Fee already paid' }, { status: 400 });
        }

        const razorpay = new RazorpayGateway(
            process.env.RAZORPAY_KEY_ID || '',
            process.env.RAZORPAY_KEY_SECRET || '',
            process.env.NEXT_PUBLIC_APP_URL || ''
        );

        const response = await razorpay.initiatePayment({
            amount: feePayment.amount,
            currency: 'INR',
            receiptNo: `Receipt#${feePayment.id}`,
            studentId: feePayment.studentFee.student.id,
            schoolId: feePayment.schoolId,
            studentFeeId: feePayment.studentFeeId,
            description: `Fee Payment for ${feePayment.studentFee.student.user?.name}`,
            returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/student/finance`,
            customerName: feePayment.studentFee.student.user?.name || 'Student',
            customerEmail: feePayment.studentFee.student.user?.email || 'student@example.com',
            customerPhone: feePayment.studentFee.student.user?.phone || '9999999999',
            subMerchantId: feePayment.school.subMerchantId || undefined,
            commissionPercentage: feePayment.school.commissionPercentage || 2.5
        });

        if (!response.success || !response.orderId) {
            return NextResponse.json({ error: response.error || 'Failed to initialize payment' }, { status: 400 });
        }

        await prisma.feePayment.update({
            where: { id: feeId },
            data: {
                reference: response.orderId,
                gatewayName: 'Razorpay',
                platformFee: response.platformFee,
                schoolShare: response.schoolShare,
                splitStatus: 'PENDING'
            }
        });

        return NextResponse.json({
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: response.orderId,
            amount: feePayment.amount * 100,
            currency: 'INR',
            name: feePayment.school.name || "School Fee Payment",
            description: "Online Fee Payment",
            prefill: {
                name: feePayment.studentFee.student.user?.name || '',
                email: feePayment.studentFee.student.user?.email || '',
                contact: feePayment.studentFee.student.user?.phone || ''
            },
            notes: {
                feeId: feePayment.id,
                schoolId: schoolId,
                studentId: feePayment.studentFee.student.id
            }
        });

    } catch (error: any) {
        console.error('Payment initiation error:', error);
        return NextResponse.json({ error: error.message || 'Payment initiation failed' }, { status: 500 });
    }
}
