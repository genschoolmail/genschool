import { getPayoutsData } from '@/lib/actions/payouts-actions';
import PayoutsClient from './PayoutsClient';
import KYCGate from '@/components/KYCGate';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PayoutsPage() {
    const data = await getPayoutsData();

    return (
        <KYCGate>
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/settings"
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Online Payments & Payouts</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                            Monitor transactions, settlements and gateway configurations
                        </p>
                    </div>
                </div>

                <PayoutsClient
                    initialTransactions={data.transactions}
                    gateways={data.gateways}
                    schoolInfo={data.school}
                />
            </div>
        </KYCGate>
    );
}
