import { Package, Plus, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function InventoryPage() {
    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Inventory Management</h1>
                        <p className="text-slate-500 mt-1">Manage school assets and inventory</p>
                    </div>
                    <Link
                        href="/admin/inventory/new"
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg font-bold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                            <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Total Items</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                            <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">In Stock</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Low Stock</p>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Categories</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <h3 className="font-bold text-slate-800 dark:text-white">Furniture</h3>
                        <p className="text-sm text-slate-500">Desks, chairs, tables</p>
                    </div>
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <h3 className="font-bold text-slate-800 dark:text-white">Electronics</h3>
                        <p className="text-sm text-slate-500">Computers, projectors</p>
                    </div>
                    <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <h3 className="font-bold text-slate-800 dark:text-white">Stationery</h3>
                        <p className="text-sm text-slate-500">Pens, papers, supplies</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
