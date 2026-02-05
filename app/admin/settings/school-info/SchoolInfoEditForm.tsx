'use client';

import React, { useState } from 'react';
import { updateSchoolInfo, uploadSchoolLogo, uploadSchoolBanner } from '@/lib/settings-actions';
import { toast } from 'sonner';
import { School, Mail, Phone, MapPin, Save, Loader2, Image as ImageIcon, Upload } from 'lucide-react';

interface SchoolInfoEditFormProps {
    school: {
        name: string;
        contactEmail: string;
        contactPhone: string | null;
        address: string | null;
        logo: string | null;
        banner: string | null;
    };
}

export default function SchoolInfoEditForm({ school }: SchoolInfoEditFormProps) {
    const [loading, setLoading] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingBanner, setUploadingBanner] = useState(false);

    const [formData, setFormData] = useState({
        name: school.name || '',
        contactEmail: school.contactEmail || '',
        contactPhone: school.contactPhone || '',
        address: school.address || '',
        logo: school.logo || '',
        banner: school.banner || '',
    });

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingLogo(true);
        const data = new FormData();
        data.append('file', file);

        const result = await uploadSchoolLogo(data);
        if (result.success) {
            setFormData(prev => ({ ...prev, logo: result.url! }));
            toast.success('Logo uploaded successfully');
        } else {
            toast.error(result.error || 'Failed to upload logo');
        }
        setUploadingLogo(false);
    };

    const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingBanner(true);
        const data = new FormData();
        data.append('file', file);

        const result = await uploadSchoolBanner(data);
        if (result.success) {
            setFormData(prev => ({ ...prev, banner: result.url! }));
            toast.success('Banner uploaded successfully');
        } else {
            toast.error(result.error || 'Failed to upload banner');
        }
        setUploadingBanner(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('contactEmail', formData.contactEmail);
            data.append('contactPhone', formData.contactPhone);
            data.append('address', formData.address);
            data.append('logo', formData.logo);
            data.append('banner', formData.banner);

            const result = await updateSchoolInfo(data);
            if (result.success) {
                toast.success('School information updated successfully');
            } else {
                toast.error(result.error || 'Failed to update school info');
            }
        } catch (error) {
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Banner/Hero Section Preview */}
            <div className="relative h-64 md:h-80 w-full overflow-hidden rounded-[32px] bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-2xl group">
                {formData.banner ? (
                    <img src={formData.banner} alt="Banner" className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon className="w-16 h-16 opacity-20 mb-4" />
                        <p className="text-sm font-bold uppercase tracking-widest opacity-40">No Banner Image</p>
                    </div>
                )}

                {/* Banner Upload Trigger */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <input type="file" id="banner-upload" className="hidden" accept="image/*" onChange={handleBannerUpload} />
                    <label
                        htmlFor="banner-upload"
                        className="cursor-pointer px-6 py-3 bg-white text-slate-900 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                    >
                        {uploadingBanner ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {formData.banner ? 'Change Hero Image' : 'Upload Hero Image'}
                    </label>
                </div>

                {/* Logo Overlay */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 md:left-12 md:translate-x-0 w-32 h-32 md:w-40 md:h-40 bg-white dark:bg-slate-900 rounded-[32px] p-2 shadow-2xl border-4 border-white dark:border-slate-800 group/logo">
                    <div className="relative w-full h-full bg-slate-50 dark:bg-slate-800 rounded-[24px] overflow-hidden flex items-center justify-center">
                        {formData.logo ? (
                            <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-4" />
                        ) : (
                            <School className="w-12 h-12 text-slate-300" />
                        )}

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center">
                            <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            <label htmlFor="logo-upload" className="cursor-pointer p-3 bg-white text-slate-900 rounded-full shadow-lg hover:scale-110 transition-transform">
                                {uploadingLogo ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Details */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <School className="w-4 h-4 text-slate-400" /> School Name
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Enter school name"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" /> Contact Email
                    </label>
                    <input
                        type="email"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Enter contact email"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" /> Contact Phone
                    </label>
                    <input
                        type="tel"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Enter contact phone"
                    />
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-slate-400" /> School Address
                    </label>
                    <textarea
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all min-h-[100px]"
                        placeholder="Enter school address"
                    />
                </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save All Changes
                </button>
            </div>
        </form>
    );
}
