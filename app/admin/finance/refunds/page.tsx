import { getAllRefundRequests, getCompletedRefunds } from '@/lib/refund-actions';
import RefundsClient from './RefundsClient';

export default async function AdminRefundsPage() {
    const refundRequests = await getAllRefundRequests('ALL');
    const completedRefunds = await getCompletedRefunds();

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                    Refund Management
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Review requests and view refund history
                </p>
            </div>

            <RefundsClient initialRefunds={refundRequests} completedRefunds={completedRefunds} />
        </div>
    );
}
