'use client';

import React from 'react';
import { X, ArrowRight, Users, AlertCircle } from 'lucide-react';

interface Student {
    id: string;
    admissionNo: string;
    user: { name: string };
    rollNo: string | null;
}

interface PromotionPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    students: Student[];
    fromClass: { name: string; section: string };
    toClass: { name: string; section: string };
    academicYear: string;
    promotedBy: string;
    loading: boolean;
}

export function PromotionPreview({
    isOpen,
    onClose,
    onConfirm,
    students,
    fromClass,
    toClass,
    academicYear,
    promotedBy,
    loading
}: PromotionPreviewProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Confirm Promotion</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400">Please review before proceeding</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    </button>
                </div>

                {/* Summary */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">From Class</p>
                            <p className="font-semibold text-slate-800 dark:text-white">
                                {fromClass.name} - {fromClass.section}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">To Class</p>
                            <p className="font-semibold text-slate-800 dark:text-white">
                                {toClass.name} - {toClass.section}
                            </p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Academic Year</p>
                            <p className="font-semibold text-slate-800 dark:text-white">{academicYear}</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Promoted By</p>
                            <p className="font-semibold text-slate-800 dark:text-white">{promotedBy}</p>
                        </div>
                    </div>

                    <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center gap-3">
                        <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        <div>
                            <p className="font-semibold text-slate-800 dark:text-white">
                                {students.length} Student{students.length !== 1 ? 's' : ''} Selected
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                All selected students will be promoted to {toClass.name}-{toClass.section}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Student List */}
                <div className="p-6 max-h-64 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Students to be Promoted:
                    </h3>
                    <div className="space-y-2">
                        {students.map((student, index) => (
                            <div
                                key={student.id}
                                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full font-semibold text-sm">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-white">{student.user.name}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Admission: {student.admissionNo}
                                        </p>
                                    </div>
                                </div>
                                <ArrowRight className="w-4 h-4 text-slate-400" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Warning */}
                <div className="px-6 pb-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm text-amber-800 dark:text-amber-200">
                            <strong>Note:</strong> This action will permanently move students to the new class.
                            Make sure all details are correct before confirming.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Promoting...
                            </>
                        ) : (
                            <>
                                Confirm Promotion
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
