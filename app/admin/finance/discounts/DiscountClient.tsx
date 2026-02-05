'use client';

import React, { useState } from 'react';
import { Search, Percent, Filter, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { applyDiscount } from '@/lib/discount-actions';

interface Student {
    id: string;
    admissionNo: string;
    user: { name: string; email?: string | null };
    class: { name: string; section: string } | null;
    studentFees: StudentFee[];
}

interface StudentFee {
    id: string;
    amount: number;
    paidAmount: number;
    discount: number;
    status: string;
    feeStructure: { name: string };
    discounts: FeeDiscount[];
}

interface FeeDiscount {
    id: string;
    amount: number;
    reason: string;
    createdAt: Date;
}

export default function DiscountClient({
    students,
    initialSearch
}: {
    students: any[]; // Using any to simplify for now, matching interface above manually
    initialSearch: string;
}) {
    const router = useRouter();
    const [search, setSearch] = useState(initialSearch);
    const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
    const [selectedFee, setSelectedFee] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/admin/finance/discounts?search=${search}`);
    };

    const openDiscountModal = (feeId: string) => {
        setSelectedFee(feeId);
        setModalOpen(true);
    };

    const handleApplyDiscount = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await applyDiscount(formData);
            setModalOpen(false);
            // Router refresh handled by server action revalidatePath, 
            // but we might want to refresh to get new data immediately?
            // revalidatePath refreshes server cache, router.refresh updates client.
            // We'll rely on server action revalidatePath or use router.refresh() if needed.
            // Actually server action doesn't trigger client refresh automatically unless returned.
            router.refresh();
        } catch (error) {
            alert('Failed to apply discount');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-slate-700">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name or admission number..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Student List */}
            <div className="space-y-4">
                {students.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        No students found with fee records.
                    </div>
                ) : (
                    students.map((student: Student) => (
                        <div key={student.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div
                                onClick={() => setExpandedStudent(expandedStudent === student.id ? null : student.id)}
                                className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                        {student.user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white">{student.user.name}</h3>
                                        <p className="text-sm text-slate-500">
                                            {student.admissionNo} • Class {student.class?.name}-{student.class?.section}
                                        </p>
                                    </div>
                                </div>
                                {expandedStudent === student.id ? (
                                    <ChevronUp className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-slate-400" />
                                )}
                            </div>

                            {expandedStudent === student.id && (
                                <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-4">
                                    <div className="space-y-4">
                                        {student.studentFees.map((fee) => (
                                            <div key={fee.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-800 dark:text-white">{fee.feeStructure.name}</h4>
                                                        <div className="flex gap-4 mt-2 text-sm text-slate-600 dark:text-slate-400">
                                                            <span>Amount: <b className="text-slate-900 dark:text-white">₹{fee.amount}</b></span>
                                                            <span>Paid: <b className="text-green-600">₹{fee.paidAmount}</b></span>
                                                            <span>Discount: <b className="text-orange-500">₹{fee.discount}</b></span>
                                                        </div>
                                                        <div className="mt-2">
                                                            <span className={`px-2 py-1 rounded text-xs font-medium 
                                                                ${fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                                    fee.status === 'PENDING' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                {fee.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        {fee.status !== 'PAID' && (
                                                            <button
                                                                onClick={() => openDiscountModal(fee.id)}
                                                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2"
                                                            >
                                                                <Percent className="w-4 h-4" />
                                                                Apply Discount
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Discount History */}
                                                {fee.discounts.length > 0 && (
                                                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
                                                        <p className="text-xs font-semibold text-slate-500 mb-2">Discount History</p>
                                                        <div className="space-y-2">
                                                            {fee.discounts.map(d => (
                                                                <div key={d.id} className="text-xs flex justify-between text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 p-2 rounded">
                                                                    <span>{d.reason}</span>
                                                                    <span className="font-medium text-orange-600">-₹{d.amount}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Discount Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Apply Fee Discount</h3>
                        <form action={handleApplyDiscount} className="space-y-4">
                            <input type="hidden" name="studentFeeId" value={selectedFee || ''} />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Discount Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    required
                                    min="1"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter amount"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Reason
                                </label>
                                <textarea
                                    name="reason"
                                    required
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. Merit Scholarship, Sibling Concession"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg font-medium"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Applying...' : 'Apply Discount'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
