'use client';

import { updateTeacherBasicInfo } from '@/lib/teacher-actions';
import { useFormStatus } from 'react-dom';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={pending}
        >
            {pending ? 'Saving...' : 'Save Changes'}
        </button>
    );
}

export function EditTeacherForm({
    teacherId,
    defaultValues
}: {
    teacherId: string;
    defaultValues: {
        name: string;
        email: string;
        phone?: string;
        designation?: string;
        subject?: string;
        address?: string;
        currentImage?: string;
        currentDocuments?: string;
    }
}) {
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        try {
            await updateTeacherBasicInfo(formData);
            // redirect() throws internally, so toast before calling if needed.
            // But since redirect throws, we show toast optimistically beforehand.
        } catch (err: any) {
            // Next.js redirect() throws a special error — ignore it (it means success)
            if (err?.message?.includes('NEXT_REDIRECT') || err?.digest?.includes('NEXT_REDIRECT')) {
                toast.success('Teacher updated successfully!');
                return;
            }
            toast.error(err?.message || 'Failed to update teacher.');
        }
    }

    return (
        <form action={handleSubmit} className="space-y-8">
            <input type="hidden" name="id" value={teacherId} />

            {/* Basic Info */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            defaultValue={defaultValues.name}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email *</label>
                        <input
                            type="email"
                            name="email"
                            defaultValue={defaultValues.email}
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone</label>
                        <input
                            type="tel"
                            name="phone"
                            defaultValue={defaultValues.phone || ''}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation</label>
                        <input
                            type="text"
                            name="designation"
                            defaultValue={defaultValues.designation || ''}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject Specialization</label>
                        <input
                            type="text"
                            name="subject"
                            defaultValue={defaultValues.subject || ''}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</label>
                        <input
                            type="text"
                            name="address"
                            defaultValue={defaultValues.address || ''}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Profile Image */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Profile Image</h3>

                {defaultValues.currentImage && (
                    <div className="mb-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current Image:</p>
                        <img
                            src={defaultValues.currentImage}
                            alt="Current profile"
                            className="w-32 h-32 object-cover rounded-lg border border-slate-300"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {defaultValues.currentImage ? 'Update Profile Image' : 'Upload Profile Image'}
                    </label>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Upload a new image to replace the current one</p>
                </div>
            </div>

            {/* Documents */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b pb-2">Documents</h3>

                {defaultValues.currentDocuments && (
                    <div className="mb-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Current Documents:</p>
                        <div className="flex flex-wrap gap-2">
                            {defaultValues.currentDocuments.split(',').map((doc, idx) => (
                                <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg">
                                    <span className="text-sm text-slate-700 dark:text-slate-300">
                                        📄 Document {idx + 1}
                                    </span>
                                    <a
                                        href={doc}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                                    >
                                        View
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {defaultValues.currentDocuments ? 'Add More Documents' : 'Upload Documents'}
                    </label>
                    <input
                        type="file"
                        name="documents"
                        multiple
                        accept=".pdf,.doc,.docx"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Upload additional documents (PDF, DOC, DOCX)</p>
                </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
                <a
                    href={`/admin/teachers/${teacherId}`}
                    className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                    Cancel
                </a>
                <SubmitButton />
            </div>
        </form>
    );
}
