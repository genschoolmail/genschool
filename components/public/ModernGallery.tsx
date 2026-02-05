

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface GalleryItem {
    id?: string;
    url: string;
    caption?: string;
}

interface ModernGalleryProps {
    images: GalleryItem[];
}

export default function ModernGallery({ images }: ModernGalleryProps) {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!Array.isArray(images) || images.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No memories shared yet</h3>
                <p className="text-slate-500 text-sm">Check back later for new photos!</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Masonry Grid */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4 px-4 md:px-0">
                {images.map((img, idx) => (
                    <motion.div
                        key={img.id || `gallery-img-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                        viewport={{ once: true }}
                        className="relative group break-inside-avoid rounded-2xl overflow-hidden cursor-zoom-in bg-slate-100 dark:bg-slate-800"
                        onClick={() => setSelectedImage(idx)}
                    >
                        <Image
                            src={img.url}
                            alt={img.caption || 'School Memory'}
                            width={600}
                            height={400}
                            className="w-full h-auto transform transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <ZoomIn className="w-8 h-8 text-white" />
                        </div>
                        {img.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white text-sm font-medium line-clamp-2">{img.caption}</p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedImage !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setSelectedImage(null)}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50"
                            onClick={() => setSelectedImage(null)}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    className="absolute left-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30 z-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
                                    }}
                                >
                                    <ChevronLeft className="w-8 h-8" />
                                </button>

                                <button
                                    className="absolute right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors disabled:opacity-30 z-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImage((prev) => (prev !== null ? (prev + 1) % images.length : 0));
                                    }}
                                >
                                    <ChevronRight className="w-8 h-8" />
                                </button>
                            </>
                        )}

                        {/* Main Image */}
                        <div
                            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <motion.img
                                key={selectedImage}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                src={images[selectedImage].url}
                                alt={images[selectedImage].caption || 'Full view'}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            />
                            {images[selectedImage].caption && (
                                <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                                    <p className="inline-block px-4 py-2 bg-black/50 text-white/90 text-lg font-medium rounded-full backdrop-blur-md">
                                        {images[selectedImage].caption}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Counter */}
                        <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 rounded-full text-white text-sm font-medium">
                            {selectedImage + 1} / {images.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

