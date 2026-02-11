'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitPlatformEnquiry } from '@/lib/actions/platform-enquiry';
import { X, Loader2, Send, CheckCircle2 } from 'lucide-react';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-orange-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
            {pending ? (
                <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Submitting...
                </>
            ) : (
                <>
                    Submit Enquiry <Send className="w-5 h-5" />
                </>
            )}
        </button>
    );
}

export default function TrialEnquiryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [state, formAction] = useFormState(submitPlatformEnquiry, {});

    if (!isOpen) return null;

    if (state.success) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl items-center text-center relative animate-in zoom-in-95 duration-200">
                    <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-2">Thank You!</h3>
                    <p className="text-slate-600 mb-6">
                        We have received your enquiry. Our team will contact you shortly to set up your free trial.
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors">
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-8">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Start Free Trial</h2>
                    <p className="text-slate-500">Fill the form below to get started with Gen School Mail.</p>
                </div>

                <form action={formAction} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Full Name</label>
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium"
                                placeholder="John Doe"
                            />
                            {state.errors?.name && <p className="text-red-500 text-xs font-semibold">{state.errors.name[0]}</p>}
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700">Mobile Number</label>
                            <input
                                name="mobile"
                                type="tel"
                                required
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium"
                                placeholder="+91 9876543210"
                            />
                            {state.errors?.mobile && <p className="text-red-500 text-xs font-semibold">{state.errors.mobile[0]}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">School Name</label>
                        <input
                            name="schoolName"
                            type="text"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium"
                            placeholder="Ex. Global International School"
                        />
                        {state.errors?.schoolName && <p className="text-red-500 text-xs font-semibold">{state.errors.schoolName[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium"
                            placeholder="admin@school.com"
                        />
                        {state.errors?.email && <p className="text-red-500 text-xs font-semibold">{state.errors.email[0]}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700">Message (Optional)</label>
                        <textarea
                            name="message"
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all font-medium resize-none"
                            placeholder="Tell us about your requirements..."
                        />
                    </div>

                    {state.error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold flex items-center gap-2">
                            <X className="w-4 h-4" /> {state.error}
                        </div>
                    )}

                    <SubmitButton />

                    <p className="text-xs text-center text-slate-400 font-medium">
                        By submitting, you agree to be contacted by our sales team.
                    </p>
                </form>
            </div>
        </div>
    );
}
