import React from 'react';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';
import { TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle2, IndianRupee, Receipt, FileText } from 'lucide-react';
import Link from 'next/link';
import StudentFinanceClient from './StudentFinanceClient';

export default async function StudentFinancePage() {
    const session = await auth();

    if (!session?.user?.id) {
        return <div>Please log in</div>;
    }

    const student: any = await prisma.student.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            class: true,
            studentFees: {
                include: {
                    feeStructure: true,
                    payments: true
                }
            },
            wallet: true
        }
    });

    if (!student) {
        return <div>Student record not found</div>;
    }

    // Calculate totals
    const totalFees = student.studentFees.reduce((sum: number, fee: any) => sum + fee.amount, 0);
    // Paid amount - calculated from actual successful payments to ensure accuracy
    // This avoids issues where fee.paidAmount might not be in sync or includes pending attempts
    const totalPaid = student.studentFees.reduce((sum: number, fee: any) => {
        const feePayments = fee.payments || [];
        const validPayments = feePayments.filter((p: any) => p.status === 'COMPLETED' || p.status === 'Paid');
        const paidForFee = validPayments.reduce((pSum: number, p: any) => pSum + p.amount, 0);
        return sum + paidForFee;
    }, 0);
    const totalDiscount = student.studentFees.reduce((sum: number, fee: any) => sum + fee.discount, 0);
    const totalPending = totalFees - totalPaid - totalDiscount;

    // Prepare data for client component
    const allPayments = student.studentFees
        .flatMap((fee: any) => fee.payments || [])
        .sort((a: any, b: any) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });

    const stats = {
        totalFees,
        totalPaid,
        totalPending,
        walletBalance: student.wallet?.balance || 0
    };

    return (
        <StudentFinanceClient
            student={student}
            stats={stats}
            payments={allPayments}
            studentFees={student.studentFees}
        />
    );
}
