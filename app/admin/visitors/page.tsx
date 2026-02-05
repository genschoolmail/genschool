import React from 'react';
import { prisma } from '@/lib/prisma';
import { createVisitor, updateVisitorExit } from '@/lib/visitor-actions';
import Link from 'next/link';
import { Clock, LogOut, Printer, UserPlus } from 'lucide-react';

export default async function VisitorsPage() {
    // Fetch visitors for today by default, or all
    const visitors = await prisma.visitor.findMany({
        orderBy: { entryTime: 'desc' }
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Visitor Management</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                        <h2 className="text-lg font-semibold mb-4 text-slate-800 dark:text-white">New Visitor Entry</h2>
                        <form action={createVisitor} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Visitor Name</label>
                                <input name="name" required placeholder="John Doe" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                                <input name="phone" required placeholder="9876543210" className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Purpose of Visit</label>
                                <textarea name="purpose" required rows={3} placeholder="Meeting with Principal..." className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600"></textarea>
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Log Entry
                            </button>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                            <h2 className="font-semibold text-slate-800 dark:text-white">Recent Visitors</h2>
                        </div>
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200">Visitor Details</th>
                                    <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200">Time</th>
                                    <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200">Status</th>
                                    <th className="p-4 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visitors.map(visitor => (
                                    <tr key={visitor.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700">
                                            <p className="font-medium text-slate-800 dark:text-white">{visitor.name}</p>
                                            <p className="text-xs text-slate-500">{visitor.phone}</p>
                                            <p className="text-xs text-slate-500 italic mt-1">{visitor.purpose}</p>
                                        </td>
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-300">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                In: {new Date(visitor.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            {visitor.exitTime && (
                                                <div className="flex items-center gap-1 text-slate-400 mt-1">
                                                    <LogOut className="w-3 h-3" />
                                                    Out: {new Date(visitor.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700">
                                            {visitor.exitTime ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                                    Checked Out
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    On Campus
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4 border-b border-slate-200 dark:border-slate-700 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/visitors/gate-pass/${visitor.id}`} className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors" title="Print Gate Pass">
                                                    <Printer className="w-4 h-4" />
                                                </Link>
                                                {!visitor.exitTime && (
                                                    <form action={updateVisitorExit}>
                                                        <input type="hidden" name="id" value={visitor.id} />
                                                        <button type="submit" className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Mark Exit">
                                                            <LogOut className="w-4 h-4" />
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {visitors.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-slate-500">No visitors logged yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
