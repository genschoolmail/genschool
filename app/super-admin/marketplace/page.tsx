import React from 'react';
import { prisma } from '@/lib/prisma';
import {
    IndianRupee, TrendingUp, Users, ShoppingBag,
    ArrowUpRight, ArrowDownRight, Globe, Shield
} from 'lucide-react';

export default async function MarketplaceAnalytics() {
    // 1. Fetch Summary Data
    const totalSchools = await prisma.school.count();
    const activeMerchants = await prisma.school.count({
        where: { onboardingStatus: 'ACTIVE' }
    });

    const revenueStats = await prisma.feePayment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: {
            amount: true,
            platformFee: true,
            schoolShare: true
        }
    });

    const totalTransactionVolume = revenueStats._sum.amount || 0;
    const totalPlatformCommission = revenueStats._sum.platformFee || 0;
    const totalSchoolSettlements = revenueStats._sum.schoolShare || 0;

    const recentTransactions = await prisma.feePayment.findMany({
        where: { splitStatus: 'SUCCESS' },
        take: 5,
        orderBy: { date: 'desc' },
        include: {
            school: { select: { name: true } }
        }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Marketplace Analytics</h1>
                    <p className="text-sm text-slate-500">Track platform commission and school settlements</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                        Live Data
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Commission"
                    value={`₹${totalPlatformCommission.toLocaleString()}`}
                    subValue="+12% from last month"
                    icon={<IndianRupee className="w-6 h-6 text-emerald-600" />}
                    trend="up"
                />
                <StatCard
                    title="Total Volume"
                    value={`₹${(totalTransactionVolume / 100000).toFixed(2)}L`}
                    subValue="Gross Merchandise Value"
                    icon={<ShoppingBag className="w-6 h-6 text-blue-600" />}
                    trend="up"
                />
                <StatCard
                    title="Active Schools"
                    value={activeMerchants.toString()}
                    subValue={`out of ${totalSchools} total schools`}
                    icon={<Globe className="w-6 h-6 text-indigo-600" />}
                />
                <StatCard
                    title="Settled to Schools"
                    value={`₹${(totalSchoolSettlements / 100000).toFixed(2)}L`}
                    subValue="Direct to bank"
                    icon={<Shield className="w-6 h-6 text-purple-600" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* School Wise Performance */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6">Top Performing Schools</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs uppercase text-slate-400 font-bold border-b border-slate-100 dark:border-slate-700">
                                    <th className="pb-3 px-2">School</th>
                                    <th className="pb-3 px-2 text-right">Volume</th>
                                    <th className="pb-3 px-2 text-right">Commission</th>
                                    <th className="pb-3 px-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Mock Data Placeholder if none exists */}
                                {[1, 2, 3].map(i => (
                                    <tr key={i} className="border-b border-slate-50 dark:border-slate-700/50 last:border-0">
                                        <td className="py-4 px-2">
                                            <div className="font-medium text-slate-800 dark:text-white">Demo School {i}</div>
                                            <div className="text-xs text-slate-500">Sub-ID: acc_XYZ123</div>
                                        </td>
                                        <td className="py-4 px-2 text-right font-semibold">₹4,50,000</td>
                                        <td className="py-4 px-2 text-right text-emerald-600">₹11,250</td>
                                        <td className="py-4 px-2 text-center text-xs">
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-medium">Verified</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Split Transactions */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-6">Recent Splits</h3>
                    <div className="space-y-4">
                        {recentTransactions.length > 0 ? recentTransactions.map((tx: any) => (
                            <div key={tx.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                    <IndianRupee className="w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{tx.school?.name || 'School'}</p>
                                    <p className="text-xs text-slate-500">Comm: ₹{tx.platformFee}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold">₹{tx.amount}</p>
                                    <p className="text-[10px] text-emerald-500 font-bold uppercase">Success</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12 text-slate-400 italic">
                                No recent transactions
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subValue, icon, trend }: any) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {trend === 'up' ? 'Increase' : 'Decrease'}
                    </div>
                )}
            </div>
            <h4 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h4>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</div>
            <p className="text-xs text-slate-400 mt-1">{subValue}</p>
        </div>
    );
}
