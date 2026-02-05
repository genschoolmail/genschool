'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { createTeacher } from '@/lib/teacher-actions';
import { Loader2, Save, User, Mail, Lock, Phone, MapPin, BookOpen, Briefcase, Upload } from 'lucide-react';
import { BackButton } from '@/components/BackButton';
import { FormInput } from '@/components/ui/FormInput';
import { FormSelect } from '@/components/ui/FormSelect';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                </>
            ) : (
                <>
                    <Save className="w-5 h-5" />
                    Create Teacher
                </>
            )}
        </button>
    );
}

export default function NewTeacherForm() {
    const [error, setError] = useState<string | null>(null);

    async function clientAction(formData: FormData) {
        const result = await createTeacher(formData);
        if (result?.error) {
            setError(result.error);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-24">
            <div className="flex items-center gap-4 mb-6">
                <BackButton href="/admin/teachers" />
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">Add New Teacher</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Create a new teacher account and profile
                    </p>
                </div>
            </div>

            <form action={clientAction} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-medium border-b border-red-100 dark:border-red-900/50">
                        {error}
                    </div>
                )}

                <div className="p-6 space-y-8">
                    {/* Account Information */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            Account Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Full Name *"
                                name="name"
                                required
                                placeholder="John Doe"
                                icon={<User className="w-4 h-4" />}
                            />

                            <FormInput
                                label="Email Address *"
                                type="email"
                                name="email"
                                required
                                placeholder="john@school.com"
                                icon={<Mail className="w-4 h-4" />}
                            />

                            <FormInput
                                label="Password *"
                                type="password"
                                name="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                icon={<Lock className="w-4 h-4" />}
                                helperText="Must be at least 6 characters"
                            />
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {/* Professional Details */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Briefcase className="w-5 h-5 text-indigo-600" />
                            Professional Details
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormSelect
                                label="Designation"
                                name="designation"
                                icon={<Briefcase className="w-4 h-4" />}
                            >
                                <option value="">Select Designation</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Senior Teacher">Senior Teacher</option>
                                <option value="Head Teacher">Head Teacher</option>
                                <option value="Assistant Teacher">Assistant Teacher</option>
                            </FormSelect>

                            <FormInput
                                label="Subject Specialization"
                                name="subject"
                                placeholder="e.g. Mathematics"
                                icon={<BookOpen className="w-4 h-4" />}
                            />

                            <FormInput
                                label="Phone Number"
                                type="tel"
                                name="phone"
                                placeholder="+91 98765 43210"
                                icon={<Phone className="w-4 h-4" />}
                            />
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {/* Address */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                            Address
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Full Address
                            </label>
                            <textarea
                                name="address"
                                rows={3}
                                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-base"
                                placeholder="Enter full residential address..."
                            />
                        </div>
                    </section>

                    <div className="h-px bg-slate-200 dark:bg-slate-700" />

                    {/* Documents */}
                    <section className="space-y-4">
                        <h2 className="text-lg font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                            <Upload className="w-5 h-5 text-indigo-600" />
                            Documents & Profile
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                label="Profile Image"
                                type="file"
                                name="image"
                                accept="image/*"
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                            />

                            <FormInput
                                label="Documents (Resume, ID, etc.)"
                                type="file"
                                name="documents"
                                multiple
                                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                            />
                        </div>
                    </section>
                </div>

                {/* Sticky Submit Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-700 z-40 md:static md:bg-transparent md:border-0 md:p-6 md:pt-0 md:flex md:justify-end">
                    <div className="max-w-4xl mx-auto md:mx-0 w-full md:w-auto flex gap-4">
                        <SubmitButton />
                    </div>
                </div>
            </form>
        </div>
    );
}
