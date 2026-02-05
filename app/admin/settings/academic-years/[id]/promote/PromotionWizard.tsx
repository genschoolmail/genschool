'use client';

import { useState } from 'react';
import { previewBulkPromotion, executeBulkPromotion } from '@/lib/actions/promotion';
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Users, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Class = {
    id: string;
    name: string;
    section: string;
    _count: { students: number };
};

type Student = {
    id: string;
    admissionNo: string;
    rollNo: string | null;
    name: string | null;
    attendancePercent: number;
    avgMarks: number;
    isEligible: boolean;
};

type Props = {
    classes: Class[];
    academicYear: string;
};

export default function PromotionWizard({ classes, academicYear }: Props) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [fromClassId, setFromClassId] = useState('');
    const [toClassId, setToClassId] = useState('');
    const [previewData, setPreviewData] = useState<any>(null);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [promotedBy, setPromotedBy] = useState('Admin');
    const [remarks, setRemarks] = useState('');

    const handleGeneratePreview = async () => {
        if (!fromClassId || !toClassId) {
            alert('Please select both source and target classes');
            return;
        }

        setLoading(true);
        const result = await previewBulkPromotion(fromClassId, toClassId, academicYear);

        if (result.success && result.preview) {
            setPreviewData(result.preview);
            // Auto-select all eligible students
            const eligibleIds = result.preview.students
                .filter((s: Student) => s.isEligible)
                .map((s: Student) => s.id);
            setSelectedStudents(eligibleIds);
            setStep(2);
        } else {
            alert(result.error || 'Failed to generate preview');
        }
        setLoading(false);
    };

    const handleExecutePromotion = async () => {
        if (selectedStudents.length === 0) {
            alert('Please select at least one student to promote');
            return;
        }

        if (!confirm(`Promote ${selectedStudents.length} student(s) to ${previewData.toClass}?`)) {
            return;
        }

        setLoading(true);
        const result = await executeBulkPromotion(
            previewData.id,
            selectedStudents,
            academicYear,
            promotedBy,
            remarks
        );

        if (result.success) {
            alert(result.message);
            router.refresh();
            setStep(3);
        } else {
            alert(result.error || 'Failed to execute promotion');
        }
        setLoading(false);
    };

    const toggleStudent = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleAll = () => {
        if (!previewData) return;

        if (selectedStudents.length === previewData.students.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(previewData.students.map((s: Student) => s.id));
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            {/* Steps Indicator */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between max-w-2xl mx-auto">
                    <div className={`flex items-center gap-2 ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                            1
                        </div>
                        <span className="font-medium">Select Classes</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-400" />
                    <div className={`flex items-center gap-2 ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                            }`}>
                            2
                        </div>
                        <span className="font-medium">Review & Select</span>
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

            {/* Step 1: Select Classes */}
            {step === 1 && (
                <div className="p-8">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-6">
                        Select Source and Target Classes
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* From Class */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Promote From Class *
                            </label>
                            <select
                                value={fromClassId}
                                onChange={(e) => setFromClassId(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Source Class</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        Class {cls.name} - {cls.section} ({cls._count.students} students)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* To Class */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Promote To Class *
                            </label>
                            <select
                                value={toClassId}
                                onChange={(e) => setToClassId(e.target.value)}
                                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Select Target Class</option>
                                {classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        Class {cls.name} - {cls.section}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button
                            onClick={handleGeneratePreview}
                            disabled={loading || !fromClassId || !toClassId}
                            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Generating...' : 'Generate Preview'}
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Step 2: Review & Select Students */}
            {step === 2 && previewData && (
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Review Students - {previewData.fromClass} → {previewData.toClass}
                        </h3>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            <span className="font-semibold text-indigo-600">
                                {selectedStudents.length}
                            </span> of {previewData.totalStudents} selected
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <p className="text-sm text-blue-600 dark:text-blue-400">Total Students</p>
                            <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{previewData.totalStudents}</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <p className="text-sm text-green-600 dark:text-green-400">Eligible</p>
                            <p className="text-2xl font-bold text-green-700 dark:text-green-300">{previewData.eligibleStudents}</p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                            <p className="text-sm text-red-600 dark:text-red-400">Ineligible</p>
                            <p className="text-2xl font-bold text-red-700 dark:text-red-300">{previewData.ineligibleCount}</p>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden mb-6">
                        <div className="bg-slate-50 dark:bg-slate-700/50 px-4 py-3 flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedStudents.length === previewData.students.length}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Select All
                                </span>
                            </label>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {previewData.students.map((student: Student) => (
                                <div
                                    key={student.id}
                                    className={`px-4 py-3 border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer ${selectedStudents.includes(student.id) ? 'bg-indigo-50 dark:bg-indigo-900/10' : ''
                                        }`}
                                    onClick={() => toggleStudent(student.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => toggleStudent(student.id)}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-800 dark:text-white">
                                                {student.name || 'N/A'}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {student.admissionNo} {student.rollNo ? `| Roll: ${student.rollNo}` : ''}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <div className="text-center">
                                                <p className="text-slate-500 dark:text-slate-400">Attendance</p>
                                                <p className="font-semibold text-slate-800 dark:text-white">
                                                    {student.attendancePercent}%
                                                </p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-slate-500 dark:text-slate-400">Avg Marks</p>
                                                <p className="font-semibold text-slate-800 dark:text-white">
                                                    {student.avgMarks}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Additional Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Promoted By
                            </label>
                            <input
                                type="text"
                                value={promotedBy}
                                onChange={(e) => setPromotedBy(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Remarks (Optional)
                            </label>
                            <input
                                type="text"
                                value={remarks}
                                onChange={(e) => setRemarks(e.target.value)}
                                placeholder="Year-end promotion 2024-2025"
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between">
                        <button
                            onClick={() => setStep(1)}
                            className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                        <button
                            onClick={handleExecutePromotion}
                            disabled={loading || selectedStudents.length === 0}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <TrendingUp className="w-5 h-5" />
                            {loading ? 'Promoting...' : `Promote ${selectedStudents.length} Student(s)`}
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
                        Promotion Successful!
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Students have been promoted successfully
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
