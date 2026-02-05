"use client";

import { useState, useRef, useEffect } from 'react';
import {
    MoreVertical, Edit, Power, PowerOff,
    UserCircle, ExternalLink, Loader2, Trash2
} from 'lucide-react';
import { updateSchoolStatus, impersonateSchoolAdmin } from '@/lib/actions/super-admin';
import { deleteSchool } from '@/lib/actions/school-crud';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface SchoolActionsProps {
    schoolId: string;
    subdomain: string;
    currentStatus: string;
}

export default function SchoolActions({ schoolId, subdomain, currentStatus }: SchoolActionsProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleStatusToggle = async () => {
        try {
            setLoading(true);
            const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            await updateSchoolStatus(schoolId, newStatus);
            toast.success(`School ${newStatus.toLowerCase()} success`);
            setIsOpen(false);
        } catch (error: any) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    const handleImpersonate = async () => {
        try {
            setLoading(true);
            await impersonateSchoolAdmin(schoolId);
        } catch (error: any) {
            toast.error(error.message || "Failed to impersonate");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this school? This action cannot be undone and will remove all associated data.")) {
            return;
        }

        try {
            setLoading(true);
            const result = await deleteSchool(schoolId);
            if (result.success) {
                toast.success("School deleted successfully");
                setIsOpen(false);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to delete school");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors disabled:opacity-50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreVertical className="w-5 h-5" />}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden text-left"
                    >
                        <div className="py-1">
                            <button
                                onClick={() => {
                                    router.push(`/super-admin/schools/${schoolId}`);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Details
                            </button>

                            <button
                                onClick={handleImpersonate}
                                className="w-full flex items-center px-4 py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors font-medium"
                            >
                                <UserCircle className="w-4 h-4 mr-2" />
                                Login as Admin
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                            <button
                                onClick={handleStatusToggle}
                                className={`w-full flex items-center px-4 py-2 text-sm transition-colors ${currentStatus === 'ACTIVE' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                            >
                                {currentStatus === 'ACTIVE' ? (
                                    <>
                                        <PowerOff className="w-4 h-4 mr-2" />
                                        Suspend School
                                    </>
                                ) : (
                                    <>
                                        <Power className="w-4 h-4 mr-2" />
                                        Activate School
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => window.open(`http://${subdomain}.localhost:3000`, '_blank')}
                                className="w-full flex items-center px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Visit Website
                            </button>

                            <div className="border-t border-slate-100 dark:border-slate-700 my-1" />

                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete School
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
