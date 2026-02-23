'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import Image from 'next/image';

interface GalleryItem {
    id?: string;
    url: string;
    caption?: string;
}

interface GallerySlideshowProps {
    images: GalleryItem[];
}

export default function GallerySlideshow({ images }: GallerySlideshowProps) {
    const [index, setIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!images.length) return;
        const timer = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(timer);
    }, [index, images.length]);

    const nextSlide = () => {
        setDirection(1);
        setIndex((prev) => (prev + 1) % images.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.95,
        }),
    };

    if (!mounted) return <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-3xl" />;

    if (!images || images.length === 0) {
        return (
            <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">Gallery is empty</p>
            </div>
        );
    }

    return (
        <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden rounded-[40px] shadow-2xl bg-slate-900 group">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={index}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 },
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    <img
                        src={images[index].url}
                        alt={images[index].caption || "Gallery Image"}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />

                    {images[index].caption && (
                        <div className="absolute bottom-12 left-0 right-0 text-center px-4">
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="inline-block px-6 py-3 bg-white/10 backdrop-blur-md rounded-full text-white font-medium text-lg md:text-xl border border-white/20"
                            >
                                {images[index].caption}
                            </motion.p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 z-10"
                onClick={prevSlide}
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 z-10"
                onClick={nextSlide}
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {images.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            setDirection(i > index ? 1 : -1);
                            setIndex(i);
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${i === index ? "bg-white w-8" : "bg-white/40 hover:bg-white/80"
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
