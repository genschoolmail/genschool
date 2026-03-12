'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function registerSchoolBankAccount(schoolId: string, formData: FormData) {
    try {
        const accountName = formData.get('accountName') as string;
        const accountNumber = formData.get('accountNumber') as string;
        const ifsc = formData.get('ifsc') as string;
        const commissionPercentage = parseFloat(formData.get('commissionPercentage') as string || '2.5');
        // Super Admin manually pastes the acc_XXXXX ID from Razorpay dashboard
        const razorpayLinkedAccountId = (formData.get('razorpayLinkedAccountId') as string || '').trim();

        if (!accountName || !accountNumber || !ifsc) {
            return { success: false, error: 'Account Name, Account Number, and IFSC are required.' };
        }

        // Validate acc_ format if provided
        if (razorpayLinkedAccountId && !razorpayLinkedAccountId.startsWith('acc_')) {
            return { success: false, error: 'Razorpay Linked Account ID must start with "acc_". Please copy it from Razorpay Dashboard → Route → Accounts.' };
        }

        const bankDetails = JSON.stringify({
            accountName,
            accountNumber: accountNumber.replace(/.(?=.{4})/g, 'x'), // Mask all but last 4 digits
            ifsc
        });

        await prisma.school.update({
            where: { id: schoolId },
            data: {
                bankDetails,
                subMerchantId: razorpayLinkedAccountId || null,
                commissionPercentage
            }
        });

        revalidatePath(`/super-admin/schools/${schoolId}`);
        return {
            success: true,
            message: razorpayLinkedAccountId
                ? `Bank account registered and linked to Razorpay (${razorpayLinkedAccountId}) ✓`
                : 'Bank account saved. Add Razorpay Linked Account ID to enable automatic settlements.'
        };

    } catch (error: any) {
        console.error('Failed to register school bank account:', error);
        return { success: false, error: error.message || 'Something went wrong.' };
    }
}
