'use client';

import React, { useState, useRef } from 'react';
import { uploadHeroImage } from '@/lib/cms-actions';
import { Image as ImageIcon, Upload, Link2, Loader2, X, FileImage, Check } from 'lucide-react';

interface HeroImageUploaderProps {
    currentImage: string;
}

export default function HeroImageUploader({ currentImage }: HeroImageUploaderProps) {
    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentImage || '');
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
    const [urlInput, setUrlInput] = useState(currentImage || '');
    const [saved, setSaved] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const tempPreview = URL.createObjectURL(file);
        setPreviewUrl(tempPreview);

        setLoading(true);
        setSaved(false);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadHeroImage(formData);
            if (result.success && result.url) {
                setPreviewUrl(result.url);
                setUrlInput(result.url);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setPreviewUrl(currentImage || '');
                alert(result.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading hero image:', error);
            setPreviewUrl(currentImage || '');
            alert('Failed to upload image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUrlChange = (url: string) => {
        setUrlInput(url);
        if (url.startsWith('http://') || url.startsWith('https://')) {
            setPreviewUrl(url);
        }
    };

    const clearImage = () => {
        setPreviewUrl('');
        setUrlInput('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Hero Background Image
            </label>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
                <button
                    type="button"
                    onClick={() => setUploadMode('file')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all ${uploadMode === 'file'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                >
                    <FileImage className="w-3 h-3" />
                    Upload File
                </button>
                <button
                    type="button"
                    onClick={() => setUploadMode('url')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all ${uploadMode === 'url'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                >
                    <Link2 className="w-3 h-3" />
                    Paste URL
                </button>
            </div>

            {uploadMode === 'file' ? (
                <div className="relative">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                        disabled={loading}
                    />
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        </div>
                    )}
                    {saved && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                            <Check className="w-5 h-5" />
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <input
                        type="url"
                        name="heroImage"
                        value={urlInput}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://example.com/hero-image.jpg"
                        className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-slate-700 dark:text-white"
                    />
                </div>
            )}

            {/* Hidden input to store the actual value for form submission in URL mode */}
            {uploadMode === 'file' && <input type="hidden" name="heroImage" value={previewUrl} />}

            {/* Preview */}
            {previewUrl && (
                <div className="relative mt-4">
                    <div className="aspect-video w-full max-w-md rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700">
                        <img
                            src={previewUrl}
                            alt="Hero Preview"
                            className="w-full h-full object-cover"
                            onError={() => {
                                if (uploadMode === 'url') {
                                    setPreviewUrl('');
                                }
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={clearImage}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <p className="text-xs text-slate-500">Upload a high-quality image for your homepage hero section background.</p>
        </div>
    );
}
