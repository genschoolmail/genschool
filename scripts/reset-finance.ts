import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetFinanceData() {
    console.log('⏳ Starting complete finance data reset...');

    try {
        // 1. Delete all Income records
        const incomeDeleted = await prisma.income.deleteMany({});
        console.log(`✅ Deleted ${incomeDeleted.count} Income records`);

        // 2. Delete all Expense records
        const expenseDeleted = await prisma.expense.deleteMany({});
        console.log(`✅ Deleted ${expenseDeleted.count} Expense records`);

        // 3. Delete all Salaries
        const salariesDeleted = await prisma.salary.deleteMany({});
        console.log(`✅ Deleted ${salariesDeleted.count} Salary records`);

        // 4. Delete all FeeRefunds (assuming there's a relation, if not this is safe)
        try {
            const refundsDeleted = await prisma.feeRefund.deleteMany({});
            console.log(`✅ Deleted ${refundsDeleted.count} Fee Refund records`);
        } catch (e: any) {
            console.log(`ℹ️ No FeeRefund table found or error deleting: ${e.message}`);
        }

        // 5. Delete all FeePayments
        const feePaymentsDeleted = await prisma.feePayment.deleteMany({});
        console.log(`✅ Deleted ${feePaymentsDeleted.count} FeePayment records`);

        // 6. Reset all StudentFees to UNPAID and paidAmount to 0
        const studentFeesReset = await prisma.studentFee.updateMany({
            data: {
                status: 'UNPAID',
                paidAmount: 0
            }
        });
        console.log(`✅ Reset ${studentFeesReset.count} StudentFee records back to UNPAID`);

        console.log('🎉 Finance database reset completed successfully!');
    } catch (error) {
        console.error('❌ Error during finance reset:', error);
    } finally {
        await prisma.$disconnect();
    }
}

resetFinanceData();
