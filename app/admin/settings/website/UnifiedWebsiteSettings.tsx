'use client';

import React, { useState, useEffect } from 'react';
import { updateWebsiteConfig, manageGallery, uploadGalleryImage } from '@/lib/cms-actions';
import { Bell, Shield, Image as ImageIcon, Phone, Save, Loader2, Eye, EyeOff, Plus, Trash2, Globe, CheckCircle2, LayoutDashboard, ExternalLink, X } from 'lucide-react';
import { toast } from 'sonner';

interface WebsiteConfig {
    schoolId: string;
    heroTitle: string;
    heroDescription: string;
    heroImage: string;
    phone: string;
    email: string;
    address: string;
    homepageNotice: string;
    homepageNoticeEnabled: boolean;
    admissionStatusEnabled: boolean;
    admissionText: string;
    galleryJson: string;
}

interface GalleryItem {
    id: string;
    url: string;
    caption?: string;
}

export default function UnifiedWebsiteSettings({ initialConfig, subdomain }: { initialConfig: any, subdomain?: string }) {
    // --- State Management ---
    const [config, setConfig] = useState<WebsiteConfig>({
        schoolId: initialConfig?.schoolId || '',
        heroTitle: initialConfig?.heroTitle || '',
        heroDescription: initialConfig?.heroDescription || '',
        heroImage: initialConfig?.heroImage || '',
        phone: initialConfig?.phone || '',
        email: initialConfig?.email || '',
        address: initialConfig?.address || '',
        homepageNotice: initialConfig?.homepageNotice || '',
        homepageNoticeEnabled: initialConfig?.homepageNoticeEnabled || false,
        admissionStatusEnabled: initialConfig?.admissionStatusEnabled || false,
        admissionText: initialConfig?.admissionText || 'Admissions Open 2025-26',
        galleryJson: initialConfig?.galleryJson || '[]'
    });

    const [gallery, setGallery] = useState<GalleryItem[]>(() => {
        const items = JSON.parse(initialConfig?.galleryJson || '[]');
        return items.map((item: any, idx: number) => ({
            ...item,
            id: item.id || `legacy-${idx}-${Date.now()}`
        }));
    });
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Gallery Temp State
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newImageCaption, setNewImageCaption] = useState('');
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // --- Handlers ---

    // 1. Generic Input Change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    // 2. Toggle Handlers
    const toggleNotice = () => setConfig(prev => ({ ...prev, homepageNoticeEnabled: !prev.homepageNoticeEnabled }));
    const toggleAdmission = () => setConfig(prev => ({ ...prev, admissionStatusEnabled: !prev.admissionStatusEnabled }));

    // 3. Gallery Handlers (Modified to update local state immediately)
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // 3. Gallery Handlers
    const handleAddGalleryImage = async () => {
        console.log('[Gallery] Adding image:', newImageUrl);
        if (!newImageUrl) return;

        setUploadingImage(true);
        try {
            const result = await manageGallery('add', { url: newImageUrl, caption: newImageCaption });
            console.log('[Gallery] Add result:', result);
            if (result.success) {
                setGallery(result.gallery);
                setConfig(prev => ({ ...prev, galleryJson: JSON.stringify(result.gallery) }));
                setNewImageUrl('');
                setNewImageCaption('');
                toast.success('Image added to gallery');
            }
        } catch (error) {
            console.error('[Gallery] Add error:', error);
            toast.error('Failed to add image');
        } finally {
            setUploadingImage(false);
        }
    };

    const executeDelete = async (e: React.MouseEvent, item: GalleryItem) => {
        console.log('[Gallery] Delete Execution triggered for:', item.id);
        e.preventDefault();
        e.stopPropagation();

        setConfirmDeleteId(null);
        setDeletingId(item.id);
        const toastId = toast.loading(`Removing image ...`);
        const previousGallery = [...gallery];

        try {
            // Optimistically update local state
            const updatedGallery = gallery.filter(g => (item.id ? g.id !== item.id : g.url !== item.url));
            setGallery(updatedGallery);
            setConfig(prev => ({ ...prev, galleryJson: JSON.stringify(updatedGallery) }));

            // Server removal
            const result = await manageGallery('remove', { url: item.url, id: item.id });
            console.log('[Gallery] Server removal result:', result);

            if (result.success) {
                setGallery(result.gallery);
                setConfig(prev => ({ ...prev, galleryJson: JSON.stringify(result.gallery) }));
                toast.success('Image removed successfully', { id: toastId });
            } else {
                throw new Error((result as any).error || 'Server rejected the deletion.');
            }
        } catch (error: any) {
            console.error('[Gallery] Removal error:', error);
            // Revert optimistic update
            setGallery(previousGallery);
            setConfig(prev => ({ ...prev, galleryJson: JSON.stringify(previousGallery) }));
            toast.error(`Error: ${error.message || 'Failed to remove image'}`, { id: toastId });
        } finally {
            setDeletingId(null);
        }
    };

    // 4. Master Save Handler
    const handleSaveAll = async () => {
        console.log('[CMS] Master Save triggered. Config:', config);
        setSaving(true);
        setSaved(false);
        try {
            const result = await updateWebsiteConfig(config);
            console.log('[CMS] Master Save result:', result);

            if (result.success) {
                setSaved(true);
                toast.success('Website settings saved successfully!');
                setTimeout(() => setSaved(false), 3000);
            } else {
                toast.error('Failed to save settings: ' + (result as any).error);
            }

        } catch (error) {
            console.error('[CMS] Save error:', error);
            toast.error('An unexpected error occurred while saving.');
        } finally {
            setSaving(false);
        }
    };

    const [previewUrl, setPreviewUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Construct preview URL dynamically based on current host/port
            const protocol = window.location.protocol;
            const host = window.location.host;
            setPreviewUrl(`${protocol}//${host}/?preview=true`);
        }
    }, []);

    return (
        <div className="space-y-8 pb-24">
            {/* Header / Preview Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div className="text-sm">
                        <span className="font-semibold text-indigo-900 dark:text-indigo-100">Live Website:</span>
                        <span className="text-indigo-800 dark:text-indigo-200 ml-1">
                            {previewUrl}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => window.open(previewUrl, '_blank')}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg transition-all shadow-md"
                >
                    <ExternalLink className="w-4 h-4" /> Preview Homepage
                </button>
            </div>

            {/* 1. Notice & Admission (Top Priority) */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Notice Board */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-300">
                                <Bell className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Notice Board</h3>
                        </div>
                        <button
                            onClick={toggleNotice}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${config.homepageNoticeEnabled
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'}`}
                        >
                            {config.homepageNoticeEnabled ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                    </div>
                    <textarea
                        name="homepageNotice"
                        value={config.homepageNotice}
                        onChange={handleChange}
                        className="w-full p-3 text-sm border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-purple-500 bg-transparent resize-none h-24"
                        placeholder="Enter notice text..."
                    />
                </div>

                {/* Admission Status */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg text-rose-600 dark:text-rose-300">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Admission Desk</h3>
                        </div>
                        <button
                            onClick={toggleAdmission}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${config.admissionStatusEnabled
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-slate-100 text-slate-500'}`}
                        >
                            {config.admissionStatusEnabled ? 'OPEN' : 'CLOSED'}
                        </button>
                    </div>
                    <input
                        name="admissionText"
                        value={config.admissionText}
                        onChange={handleChange}
                        className="w-full p-3 text-sm border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-rose-500 bg-transparent"
                        placeholder="e.g. Admissions Open 2025-2026"
                    />
                </div>
            </div>

            {/* 2. Hero & Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-slate-400" /> Hero Section
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Page Title</label>
                        <input
                            name="heroTitle"
                            value={config.heroTitle}
                            onChange={handleChange}
                            className="w-full p-3 font-bold text-lg border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 bg-transparent"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Subtitle / Description</label>
                        <input
                            name="heroDescription"
                            value={config.heroDescription}
                            onChange={handleChange}
                            className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 bg-transparent"
                        />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Hero Image URL (or Upload)</label>
                        <div className="flex gap-2">
                            {uploadingHeroImage ? (
                                <label className="flex-1 cursor-pointer px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 border-dashed rounded-lg text-sm flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-300 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            // Client-side XHR upload for progress tracking
                                            const formData = new FormData();
                                            formData.append('file', file);

                                            setUploadProgress(1); // Start progress
                                            const toastId = toast.loading("Uploading hero image...");

                                            const xhr = new XMLHttpRequest();
                                            xhr.open('POST', '/api/upload/hero', true);

                                            xhr.upload.onprogress = (event) => {
                                                if (event.lengthComputable) {
                                                    const percent = Math.round((event.loaded / event.total) * 100);
                                                    setUploadProgress(percent);
                                                }
                                            };

                                            xhr.onload = () => {
                                                if (xhr.status === 200) {
                                                    try {
                                                        const response = JSON.parse(xhr.responseText);
                                                        if (response.success && response.url) {
                                                            setConfig(prev => ({ ...prev, heroImage: response.url }));
                                                            toast.success('Hero image uploaded! Click "Save Changes" to apply.', { id: toastId });
                                                            // Switch back to URL mode so user can see the preview
                                                            setUploadingHeroImage(false);
                                                        } else {
                                                            toast.error(response.error || 'Upload failed', { id: toastId });
                                                        }
                                                    } catch (err) {
                                                        toast.error('Invalid server response', { id: toastId });
                                                    }
                                                } else {
                                                    let errMsg = 'Upload failed';
                                                    try { errMsg = JSON.parse(xhr.responseText)?.error || errMsg; } catch { }
                                                    toast.error(errMsg, { id: toastId });
                                                }
                                                setUploadProgress(0);
                                                e.target.value = '';
                                            };

                                            xhr.onerror = () => {
                                                toast.error('Network error', { id: toastId });
                                                setUploadingHeroImage(false);
                                                setUploadProgress(0);
                                                e.target.value = '';
                                            };

                                            xhr.send(formData);
                                        }}
                                    />
                                    <Plus className="w-4 h-4" />
                                    <span>{uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Choose File'}</span>
                                </label>
                            ) : (
                                <div className="flex-1 flex flex-col gap-2">
                                    <input
                                        name="heroImage"
                                        value={config.heroImage}
                                        onChange={handleChange}
                                        placeholder="https://example.com/hero-image.jpg"
                                        className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 bg-transparent text-sm"
                                    />
                                    {config.heroImage && (
                                        <div className="relative w-full max-w-sm rounded-xl overflow-hidden border-2 border-indigo-200 bg-slate-100 shadow-sm">
                                            <img
                                                src={config.heroImage}
                                                alt="Hero Preview"
                                                className="w-full aspect-video object-cover"
                                                onError={(e) => {
                                                    // Show a broken image placeholder with helpful text
                                                    const target = e.currentTarget;
                                                    target.style.display = 'none';
                                                    const parent = target.parentElement;
                                                    if (parent && !parent.querySelector('.img-error')) {
                                                        const errEl = document.createElement('div');
                                                        errEl.className = 'img-error flex items-center justify-center aspect-video bg-amber-50 text-amber-700 text-xs font-semibold p-4 text-center';
                                                        errEl.innerHTML = '⚠️ Preview unavailable in admin panel.<br>Image will appear correctly on the public site.';
                                                        parent.appendChild(errEl);
                                                    }
                                                }}
                                            />
                                            <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">Saved ✓</div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={() => {
                                    if (uploadProgress > 0) return; // Prevent cancel during upload
                                    setUploadingHeroImage(!uploadingHeroImage);
                                }}
                                className={`px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs transition-colors ${uploadingHeroImage ? 'bg-slate-100 text-slate-600' : 'bg-white text-slate-500 hover:text-indigo-600'}`}
                            >
                                {uploadingHeroImage ? 'Cancel' : 'Upload'}
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400">Leave empty to use the default illustration.</p>
                    </div>
                </div>
            </div>

            {/* 3. Contact Info */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                    <Phone className="w-5 h-5 text-slate-400" /> Contact Details
                </h3>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Phone</label>
                        <input name="phone" value={config.phone} onChange={handleChange} className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 bg-transparent" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
                        <input name="email" value={config.email} onChange={handleChange} className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 bg-transparent" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Address</label>
                        <input name="address" value={config.address} onChange={handleChange} className="w-full p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 bg-transparent" />
                    </div>
                </div>
            </div>

            {/* 4. Gallery Manager (Integrated) */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-slate-400" /> Gallery ({gallery.length})
                    </h3>
                    {/* Add Image Mini Form */}
                    {/* Add Image Controls */}
                    <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        {/* Caption Input */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Image Caption (Optional)</label>
                            <input
                                placeholder="e.g. Annual Sports Day 2024"
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800"
                                value={newImageCaption}
                                onChange={(e) => setNewImageCaption(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                                <button
                                    onClick={() => setUploadingImage(false)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${!uploadingImage ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Image URL
                                </button>
                                <button
                                    onClick={() => setUploadingImage(true)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${uploadingImage ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Upload File
                                </button>
                            </div>

                            {uploadingImage ? (
                                <label className="flex-1 cursor-pointer px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 border-dashed rounded-lg text-sm flex items-center justify-center gap-2 text-indigo-700 dark:text-indigo-300 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            // Show loading state immediately
                                            const toastId = toast.loading("Uploading image...");

                                            try {
                                                const formData = new FormData();
                                                formData.append('file', file);
                                                formData.append('caption', newImageCaption);

                                                const result = await uploadGalleryImage(formData);
                                                if (result.success) {
                                                    if (result.gallery) {
                                                        setGallery(result.gallery);
                                                        setConfig(prev => ({ ...prev, galleryJson: JSON.stringify(result.gallery) }));
                                                        setNewImageCaption('');
                                                        toast.success('Image uploaded successfully', { id: toastId });
                                                    }
                                                } else {
                                                    toast.error(result.error || 'Upload failed', { id: toastId });
                                                }
                                            } catch (err) {
                                                toast.error('Upload error', { id: toastId });
                                            } finally {
                                                // Reset local state and input
                                                setUploadingImage(false);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <Plus className="w-4 h-4" />
                                    <span>Choose File</span>
                                </label>
                            ) : (
                                <div className="flex-1 flex gap-2">
                                    <input
                                        placeholder="https://example.com/image.jpg"
                                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                                        value={newImageUrl}
                                        onChange={(e) => setNewImageUrl(e.target.value)}
                                    />
                                    <button
                                        onClick={handleAddGalleryImage}
                                        disabled={!newImageUrl}
                                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-bold shadow-sm"
                                    >
                                        Add
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {gallery.map((item, idx) => (
                        <div key={item.id || idx} className={`group relative aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 transition-all ${deletingId === item.id ? 'opacity-40 scale-95 blur-[1px]' : 'hover:shadow-md'}`}>
                            <img src={item.url} alt="Gallery" className="w-full h-full object-cover" />
                            <div className="absolute top-2 right-2 z-50 flex gap-2">
                                {confirmDeleteId === item.id ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setConfirmDeleteId(null);
                                            }}
                                            className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 shadow-md transition-all"
                                            title="Cancel"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => executeDelete(e, item)}
                                            className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md transition-all animate-in zoom-in duration-200"
                                            title="Confirm Delete"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        disabled={deletingId === item.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmDeleteId(item.id);
                                        }}
                                        className="p-2 bg-white/90 text-red-600 rounded-lg transition-all hover:bg-red-600 hover:text-white shadow-md disabled:opacity-50 backdrop-blur-sm"
                                        title="Remove Image"
                                    >
                                        {deletingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                )}
                            </div>
                            <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/50 text-white px-2 py-0.5 rounded backdrop-blur-sm">
                                {idx + 1}
                            </span>
                        </div>
                    ))}
                    {gallery.length === 0 && (
                        <div className="col-span-full py-8 text-center text-slate-400 text-sm italic">
                            No images added yet. Paste a URL above to add one.
                        </div>
                    )}
                </div>
            </div>

            {/* Floated Bottom Save Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] bg-slate-900/90 backdrop-blur-md text-white p-2 pl-6 pr-2 rounded-full shadow-2xl flex items-center justify-between z-50 border border-slate-700/50">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-300">
                        {saved ? 'All changes saved!' : 'Unsaved changes'}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                        {saving ? 'Processing...' : 'Ready'}
                    </span>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-full font-bold text-sm hover:bg-indigo-50 transition-all disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Save className="w-4 h-4" />}
                    {saving ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}
                </button>
            </div>
        </div>
    );
}
