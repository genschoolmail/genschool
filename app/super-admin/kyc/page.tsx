import { prisma } from '@/lib/prisma';
import { ensureSuperAdmin, approveKYC, rejectKYC } from '@/lib/actions/super-admin';
import { revalidatePath } from 'next/cache';
import { FileCheck, CheckCircle, XCircle, Clock, ExternalLink, Shield } from 'lucide-react';

export default async function KYCDashboard() {
    await ensureSuperAdmin();

    const schools = await prisma.school.findMany({
        where: {
            kycStatus: { in: ['SUBMITTED', 'REJECTED'] }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Shield className="w-10 h-10 text-indigo-600" />
                        KYC Verification Center
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Process school identity verification requests and compliance documents.</p>
                </div>
                <div className="flex items-center gap-4 bg-indigo-50 dark:bg-indigo-900/30 px-6 py-4 rounded-2xl">
                    <div className="text-center">
                        <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{schools.filter(s => s.kycStatus === 'SUBMITTED').length}</div>
                        <div className="text-xs uppercase font-bold text-slate-500">Pending Review</div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50/50 dark:bg-slate-700/50 text-slate-500 font-bold text-xs uppercase tracking-widest border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <th className="px-8 py-5">School Identity</th>
                                <th className="px-8 py-5">Submission Date</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5">Documents</th>
                                <th className="px-8 py-5 text-right">Administrative Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {schools.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                                                <CheckCircle className="w-12 h-12 text-slate-300" />
                                            </div>
                                            <p className="text-slate-500 font-medium">No pending verification requests at the moment.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                schools.map((school) => (
                                    <tr key={school.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 dark:text-white text-lg">{school.name}</span>
                                                <span className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-700 w-fit px-2 py-0.5 rounded mt-1 font-mono uppercase">{school.schoolId || 'UNASSIGNED'}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-slate-600 dark:text-slate-400 font-medium">
                                            {new Date(school.updatedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider
                                                ${school.kycStatus === 'SUBMITTED' ? 'bg-amber-100 text-amber-700 ring-1 ring-amber-200' :
                                                    school.kycStatus === 'REJECTED' ? 'bg-rose-100 text-rose-700 ring-1 ring-rose-200' : 'bg-slate-100 text-slate-700'}
                                            `}>
                                                {school.kycStatus === 'SUBMITTED' ? <Clock className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                                {school.kycStatus}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    View Certificate
                                                </button>
                                                <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                    View Bank Proof
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <form action={async () => {
                                                    'use server';
                                                    await approveKYC(school.id);
                                                }}>
                                                    <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:-translate-y-0.5">
                                                        Approve
                                                    </button>
                                                </form>
                                                <form action={async (formData) => {
                                                    'use server';
                                                    await rejectKYC(school.id, "Documents unclear or invalid");
                                                }}>
                                                    <button className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-rose-200 dark:shadow-none transition-all hover:-translate-y-0.5">
                                                        Reject
                                                    </button>
                                                </form>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30">
                    <h3 className="font-black text-emerald-800 dark:text-emerald-400 text-lg mb-2">Auto-Activation</h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-500 leading-relaxed">Approval automatically activates Payment Gateway and Marketplace features for the school.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/30">
                    <h3 className="font-black text-blue-800 dark:text-blue-400 text-lg mb-2">Compliance First</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-500 leading-relaxed">Ensure all documents are verified against government records before approving.</p>
                </div>
                <div className="bg-amber-50 dark:bg-amber-900/10 p-6 rounded-3xl border border-amber-100 dark:border-amber-800/30">
                    <h3 className="font-black text-amber-800 dark:text-amber-400 text-lg mb-2">Quick Rejection</h3>
                    <p className="text-sm text-amber-600 dark:text-amber-500 leading-relaxed">If documents are missing or expired, reject with a clear reason to help the school admin.</p>
                </div>
            </div>
        </div>
    );
}
