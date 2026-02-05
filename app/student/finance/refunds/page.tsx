import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getStudentRefunds } from '@/lib/refund-actions';
import StudentRefundClient from './StudentRefundClient';

export default async function StudentRefundsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const refunds = await getStudentRefunds(session.user.id);

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                    Refund Requests
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Request refunds for eligible fee payments
                </p>
            </div>

            <StudentRefundClient userId={session.user.id} initialRefunds={refunds} />
        </div>
    );
}
