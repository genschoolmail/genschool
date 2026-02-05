import { Settings, DollarSign, Tag, Calendar, Plus } from 'lucide-react';
import { getAllFeeHeads, getAllFeeCategories, getAllFeeStructures, getFeeSettings, getClassesForConfig } from '@/lib/fee-configuration-actions';
import FeeHeadsList from './FeeHeadsList';
import FeeCategoriesList from './FeeCategoriesList';
import FeeStructuresList from './FeeStructuresList';
import FeeSettingsForm from './FeeSettingsForm';

export default async function SetupPage() {
    const feeHeads = await getAllFeeHeads();
    const feeCategories = await getAllFeeCategories();
    const feeStructures = await getAllFeeStructures();
    const settings = await getFeeSettings();
    const classes = await getClassesForConfig();

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Fee Configuration</h1>
                <p className="text-slate-500 mt-1">Setup fee types, categories, structures and rules</p>
            </div>

            {/* Fee Types & Categories */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fee Heads Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                            <Tag className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Fee Heads</h3>
                            <p className="text-sm text-slate-500">Tuition Fee, Transport Fee, etc.</p>
                        </div>
                    </div>
                    <FeeHeadsList feeHeads={feeHeads} />
                </div>

                {/* Fee Categories Section */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                            <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Fee Categories</h3>
                            <p className="text-sm text-slate-500">Monthly, Annual, Quarterly</p>
                        </div>
                    </div>
                    <FeeCategoriesList feeCategories={feeCategories} />
                </div>
            </div>

            {/* Fee Structures */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <Settings className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Fee Structures</h3>
                        <p className="text-sm text-slate-500">Class-wise fee configurations</p>
                    </div>
                </div>
                <FeeStructuresList feeStructures={feeStructures} classes={classes} feeHeads={feeHeads} />
            </div>

            {/* Fee Settings */}
            <FeeSettingsForm settings={settings} />
        </div>
    );
}
