import { getKYCStatus } from '@/lib/settings-actions';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, FileCheck } from 'lucide-react';

export default async function KYCGate({ children }: { children: React.ReactNode }) {
    const kycData = await getKYCStatus();

    if (kycData?.kycStatus !== 'VERIFIED') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] p-8 bg-white dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-20 h-20 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-10 h-10 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">KYC Verification Required</h2>
                <p className="text-slate-500 text-center max-w-md mb-8 leading-relaxed">
                    To access Marketplace, Settlements, and Student Online Payments, your school must complete the identity verification process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                    <Link
                        href="/admin/settings/kyc"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-200 dark:shadow-none"
                    >
                        <FileCheck className="w-5 h-5" />
                        Complete KYC
                    </Link>
                    <Link
                        href="/admin/settings"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all"
                    >
                        Go Back
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
                <p className="mt-8 text-xs text-slate-400 font-medium uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                    Current Status: <span className={`text-rose-600 font-black`}>{kycData?.kycStatus || 'PENDING'}</span>
                </p>
            </div>
        );
    }

    return <>{children}</>;
}
