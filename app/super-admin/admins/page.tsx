import { getAllSchoolAdmins } from '@/lib/actions/subscription-actions';
import { Users, Mail, Phone, Building } from 'lucide-react';
import PasswordViewer from '@/components/common/PasswordViewer';

export default async function AllAdminsPage() {
    const admins = await getAllSchoolAdmins();

    return (
        <div className="space-y-10 sm:space-y-12 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 sm:items-center">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Global Authority
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                        Administrative oversight across the entire school ecosystem.
                    </p>
                </div>
                <div className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 px-6 py-3 rounded-2xl flex items-center gap-3">
                    <Users className="w-5 h-5" />
                    <span className="font-black tracking-tight">{admins.length} Total Units</span>
                </div>
            </div>

            {/* Registry Table - Modern Sheet */}
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-200 dark:border-slate-800/50 overflow-hidden group/table">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left min-w-[1000px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800/50">
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authority Member</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden md:table-cell">Communication</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden lg:table-cell">Phone Vector</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Security Access</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Institutional Core</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden sm:table-cell">Privilege Tier</th>
                                <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hidden xl:table-cell">Enrollment</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-20 text-center text-slate-500 font-bold italic tracking-tight">
                                        No authority members detected in registry.
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => (
                                    <tr key={admin.id} className="group/row hover:bg-slate-50/50 dark:hover:bg-indigo-500/5 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg group-hover/row:scale-110 group-hover/row:rotate-3 transition-transform">
                                                    {admin.name?.charAt(0) || 'A'}
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-slate-800 dark:text-white tracking-tight leading-tight">{admin.name}</div>
                                                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ref: {admin.id.substring(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 hidden md:table-cell">
                                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover/row:text-indigo-500 transition-colors">
                                                    <Mail className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm tracking-tight">{admin.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 hidden lg:table-cell">
                                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover/row:text-indigo-500 transition-colors">
                                                    <Phone className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm tracking-tight">{admin.phone}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="bg-slate-100 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
                                                <PasswordViewer password={(admin as any).tempPassword} />
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/row:text-indigo-500 transition-colors">
                                                    <Building className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-800 dark:text-white text-xs tracking-tight">{admin.school?.name}</div>
                                                    <code className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest bg-indigo-500/5 px-2 py-0.5 rounded mt-1 inline-block">
                                                        {admin.school?.subdomain}
                                                    </code>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 hidden sm:table-cell">
                                            <span className="inline-flex items-center px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                                                {admin.role}
                                            </span>
                                        </td>
                                        <td className="p-6 text-sm text-slate-500 hidden xl:table-cell font-black tracking-tighter">
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Security Advisory */}
            <div className="bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-amber-500 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center shadow-lg">
                        <Users className="w-7 h-7 text-amber-500" />
                    </div>
                    <div>
                        <h3 className="text-amber-900 dark:text-amber-100 font-black tracking-tight text-lg">Security Protocol Notice</h3>
                        <p className="text-amber-800/70 dark:text-amber-400/80 text-sm font-bold mt-1 max-w-2xl">
                            Root Authority (Super Admin) credentials are encrypted and isolated from this dashboard.
                            Member access is limited to institutional oversight units only.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
