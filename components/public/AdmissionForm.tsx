'use client';

import { useState } from 'react';
import { submitAdmissionEnquiry } from '@/lib/actions/public';
import { Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdmissionForm({ schoolId }: { schoolId: string }) {
    const [status, setStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');

    const handleSubmit = async (formData: FormData) => {
        setStatus('LOADING');
        try {
            // Append schoolId if not present (though we can pass it as hidden input)
            formData.append('schoolId', schoolId);

            const result = await submitAdmissionEnquiry(formData);

            if (result.success) {
                setStatus('SUCCESS');
                setMessage(result.message || 'Submitted successfully!');
                // Reset form? 
                (document.getElementById('enquiryForm') as HTMLFormElement)?.reset();
            } else {
                setStatus('ERROR');
                setMessage(result.message || 'Something went wrong.');
            }
        } catch (error) {
            setStatus('ERROR');
            setMessage('Failed to submit enquiry.');
        }
    };

    if (status === 'SUCCESS') {
        return (
            <div className="bg-emerald-50 rounded-2xl p-8 text-center space-y-4 border border-emerald-100 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Enquiry Received!</h3>
                <p className="text-slate-600">
                    Thank you for your interest. Our admissions team will review your enquiry and contact you shortly.
                </p>
                <button
                    onClick={() => setStatus('IDLE')}
                    className="text-emerald-700 font-bold hover:underline"
                >
                    Send another enquiry
                </button>
            </div>
        );
    }

    return (
        <form id="enquiryForm" action={handleSubmit} className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Student Name</label>
                    <input name="studentName" required type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Enter student name" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Class</label>
                    <input name="class" type="text" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Grade/Class" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Phone Number</label>
                    <input name="phone" required type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Enter contact number" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Email Address</label>
                    <input name="email" type="email" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Enter email address" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Additional Message</label>
                <textarea name="message" rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" placeholder="Any specific requirements?"></textarea>
            </div>

            {status === 'ERROR' && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={status === 'LOADING'}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {status === 'LOADING' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                {status === 'LOADING' ? 'Submitting...' : 'Submit Enquiry'}
            </button>
        </form>
    );
}
