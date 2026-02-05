'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Upload, FileCheck, CheckCircle2, Loader2, X } from 'lucide-react';

interface KYCUploadFormProps {
    schoolId: string;
    onSuccess: () => void;
}

export default function KYCUploadForm({ schoolId, onSuccess }: KYCUploadFormProps) {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState<{
        registrationCertificate: File | null;
        bankProof: File | null;
    }>({
        registrationCertificate: null,
        bankProof: null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'registrationCertificate' | 'bankProof') => {
        if (e.target.files?.[0]) {
            setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!files.registrationCertificate || !files.bankProof) {
            toast.error('Please upload both documents');
            return;
        }

        setUploading(true);
        const toastId = toast.loading('Submitting KYC documents...');

        try {
            // Placeholder for submitKYC action
            const formData = new FormData();
            formData.append('registrationCertificate', files.registrationCertificate);
            formData.append('bankProof', files.bankProof);
            formData.append('schoolId', schoolId);

            // Dynamically import to ensure availability
            const { submitKYC } = await import('@/lib/settings-actions');
            const result = await submitKYC(formData);

            if (result.success) {
                toast.success('KYC documents submitted successfully!', { id: toastId });
                onSuccess();
            } else {
                toast.error(result.error || 'Failed to submit KYC', { id: toastId });
            }
        } catch (error) {
            toast.error('An unexpected error occurred', { id: toastId });
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Registration Certificate */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Registration Certificate</label>
                    <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors">
                        {files.registrationCertificate ? (
                            <div className="flex flex-col items-center">
                                <FileCheck className="w-10 h-10 text-green-500 mb-2" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{files.registrationCertificate.name}</span>
                                <button type="button" onClick={() => setFiles({ ...files, registrationCertificate: null })} className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                                <span className="text-xs text-slate-500">Click to upload doc</span>
                                <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'registrationCertificate')} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </>
                        )}
                    </div>
                </div>

                {/* Bank Proof */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Bank Account Proof (Cheque/Passbook)</label>
                    <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors">
                        {files.bankProof ? (
                            <div className="flex flex-col items-center">
                                <FileCheck className="w-10 h-10 text-green-500 mb-2" />
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{files.bankProof.name}</span>
                                <button type="button" onClick={() => setFiles({ ...files, bankProof: null })} className="absolute top-2 right-2 p-1 bg-red-100 text-red-600 rounded-full">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <Upload className="w-10 h-10 text-slate-400 mb-2" />
                                <span className="text-xs text-slate-500">Click to upload doc</span>
                                <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'bankProof')} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={uploading || !files.registrationCertificate || !files.bankProof}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-200 dark:shadow-none disabled:opacity-50"
            >
                {uploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                Submit for Verification
            </button>
        </form>
    );
}
