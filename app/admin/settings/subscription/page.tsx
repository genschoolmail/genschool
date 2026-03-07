import { getSchoolSubscriptionStatus, getAllPlans } from '@/lib/actions/subscription-actions';
import { getSchoolInfo } from '@/lib/schoolInfo';
import SubscriptionClient from './SubscriptionClient';
import BackButton from '@/components/ui/BackButton';

export default async function SubscriptionPage() {
    const status = await getSchoolSubscriptionStatus();
    const plans = await getAllPlans();
    const schoolInfo = await getSchoolInfo();

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <BackButton href="/admin/settings" />
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Subscription & Billing</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Manage your school's platform subscription and view available plans.
                    </p>
                </div>
            </div>

            <SubscriptionClient
                initialStatus={status}
                plans={plans}
                schoolInfo={schoolInfo}
            />
        </div>
    );
}
