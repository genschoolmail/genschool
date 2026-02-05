import { prisma } from '@/lib/prisma';
import { Clock, CreditCard, CheckCircle, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';

async function getSubscriptions() {
    return await prisma.subscription.findMany({
        include: {
            school: true,
            plan: true
        },
        orderBy: { startDate: 'desc' }
    });
}

export default async function SubscriptionsPage() {
    const subscriptions = await getSubscriptions();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Subscriptions</h1>
                    <p className="text-slate-500 text-sm sm:text-base">Manage school subscriptions and billing cycles.</p>
                </div>
                <Link
                    href="/super-admin/subscriptions/plans"
                    className="flex items-center px-4 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors w-full sm:w-auto justify-center text-sm font-semibold"
                >
                    <Settings className="w-5 h-5 mr-2" />
                    Manage Plans
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left bg-transparent min-w-[700px]">
                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium">
                            <tr>
                                <th className="px-4 py-4 text-xs sm:text-sm">School</th>
                                <th className="px-4 py-4 text-xs sm:text-sm">Plan</th>
                                <th className="px-4 py-4 text-xs sm:text-sm hidden sm:table-cell">Status</th>
                                <th className="px-4 py-4 text-xs sm:text-sm hidden md:table-cell">Start Date</th>
                                <th className="px-4 py-4 text-xs sm:text-sm hidden lg:table-cell">End Date</th>
                                <th className="px-4 py-4 text-right text-xs sm:text-sm">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {subscriptions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                        No active subscriptions found.
                                    </td>
                                </tr>
                            ) : (
                                subscriptions.map((sub) => (
                                    <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/25 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-800 dark:text-white text-sm">
                                                {sub.school.name}
                                            </div>
                                            <div className="text-[10px] sm:text-xs text-slate-500">
                                                {sub.school.subdomain}.genschoolmail.in
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 w-fit">
                                                    {sub.plan?.name || 'Unknown Plan'}
                                                </span>
                                                <div className="sm:hidden mt-1">
                                                    <StatusBadge status={sub.status} />
                                                </div>
                                                {sub.priceOverride !== null && sub.priceOverride !== undefined && (
                                                    <span className="text-[9px] text-amber-600 font-bold mt-1 uppercase tracking-wider">
                                                        Custom Price
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 hidden sm:table-cell">
                                            <StatusBadge status={sub.status} />
                                        </td>
                                        <td className="px-4 py-4 text-xs sm:text-sm text-slate-500 hidden md:table-cell">
                                            {new Date(sub.startDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 text-xs sm:text-sm text-slate-500 hidden lg:table-cell">
                                            {new Date(sub.endDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <Link
                                                href={`/super-admin/subscriptions/${sub.id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-500 text-xs sm:text-sm font-semibold"
                                            >
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    if (status === 'ACTIVE') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
            </span>
        );
    }
    if (status === 'TRIAL') {
        return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="w-3 h-3 mr-1" />
                Trial
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {status}
        </span>
    );
}
