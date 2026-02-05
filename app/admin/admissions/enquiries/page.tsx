'use client';

import { useState, useEffect } from 'react';
import { getAdmissionEnquiries, updateAdmissionEnquiryStatus, deleteAdmissionEnquiry } from '@/lib/actions/admission-actions';
import { format } from 'date-fns';
import { Phone, Mail, MessageSquare, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AdmissionEnquiriesPage() {
    const [enquiries, setEnquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        loadEnquiries();
    }, []);

    const loadEnquiries = async () => {
        setLoading(true);
        // If filter is ALL, fetch all (or implement server side filter)
        // For now fetching all and filtering locally or fetching with status
        const data = await getAdmissionEnquiries(filter !== 'ALL' ? { status: filter } : undefined);
        setEnquiries(data);
        setLoading(false);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        const result = await updateAdmissionEnquiryStatus(id, newStatus);
        if (result.success) {
            loadEnquiries();
        } else {
            alert('Failed to update status');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this enquiry?')) {
            const result = await deleteAdmissionEnquiry(id);
            if (result.success) {
                loadEnquiries();
            } else {
                alert('Failed to delete');
            }
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'CONTACTED': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ADMITTED': return 'bg-green-100 text-green-800 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Admission Enquiries</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage student admission requests</p>
                </div>
                <div className="flex gap-2">
                    {['ALL', 'PENDING', 'CONTACTED', 'ADMITTED'].map((s) => (
                        <button
                            key={s}
                            onClick={() => { setFilter(s); loadEnquiries(); }} // Re-fetch on click (imperfect but simple)
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === s
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : enquiries.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                    <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No enquiries found</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left bg-white ">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Applicant</th>
                                    <th className="px-6 py-4">Contact</th>
                                    <th className="px-6 py-4">Class</th>
                                    <th className="px-6 py-4">Message</th>
                                    <th className="px-6 py-4">Status & Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {enquiries.map((enquiry) => (
                                    <tr key={enquiry.id} className="hover:bg-slate-50/50 transition-colors bg-white">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-slate-800 dark:text-white">
                                                {enquiry.name}
                                            </div>
                                            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(enquiry.createdAt), 'PP p')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                {enquiry.phone}
                                            </div>
                                            {enquiry.email && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <Mail className="w-4 h-4 text-slate-400" />
                                                    {enquiry.email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-sm font-medium">
                                                {enquiry.class || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-sm text-slate-600" title={enquiry.message || ''}>
                                            {enquiry.message || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getStatusColor(enquiry.status)}`}>
                                                    {enquiry.status}
                                                </span>

                                                <div className="flex gap-1">
                                                    {enquiry.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(enquiry.id, 'CONTACTED')}
                                                            title="Mark Contacted"
                                                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {enquiry.status !== 'ADMITTED' && (
                                                        <button
                                                            onClick={() => handleStatusUpdate(enquiry.id, 'ADMITTED')}
                                                            title="Mark Admitted"
                                                            className="p-1.5 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(enquiry.id)}
                                                        title="Delete"
                                                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
