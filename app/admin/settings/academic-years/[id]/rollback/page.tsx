import { getRecentPromotions, rollbackPromotion } from '@/lib/promotion-actions';
import { getAcademicYear } from '@/lib/actions/academic-year';
import { ArrowLeft, RotateCcw, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function RollbackPage({ params }: { params: { id: string } }) {
    const academicYear = await getAcademicYear(params.id);

    if (!academicYear) {
        redirect('/admin/settings/academic-years');
    }

    const promotionsResult = await getRecentPromotions(params.id);
    const promotions = promotionsResult.success ? promotionsResult.promotions : [];

    async function handleRollback(formData: FormData) {
        'use server';
        const promotionId = formData.get('promotionId') as string;
        await rollbackPromotion([promotionId]);
        redirect(`/admin/settings/academic-years/${params.id}/rollback`);
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href={`/admin/settings/academic-years/${params.id}`}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <RotateCcw className="w-8 h-8 text-red-600" />
                        Rollback Promotions
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Undo recent student promotions for {academicYear.name}
                    </p>
                </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                <div className="text-sm text-red-700 dark:text-red-300">
                    <p className="font-bold mb-1">Warning: Destructive Action</p>
                    <p>Rolling back a promotion will revert students to their previous class. This action cannot be undone. Please ensure you are rolling back the correct promotion batch.</p>
                </div>
            </div>

            {/* Promotions List */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Recent Promotions</h2>
                </div>

                {promotions.length > 0 ? (
                    <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {promotions.map((promo: any) => (
                            <div key={promo.id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-slate-800 dark:text-white">
                                            {promo.student.name}
                                        </span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-sm text-slate-500 dark:text-slate-400">
                                            {new Date(promo.promotedAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                        <span>{promo.fromClass.name}-{promo.fromClass.section}</span>
                                        <span>→</span>
                                        <span>{promo.toClass.name}-{promo.toClass.section}</span>
                                    </div>
                                    {promo.isRolledBack && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 px-2 py-0.5 rounded mt-2">
                                            Rolled Back
                                        </span>
                                    )}
                                </div>

                                {!promo.isRolledBack && (
                                    <form action={handleRollback}>
                                        <input type="hidden" name="promotionId" value={promo.id} />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Rollback
                                        </button>
                                    </form>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-500 dark:text-slate-400">
                        No promotion history found for this academic year.
                    </div>
                )}
            </div>
        </div>
    );
}
