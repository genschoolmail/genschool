'use client';

import { useState } from 'react';
import { previewFeeRollover, executeFeeRollover } from '@/lib/actions/fee-rollover';
import { DollarSign, ArrowRight, CheckCircle, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AcademicYear = {
    id: string;
    name: string;
    startDate: Date;
};

type FeePreview = {
    id: string;
    name: string;
    originalAmount: number;
    adjustedAmount: number;
    frequency: string;
    className: string;
};

type Props = {
    toYearId: string;
    toYearName: string;
    previousYears: AcademicYear[];
};

export default function FeeRolloverForm({ toYearId, toYearName, previousYears }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [fromYearId, setFromYearId] = useState('');
    const [adjustmentPercent, setAdjustmentPercent] = useState(0);
    const [previewData, setPreviewData] = useState<any>(null);
    const [selectedFees, setSelectedFees] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGeneratePreview = async () => {
        if (!fromYearId) {
            alert('Please select a source academic year');
            return;
        }

        setLoading(true);
        const result = await previewFeeRollover(fromYearId, toYearId, adjustmentPercent);

        if (result.success && result.preview) {
            setPreviewData(result.preview);
            // Auto-select all fees
            const allFeeIds = result.preview.feeStructures.map((f: FeePreview) => f.id);
            setSelectedFees(allFeeIds);
            setStep(2);
        } else {
            alert(result.error || 'Failed to generate preview');
        }
        setLoading(false);
    };

    const handleExecuteRollover = async () => {
        if (selectedFees.length === 0) {
            alert('Please select at least one fee structure to roll over');
            return;
        }

        if (!confirm(`Roll over ${selectedFees.length} fee structure(s) to ${toYearName}?`)) {
            return;
        }

        setLoading(true);
        const result = await executeFeeRollover(selectedFees, adjustmentPercent, toYearId);

        if (result.success) {
            alert(result.message);
            setStep(3);
            router.refresh();
        } else {
            alert(result.error || 'Failed to execute rollover');
        }
        setLoading(false);
    };

    const toggleFee = (feeId: string) => {
        setSelectedFees(prev =>
            prev.includes(feeId)
                ? prev.filter(id => id !== feeId)
                : [...prev, feeId]
        );
    };

    const toggleAll = () => {
        if (!previewData) return;

        if (selectedFees.length === previewData.feeStructures.length) {
            setSelectedFees([]);
        } else {
            setSelectedFees(previewData.feeStructures.map((f: FeePreview) => f.id));
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Steps Indicator */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-8 max-w-xl mx-auto">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                            1
                        </div>
                        <span className="font-medium">Configure</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                            2
                        </div>
                        <span className="font-medium">Review</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className={`flex items-center gap-2 ${step >= 3 ? 'text-green-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-green-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                            {step >= 3 ? <CheckCircle className="w-5 h-5" /> : '3'}
                        </div>
                        <span className="font-medium">Complete</span>
                    </div>
                </div>
            </div>

            {/* Step 1: Configure */}
            {step === 1 && (
                <div className="p-8">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
                        Configure Fee Rollover
                    </h3>

                    <div className="space-y-6">
                        {/* Source Year */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Roll Over From *
                            </label>
                            <select
                                value={fromYearId}
                                onChange={(e) => setFromYearId(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Source Year</option>
                                {previousYears.map((year) => (
                                    <option key={year.id} value={year.id}>
                                        {year.name}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Select the academic year to copy fee structures from
                            </p>
                        </div>

                        {/* Adjustment Percentage */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Fee Adjustment (%)
                            </label>
                            <input
                                type="number"
                                value={adjustmentPercent}
                                onChange={(e) => setAdjustmentPercent(Number(e.target.value))}
                                step="0.1"
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                Positive for increase, negative for decrease (e.g., 10 for 10% increase)
                            </p>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                                📋 How it works:
                            </h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                                <li>All fee structures from the source year will be copied</li>
                                <li>Amounts will be adjusted by the percentage you specify</li>
                                <li>You can review and select which fees to roll over in the next step</li>
                                <li>Original fees remain unchanged</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            onClick={handleGeneratePreview}
                            disabled={loading || !fromYearId}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating...' : 'Generate Preview'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && previewData && (
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Review Fee Structures
                        </h3>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-indigo-600">
                                {selectedFees.length}
                            </span> of {previewData.totalFees} selected
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">From Year</p>
                                <p className="font-semibold text-slate-800 dark:text-white">{previewData.fromYear}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">To Year</p>
                                <p className="font-semibold text-slate-800 dark:text-white">{previewData.toYear}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 dark:text-slate-400">Adjustment</p>
                                <p className={`font-semibold ${previewData.adjustmentPercent > 0 ? 'text-green-600' :
                                        previewData.adjustmentPercent < 0 ? 'text-red-600' :
                                            'text-slate-800 dark:text-white'
                                    }`}>
                                    {previewData.adjustmentPercent > 0 ? '+' : ''}{previewData.adjustmentPercent}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Fee List */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
                        <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedFees.length === previewData.feeStructures.length}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Select All
                                </span>
                            </label>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-700/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-12"></th>
                                        <th className="px-4 py-3 text-left">Fee Name</th>
                                        <th className="px-4 py-3 text-left">Class</th>
                                        <th className="px-4 py-3 text-left">Frequency</th>
                                        <th className="px-4 py-3 text-right">Original</th>
                                        <th className="px-4 py-3 text-right">New Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.feeStructures.map((fee: FeePreview) => (
                                        <tr
                                            key={fee.id}
                                            className={`border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${selectedFees.includes(fee.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                                                }`}
                                            onClick={() => toggleFee(fee.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedFees.includes(fee.id)}
                                                    onChange={() => toggleFee(fee.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">
                                                {fee.name}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                {fee.className}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                                                {fee.frequency}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-300">
                                                ₹{fee.originalAmount.toLocaleString()}
                                            </td>
                                            <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-white">
                                                ₹{fee.adjustedAmount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleExecuteRollover}
                            disabled={loading || selectedFees.length === 0}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <TrendingUp className="w-5 h-5" />
                            {loading ? 'Rolling Over...' : `Roll Over ${selectedFees.length} Fee(s)`}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Fee Rollover Complete!
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Fee structures have been successfully rolled over to {toYearName}
                    </p>
                    <button
                        onClick={() => router.push('/admin/settings/academic-years')}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                        Back to Academic Years
                    </button>
                </div>
            )}
        </div>
    );
}
