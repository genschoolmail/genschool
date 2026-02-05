import { BookOpen, Plus, Search } from 'lucide-react';
import Link from 'next/link';

export default function LibraryPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Library Management</h1>
                        <p className="text-slate-500 mt-1">Manage books, issue and return records</p>
                    </div>
                    <Link
                        href="/admin/library/books/new"
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Book
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Books</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Available</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                            <BookOpen className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Issued</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        href="/admin/library/issue"
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 transition-all"
                    >
                        <h3 className="font-bold text-slate-800 dark:text-white">Issue Book</h3>
                        <p className="text-sm text-slate-500">Issue a book to a student</p>
                    </Link>
                    <Link
                        href="/admin/library/return"
                        className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-500 transition-all"
                    >
                        <h3 className="font-bold text-slate-800 dark:text-white">Return Book</h3>
                        <p className="text-sm text-slate-500">Process book returns</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
