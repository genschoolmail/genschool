
import { getAllStudentsWithDebt } from '@/lib/debt-actions';
import DebtManagementClient from './DebtManagementClient';

export const metadata = {
    title: 'Debt Management | School Admin',
    description: 'Track and manage student fee dues',
};

export default async function DebtManagementPage() {
    const studentsWithDebt = await getAllStudentsWithDebt();

    return (
        <div className="container mx-auto py-6">
            <div className="flex flex-col gap-2 mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Debt Management</h1>
                <p className="text-muted-foreground">Overview of all outstanding student fees and dues.</p>
            </div>

            <DebtManagementClient students={studentsWithDebt} />
        </div>
    );
}
