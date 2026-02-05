'use client';

import React from 'react';
import { updateStudent } from '@/lib/actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface EditStudentFormProps {
    student: any;
    classes: any[];
}

export function EditStudentForm({ student, classes }: EditStudentFormProps) {
    const router = useRouter();

    const handleSubmit = async (formData: FormData) => {
        const promise = updateStudent(formData);

        toast.promise(promise, {
            loading: 'Updating student details...',
            success: 'Student information updated successfully!',
            error: (err) => `Update failed: ${err.message}`
        });

        try {
            await promise;
            router.refresh();
            router.push('/admin/students');
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    return (
        <form action={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
            <input type="hidden" name="id" value={student.id} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                    <input type="text" name="name" defaultValue={student.user.name || ''} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <input type="email" name="email" defaultValue={student.user.email} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input type="tel" name="phone" defaultValue={student.user.phone || ''} pattern="[0-9]{10}" required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" placeholder="10-digit number" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Admission Number</label>
                    <input type="text" name="admissionNo" defaultValue={student.admissionNo} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Roll Number</label>
                    <input type="text" name="rollNo" defaultValue={student.rollNo || ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Class</label>
                    <select name="classId" defaultValue={student.classId || ''} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select Class</option>
                        {classes.map((c) => (
                            <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Gender</label>
                    <select name="gender" defaultValue={student.gender || ''} required className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date of Birth</label>
                    <input type="date" name="dob" defaultValue={student.dob ? new Date(student.dob).toISOString().split('T')[0] : ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                    <input type="text" name="address" defaultValue={student.address || ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                </div>
            </div>

            {/* Parent Information */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Parent Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Father's Name</label>
                        <input type="text" name="fatherName" defaultValue={student.parent?.fatherName || ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mother's Name</label>
                        <input type="text" name="motherName" defaultValue={student.parent?.motherName || ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parent Phone</label>
                        <input type="tel" name="parentPhone" defaultValue={student.parent?.phone || ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Parent Email</label>
                        <input type="email" name="parentEmail" defaultValue={student.parent?.email || ''} className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500" />
                    </div>
                </div>
            </div>

            {/* File Uploads */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Image</label>
                        {student.user.image && (
                            <div className="mb-2">
                                <img src={student.user.image} alt="Current Profile" className="h-20 w-20 object-cover rounded-full" />
                            </div>
                        )}
                        <input type="file" name="image" accept="image/*" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Documents (PDF/Image)</label>
                        {student.documents && (
                            <div className="mb-2">
                                <a href={student.documents} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Current Document</a>
                            </div>
                        )}
                        <input type="file" name="documents" accept=".pdf,image/*" className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button type="submit" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors">
                    Update Student
                </button>
            </div>
        </form>
    );
}
