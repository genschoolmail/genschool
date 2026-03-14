import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Financial Data Audit ---');
  
  const incomeRecords = await prisma.income.findMany();
  console.log('Income Records:', incomeRecords.map(i => ({ source: i.source, amount: i.amount, description: i.description })));

  const payments = await prisma.feePayment.findMany({
    where: {
      status: { in: ['PAID', 'SUCCESS', 'COMPLETED'] }
    }
  });
  console.log('Valid FeePayments:', payments.map(p => ({ status: p.status, amount: p.amount, method: p.method, id: p.id })));

  const unlinked = payments.filter(p => !incomeRecords.some(i => i.feePaymentId === p.id));
  console.log('Unlinked Payments count:', unlinked.length);
  if (unlinked.length > 0) {
    console.log('Unlinked Details:', unlinked.map(u => ({ id: u.id, amount: u.amount, status: u.status })));
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
