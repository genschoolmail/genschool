'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFeeDiscount } from '@/lib/finance-phase2-actions';

type StudentData = {
    id: string;
    name: string;
    admissionNo: string;
    fees: {
        id: string;
        name: string;
        amount: number;
    }[];
};

export default function DiscountFormClient({ students, userId }: { students: StudentData[], userId: string }) {
    const router = useRouter();
    const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

    return (
        <form action={async (formData) => {
            formData.append('approvedBy', userId);
            await createFeeDiscount(formData);
            router.push('/admin/finance/discounts');
        }} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Select Student *
                    </label>
                    <select
                        name="studentId"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        onChange={(e) => {
                            const student = students.find(s => s.id === e.target.value);
                            setSelectedStudent(student || null);
                        }}
                    >
                        <option value="">Select Student</option>
                        {students.map(student => (
                            <option key={student.id} value={student.id}>
                                {student.name} ({student.admissionNo})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Select Fee Structure *
                    </label>
                    <select
                        name="studentFeeId"
                        required
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        disabled={!selectedStudent}
                    >
                        <option value="">Select Fee</option>
                        {selectedStudent?.fees.map(fee => (
                            <option key={fee.id} value={fee.id}>
                                {fee.name} - ₹{fee.amount.toLocaleString()}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Discount Amount * (₹)
                    </label>
                    <input
                        type="number"
                        name="amount"
                        required
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        placeholder="Enter discount amount"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Reason for Discount/Waiver *
                    </label>
                    <textarea
                        name="reason"
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
                        placeholder="e.g., Merit scholarship, Financial assistance, Sibling discount"
                    ></textarea>
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    Apply Discount
                </button>
                <a
                    href="/admin/finance/discounts"
                    className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-700"
                >
                    Cancel
                </a>
            </div>
        </form>
    );
}
