import { prisma } from '@/lib/prisma';
import { ensureSuperAdmin } from '@/lib/actions/super-admin';
import { createGlobalAnnouncement, deleteGlobalAnnouncement } from '@/lib/actions/global-notifications';
import { Bell, Trash2, Megaphone, Calendar, ShieldAlert, Info } from 'lucide-react';
import { revalidatePath } from 'next/cache';

export default async function AnnouncementsPage() {
    await ensureSuperAdmin();

    const announcements = await prisma.globalAnnouncement.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Megaphone className="text-indigo-600" />
                        Global Announcements
                    </h1>
                    <p className="text-slate-500 mt-2">Broadcast alerts to all school dashboards across the platform.</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Create Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Create New Broadcast</h2>

                        <form action={async (formData) => {
                            'use server';
                            const title = formData.get('title') as string;
                            const content = formData.get('content') as string;
                            const priority = formData.get('priority') as any;
                            const expiresAt = formData.get('expiresAt') ? new Date(formData.get('expiresAt') as string) : undefined;

                            await createGlobalAnnouncement(title, content, priority, expiresAt);
                        }} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Announcement Title</label>
                                <input
                                    name="title"
                                    placeholder="e.g. Scheduled Maintenance"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message Content</label>
                                <textarea
                                    name="content"
                                    rows={4}
                                    placeholder="Details about the announcement..."
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Priority</label>
                                    <select
                                        name="priority"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-bold"
                                    >
                                        <option value="INFO">Information</option>
                                        <option value="WARNING">Warning</option>
                                        <option value="CRITICAL">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Expiry Date</label>
                                    <input
                                        type="date"
                                        name="expiresAt"
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-95"
                            >
                                Send Broadcast
                            </button>
                        </form>
                    </div>
                </div>

                {/* List */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white px-2">Active Broadcasts</h2>
                    {announcements.length === 0 ? (
                        <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <p className="text-slate-500 font-medium">No global announcements sent yet.</p>
                        </div>
                    ) : (
                        announcements.map((item) => (
                            <div key={item.id} className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex items-start justify-between group">
                                <div className="flex gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${item.priority === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                                            item.priority === 'WARNING' ? 'bg-amber-50 text-amber-600' :
                                                'bg-blue-50 text-blue-600'
                                        }`}>
                                        {item.priority === 'CRITICAL' ? <ShieldAlert /> :
                                            item.priority === 'WARNING' ? <Bell /> : <Info />}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-black text-slate-900 dark:text-white">{item.title}</h3>
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${item.priority === 'CRITICAL' ? 'bg-red-600 text-white' :
                                                    item.priority === 'WARNING' ? 'bg-amber-500 text-white' :
                                                        'bg-indigo-600 text-white'
                                                }`}>
                                                {item.priority}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xl">{item.content}</p>
                                        <div className="flex items-center gap-4 pt-2 text-xs text-slate-400 font-bold">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                Sent {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                            {item.expiresAt && (
                                                <span className="text-red-400">
                                                    Exp: {new Date(item.expiresAt).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <form action={async () => {
                                    'use server';
                                    await deleteGlobalAnnouncement(item.id);
                                }}>
                                    <button className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
