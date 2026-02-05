'use client';

import React, { useState, useRef } from 'react';
import { manageGallery, uploadGalleryImage } from '@/lib/cms-actions';
import { Plus, Trash2, Image as ImageIcon, Loader2, Upload, Link2, X, Camera, FileImage } from 'lucide-react';

interface GalleryItem {
    id: string;
    url: string;
    caption?: string;
}

export default function GalleryManager({ initialGallery }: { initialGallery: string }) {
    const [gallery, setGallery] = useState<GalleryItem[]>(JSON.parse(initialGallery || '[]'));
    const [loading, setLoading] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [newCaption, setNewCaption] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAddByUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl) return;

        setLoading(true);
        try {
            const result = await manageGallery('add', { url: newUrl, caption: newCaption });
            if (result.success) {
                setGallery(result.gallery);
                resetForm();
            }
        } catch (error) {
            console.error('Error adding to gallery:', error);
            alert('Failed to add image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAddByFile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('caption', newCaption);

            const result = await uploadGalleryImage(formData);
            if (result.success && result.gallery) {
                setGallery(result.gallery);
                resetForm();
            } else {
                alert(result.error || 'Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading gallery image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (item: GalleryItem) => {
        if (!confirm('Are you sure you want to remove this memory?')) return;

        setLoading(true);
        try {
            // Optimistically update UI if you want, but here we'll wait for result
            const result = await manageGallery('remove', { url: item.url, id: item.id });
            if (result.success && result.gallery) {
                setGallery(result.gallery);
            } else {
                alert('Failed to remove image');
            }
        } catch (error) {
            console.error('Error removing from gallery:', error);
            alert('Failed to remove image. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setNewUrl('');
        setNewCaption('');
        setPreviewUrl('');
        setSelectedFile(null);
        setShowAddForm(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUrlChange = (url: string) => {
        setNewUrl(url);
        if (url.startsWith('http://') || url.startsWith('https://')) {
            setPreviewUrl(url);
        } else {
            setPreviewUrl('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Camera className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-white">School Memories Gallery</h3>
                        <p className="text-xs text-slate-500">Upload event photos to display on your school homepage</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="px-3 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold">
                        {gallery.length}/10 Images
                    </span>
                    {gallery.length < 10 && !showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            <Plus className="w-4 h-4" /> Add Memory
                        </button>
                    )}
                </div>
            </div>

            {/* Add Image Form */}
            {showAddForm && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl border-2 border-dashed border-indigo-300 dark:border-indigo-600">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Upload className="w-5 h-5 text-indigo-500" />
                            Add New Memory
                        </h4>
                        <button
                            onClick={resetForm}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Upload Mode Toggle */}
                    <div className="flex gap-2 mb-6">
                        <button
                            type="button"
                            onClick={() => { setUploadMode('file'); setNewUrl(''); setPreviewUrl(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${uploadMode === 'file'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600'
                                }`}
                        >
                            <FileImage className="w-4 h-4" />
                            Upload File
                        </button>
                        <button
                            type="button"
                            onClick={() => { setUploadMode('url'); setSelectedFile(null); setPreviewUrl(''); }}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all ${uploadMode === 'url'
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-2 border-slate-200 dark:border-slate-600'
                                }`}
                        >
                            <Link2 className="w-4 h-4" />
                            Paste URL
                        </button>
                    </div>

                    <form onSubmit={uploadMode === 'file' ? handleAddByFile : handleAddByUrl} className="space-y-5">
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Left - Form Fields */}
                            <div className="space-y-4">
                                {uploadMode === 'file' ? (
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            <FileImage className="w-4 h-4" /> Select Image
                                        </label>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
                                            required
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Select an image from your device (JPG, PNG, WebP)</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                            <Link2 className="w-4 h-4" /> Image URL
                                        </label>
                                        <input
                                            type="url"
                                            value={newUrl}
                                            onChange={(e) => handleUrlChange(e.target.value)}
                                            placeholder="https://example.com/image.jpg"
                                            className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                            required
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Paste a direct link to your image</p>
                                    </div>
                                )}

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                                        <ImageIcon className="w-4 h-4" /> Caption
                                    </label>
                                    <input
                                        type="text"
                                        value={newCaption}
                                        onChange={(e) => setNewCaption(e.target.value)}
                                        placeholder="e.g., Annual Sports Meet 2024"
                                        className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-700 dark:text-white transition-colors"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Describe the event or moment</p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || (uploadMode === 'url' ? !newUrl : !selectedFile)}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                    {loading ? 'Uploading...' : 'Add to Gallery'}
                                </button>
                            </div>

                            {/* Right - Image Preview */}
                            <div className="flex items-center justify-center">
                                <div className="w-full aspect-video bg-slate-200 dark:bg-slate-700 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-300 dark:border-slate-600">
                                    {previewUrl ? (
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={() => setPreviewUrl('')}
                                        />
                                    ) : (
                                        <div className="text-center p-6">
                                            <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                                            <p className="text-sm text-slate-500">Image Preview</p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {uploadMode === 'file' ? 'Select an image to preview' : 'Enter a valid URL to preview'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Gallery Grid */}
            {gallery.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((item, index) => (
                        <div
                            key={item.id}
                            className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                            {/* Order Badge */}
                            <div className="absolute top-2 left-2 z-10 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {index + 1}
                            </div>

                            <img
                                src={item.url}
                                alt={item.caption || 'Gallery Image'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />

                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                {item.caption && (
                                    <p className="text-white text-sm font-bold truncate mb-3">{item.caption}</p>
                                )}
                                <button
                                    onClick={() => handleRemove(item)}
                                    disabled={loading}
                                    className="w-full py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {gallery.length === 0 && !showAddForm && (
                <div
                    onClick={() => setShowAddForm(true)}
                    className="cursor-pointer group border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-12 text-center transition-all duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                >
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Camera className="w-10 h-10 text-indigo-500" />
                    </div>
                    <h4 className="font-bold text-lg text-slate-800 dark:text-white mb-2">No Memories Yet!</h4>
                    <p className="text-slate-500 text-sm mb-4">Click here to add your first school event photo</p>
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold group-hover:bg-indigo-700 transition-colors">
                        <Plus className="w-4 h-4" /> Add Your First Memory
                    </span>
                </div>
            )}

            {/* Info Banner */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-amber-100 dark:bg-amber-800/50 rounded-lg flex items-center justify-center">
                        <span className="text-lg">💡</span>
                    </div>
                    <div>
                        <h5 className="font-bold text-amber-800 dark:text-amber-200 text-sm">Tips for Best Results</h5>
                        <ul className="text-amber-700 dark:text-amber-300 text-xs mt-1 space-y-1">
                            <li>• Use high-quality images (minimum 1280x720 recommended)</li>
                            <li>• Add captions to describe events like "Annual Day 2024" or "Sports Meet"</li>
                            <li>• Up to 10 images will be displayed in a slideshow on your homepage</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
