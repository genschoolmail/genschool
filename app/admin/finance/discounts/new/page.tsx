import React from 'react';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { createFeeDiscount } from '@/lib/finance-phase2-actions';
import { auth } from '@/auth';
import DiscountFormClient from './DiscountFormClient';

export default async function NewFeeDiscountPage() {
    const session = await auth();

    // Get all students with their fees
    const students = await prisma.student.findMany({
        include: {
            user: true,
            studentFees: {
                include: {
                    feeStructure: true
                }
            }
        }
    });

    // Convert to plain objects for client component
    const studentsData = students.map(s => ({
        id: s.id,
        name: s.user.name || '',
        admissionNo: s.admissionNo,
        fees: s.studentFees.map(f => ({
            id: f.id,
            name: f.feeStructure.name,
            amount: f.amount
        }))
    }));

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Apply Fee Discount/Waiver</h2>
            <DiscountFormClient students={studentsData} userId={session?.user?.id || ''} />
        </div>
    );
}
