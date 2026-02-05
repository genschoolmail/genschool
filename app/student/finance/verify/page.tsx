import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import PaymentVerificationClient from './PaymentVerificationClient';

export default async function PaymentVerifyPage() {
    const session = await auth();
    if (!session?.user?.id) return <div className="p-4">Please log in to verify payments.</div>;

    const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
        select: { id: true }
    });

    if (!student) return <div className="p-4">Student record not found.</div>;

    try {
        // Fetch recent online payments (e.g., last 20)
        // We filter for methods unlikely to be CASH if we want only online, 
        // or we can show all. Let's show all for verification purposes.
        const recentPaymentsRaw = await prisma.feePayment.findMany({
            where: {
                studentFee: { studentId: student.id }
            },
            orderBy: { date: 'desc' },
            take: 20,
            include: {
                studentFee: {
                    include: { feeStructure: true }
                }
            }
        });

        // Serialize to safely pass to Client Component (handles Dates/Decimals)
        const recentPayments = JSON.parse(JSON.stringify(recentPaymentsRaw));

        return (
            <div className="container mx-auto p-4 max-w-5xl">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Payment Verification</h1>
                    <p className="text-gray-500">Verify your recent fee payments and transactions.</p>
                </div>

                <PaymentVerificationClient initialPayments={recentPayments} />
            </div>
        );
    } catch (error) {
        console.error("Error loading verification page:", error);
        return (
            <div className="p-8 text-center text-red-600">
                <h3 className="font-bold">Error Loading Payments</h3>
                <p>Please try again later.</p>
            </div>
        );
    }
}
