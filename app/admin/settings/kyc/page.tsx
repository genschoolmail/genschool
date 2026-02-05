'use client';

import React, { useState, useEffect } from 'react';
import { FileCheck, Upload, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getKYCStatus } from '@/lib/settings-actions';
import KYCUploadForm from './KYCUploadForm';

export default function KYCPage() {
    const [kycData, setKycData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchStatus = async () => {
        try {
            const data = await getKYCStatus();
            setKycData(data);
        } catch (error) {
            console.error("Error fetching KYC status:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-rose-600" />
            </div>
        );
    }

    const statusColors: any = {
        'VERIFIED': 'text-green-600',
        'SUBMITTED': 'text-yellow-600',
        'PENDING': 'text-orange-600',
        'REJECTED': 'text-red-600',
    };

    const statusBg: any = {
        'VERIFIED': 'bg-green-100 dark:bg-green-900/30',
        'SUBMITTED': 'bg-yellow-100 dark:bg-yellow-900/30',
        'PENDING': 'bg-orange-100 dark:bg-orange-900/30',
        'REJECTED': 'bg-red-100 dark:bg-red-900/30',
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileCheck className="w-7 h-7 text-rose-600" />
                    KYC & Verification
                </h1>
                <p className="text-slate-500 mt-1">Upload documents for school verification and compliance</p>
            </div>

            {kycData && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-blue-600 rounded-xl">
                            {kycData.kycStatus === 'VERIFIED' ? (
                                <CheckCircle className="w-6 h-6 text-white" />
                            ) : kycData.kycStatus === 'SUBMITTED' ? (
                                <Clock className="w-6 h-6 text-white" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-white" />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Verification Status</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300">
                                {kycData.kycStatus === 'VERIFIED' ? 'Your school is fully verified.' :
                                    kycData.kycStatus === 'SUBMITTED' ? 'Documents are under review.' :
                                        'Please upload documents for verification.'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <span className={`px-4 py-2 ${statusBg[kycData.kycStatus]} ${statusColors[kycData.kycStatus]} rounded-lg font-bold`}>
                            {kycData.kycStatus}
                        </span>
                    </div>
                </div>
            )}

            {kycData?.kycStatus === 'PENDING' || kycData?.kycStatus === 'REJECTED' ? (
                <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Submit Documents</h2>
                    <KYCUploadForm schoolId={kycData?.id || ''} onSuccess={fetchStatus} />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 opacity-80">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                                    <FileCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Registration Certificate</h3>
                                    <p className="text-sm text-slate-500">School registration document</p>
                                </div>
                            </div>
                            {kycData?.kycStatus === 'VERIFIED' && <CheckCircle className="w-6 h-6 text-green-600" />}
                        </div>
                        <div className={`p-4 rounded-lg bg-green-50 dark:bg-green-900/20`}>
                            <p className={`text-sm font-medium text-green-700 dark:text-green-400`}>
                                Document Secured
                            </p>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <FileCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Bank Account Proof</h3>
                                    <p className="text-sm text-slate-500">Cancelled cheque/passbook</p>
                                </div>
                            </div>
                            {kycData?.bankDetailsVerified && <CheckCircle className="w-6 h-6 text-green-600" />}
                        </div>
                        <div className={`p-4 rounded-lg bg-green-50 dark:bg-green-900/20`}>
                            <p className={`text-sm font-medium text-green-700 dark:text-green-400`}>
                                Verified Account details
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
