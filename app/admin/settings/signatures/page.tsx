import { Upload, FileText, User, CheckCircle } from 'lucide-react';
import { getAdminSignatures } from '@/lib/settings-actions';

export default async function SignaturesPage() {
    const signatures = await getAdminSignatures();

    const getSignature = (role: string) => signatures.find(s => s.role === role);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Upload className="w-7 h-7 text-teal-600" />
                    Digital Signatures
                </h1>
                <p className="text-slate-500 mt-1">Upload digital signatures for official documents</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {['PRINCIPAL', 'EXAM_CONTROLLER', 'SCHOOL_SEAL', 'CLASS_TEACHER'].map((role) => {
                    const sig = getSignature(role);
                    const labels = {
                        'PRINCIPAL': { name: "Principal's Signature", desc: 'For certificates and official documents' },
                        'EXAM_CONTROLLER': { name: 'Exam Controller', desc: 'For mark sheets and certificates' },
                        'SCHOOL_SEAL': { name: 'School Seal/Stamp', desc: 'Official school seal' },
                        'CLASS_TEACHER': { name: 'Class Teacher', desc: 'For report cards' }
                    };

                    return (
                        <div key={role} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    {sig ? <CheckCircle className="w-6 h-6 text-green-600" /> : <User className="w-6 h-6 text-blue-600" />}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{labels[role].name}</h3>
                                    <p className="text-sm text-slate-500">{labels[role].desc}</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="p-8 bg-slate-50 dark:bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 text-center">
                                    {sig ? (
                                        <>
                                            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                                            <p className="text-sm text-green-600">Signature Uploaded</p>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">No signature uploaded</p>
                                        </>
                                    )}
                                </div>
                                <button className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                                    {sig ? 'Replace' : 'Upload'} Signature
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
