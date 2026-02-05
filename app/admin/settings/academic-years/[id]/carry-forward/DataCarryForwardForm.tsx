'use client';

import { useState } from 'react';
import { previewDataCarryForward, executeDataCarryForward } from '@/lib/actions/data-carry-forward';
import { Copy, ArrowRight, CheckCircle, FileText, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AcademicYear = {
    id: string;
    name: string;
};

type SubjectPreview = {
    id: string;
    name: string;
    code: string | null;
    className: string;
    teacherName: string;
};

type Props = {
    toYearId: string;
    toYearName: string;
    previousYears: AcademicYear[];
};

export default function DataCarryForwardForm({ toYearId, toYearName, previousYears }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [fromYearId, setFromYearId] = useState('');
    const [previewData, setPreviewData] = useState<any>(null);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [copyTimetable, setCopyTimetable] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGeneratePreview = async () => {
        if (!fromYearId) {
            alert('Please select a source academic year');
            return;
        }

        setLoading(true);
        const result = await previewDataCarryForward(fromYearId, toYearId);

        if (result.success && result.preview) {
            setPreviewData(result.preview);
            // Auto-select all subjects
            const allSubjectIds = result.preview.subjects.map((s: SubjectPreview) => s.id);
            setSelectedSubjects(allSubjectIds);
            setStep(2);
        } else {
            alert(result.error || 'Failed to generate preview');
        }
        setLoading(false);
    };

    const handleExecute = async () => {
        if (selectedSubjects.length === 0 && !copyTimetable) {
            alert('Please select at least subjects or timetable to copy');
            return;
        }

        const itemsText = [];
        if (selectedSubjects.length > 0) itemsText.push(`${selectedSubjects.length} subject(s)`);
        if (copyTimetable) itemsText.push('timetable');

        if (!confirm(`Copy ${itemsText.join(' and ')} to ${toYearName}?`)) {
            return;
        }

        setLoading(true);
        const result = await executeDataCarryForward(selectedSubjects, copyTimetable, toYearId);

        if (result.success) {
            alert(result.message);
            setStep(3);
            router.refresh();
        } else {
            alert(result.error || 'Failed to execute carry forward');
        }
        setLoading(false);
    };

    const toggleSubject = (subjectId: string) => {
        setSelectedSubjects(prev =>
            prev.includes(subjectId)
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const toggleAll = () => {
        if (!previewData) return;

        if (selectedSubjects.length === previewData.subjects.length) {
            setSelectedSubjects([]);
        } else {
            setSelectedSubjects(previewData.subjects.map((s: SubjectPreview) => s.id));
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Steps */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-center gap-8 max-w-xl mx-auto">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>1</div>
                        <span className="font-medium">Select Source</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>2</div>
                        <span className="font-medium">Review Data</span>
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

            {/* Step 1 */}
            {step === 1 && (
                <div className="p-8">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
                        Select Source Academic Year
                    </h3>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Copy From *
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
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                                📋 What will be copied:
                            </h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                                <li>Subject names, codes, and credits</li>
                                <li>Subject-class assignments</li>
                                <li>Teacher assignments (optional)</li>
                                <li>Timetable structure (optional)</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            onClick={handleGeneratePreview}
                            disabled={loading || !fromYearId}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Generate Preview'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2 */}
            {step === 2 && previewData && (
                <div className="p-8">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
                        Review and Select Data
                    </h3>

                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <p className="text-sm text-blue-600 dark:text-blue-400">Total Subjects</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{previewData.totalSubjects}</p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <p className="text-sm text-purple-600 dark:text-purple-400">Timetable Entries</p>
                            <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{previewData.totalTimetableEntries}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <p className="text-sm text-green-600 dark:text-green-400">Selected</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{selectedSubjects.length}</p>
                        </div>
                    </div>

                    {/* Timetable Option */}
                    <div className="mb-6">
                        <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30">
                            <input
                                type="checkbox"
                                checked={copyTimetable}
                                onChange={(e) => setCopyTimetable(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-slate-800 dark:text-white">Copy Timetable Structure</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Copy all timetable entries ({previewData.totalTimetableEntries} entries)
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Subjects List */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedSubjects.length === previewData.subjects.length}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Select All Subjects
                                </span>
                            </label>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 dark:bg-slate-700/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-12"></th>
                                        <th className="px-4 py-3 text-left">Subject</th>
                                        <th className="px-4 py-3 text-left">Code</th>
                                        <th className="px-4 py-3 text-left">Class</th>
                                        <th className="px-4 py-3 text-left">Teacher</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {previewData.subjects.map((subject: SubjectPreview) => (
                                        <tr
                                            key={subject.id}
                                            className={`border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${selectedSubjects.includes(subject.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                                                }`}
                                            onClick={() => toggleSubject(subject.id)}
                                        >
                                            <td className="px-4 py-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedSubjects.includes(subject.id)}
                                                    onChange={() => toggleSubject(subject.id)}
                                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-4 py-3 font-medium text-slate-800 dark:text-white">{subject.name}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{subject.code || '-'}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{subject.className}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{subject.teacherName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleExecute}
                            disabled={loading || (selectedSubjects.length === 0 && !copyTimetable)}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <Copy className="w-5 h-5" />
                            {loading ? 'Copying...' : 'Execute Copy'}
                        </button>
                    </div>
                </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
                <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                        Data Carry Forward Complete!
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Data has been successfully copied to {toYearName}
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
