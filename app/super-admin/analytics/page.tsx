import { prisma } from '@/lib/prisma';
import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { TrendingUp, Users, School, IndianRupee, Activity } from 'lucide-react';

async function getAnalyticsData() {
    await ensureSuperAdmin();

    const [
        totalSchools,
        totalUsers,
        totalStudents,
        activeSubscriptions,
        recentSchools
    ] = await Promise.all([
        prisma.school.count(),
        prisma.user.count(),
        prisma.student.count(),
        prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        prisma.school.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                subscription: {
                    include: { plan: true }
                }
            }
        })
    ]);

    return {
        totalSchools,
        totalUsers,
        totalStudents,
        activeSubscriptions,
        recentSchools
    };
}

export default async function SuperAdminAnalyticsPage() {
    const data = await getAnalyticsData();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Platform Analytics</h1>
                <p className="text-slate-500 mt-1">Real-time insights across all tenant schools.</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    icon={<School className="w-6 h-6" />}
                    label="Total Schools"
                    value={data.totalSchools}
                    trend="+12% from last month"
                    color="blue"
                />
                <MetricCard
                    icon={<Users className="w-6 h-6" />}
                    label="Total Users"
                    value={data.totalUsers}
                    trend="+8% from last month"
                    color="purple"
                />
                <MetricCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Active Subscriptions"
                    value={data.activeSubscriptions}
                    trend="95% conversion rate"
                    color="green"
                />
                <MetricCard
                    icon={<Activity className="w-6 h-6" />}
                    label="Total Students"
                    value={data.totalStudents}
                    trend="+15% from last month"
                    color="orange"
                />
            </div>

            {/* Recent Schools */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Recently Added Schools</h2>
                <div className="space-y-3">
                    {data.recentSchools.map((school) => (
                        <div key={school.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                    {school.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="font-semibold text-slate-800 dark:text-white">{school.name}</div>
                                    <div className="text-sm text-slate-500">{school.subdomain}.localhost:3000</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                    {school.subscription?.plan?.name || 'Free Trial'}
                                </div>
                                <div className="text-xs text-slate-500">
                                    {new Date(school.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Subscription Distribution Placeholder */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Subscription Distribution</h2>
                <div className="h-64 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <TrendingUp className="w-16 h-16 mx-auto mb-3 opacity-50" />
                        <p>Charts will be implemented with Chart.js/Recharts</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ icon, label, value, trend, color }: {
    icon: React.ReactNode;
    label: string;
    value: number;
    trend: string;
    color: 'blue' | 'purple' | 'green' | 'orange';
}) {
    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        purple: 'from-purple-500 to-purple-600',
        green: 'from-green-500 to-green-600',
        orange: 'from-orange-500 to-orange-600'
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
            <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} text-white mb-4`}>
                {icon}
            </div>
            <div className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{value.toLocaleString()}</div>
            <div className="text-sm text-slate-500 mb-2">{label}</div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium">{trend}</div>
        </div>
    );
}
