'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface GalleryItem {
    id?: string;
    url: string;
    caption?: string;
}

interface ImageSlideshowProps {
    images: GalleryItem[];
    autoPlayInterval?: number;
    showControls?: boolean;
    showIndicators?: boolean;
    className?: string;
}

export default function ImageSlideshow({
    images,
    autoPlayInterval = 5000,
    showControls = true,
    showIndicators = true,
    className = ''
}: ImageSlideshowProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const displayImages = images.slice(0, 10); // Limit to 10 images

    const goToNext = useCallback(() => {
        if (displayImages.length <= 1) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % displayImages.length);
            setIsTransitioning(false);
        }, 500);
    }, [displayImages.length]);

    const goToPrev = useCallback(() => {
        if (displayImages.length <= 1) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
            setIsTransitioning(false);
        }, 500);
    }, [displayImages.length]);

    const goToSlide = (index: number) => {
        if (index === currentIndex) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 500);
    };

    useEffect(() => {
        if (!isPlaying || displayImages.length <= 1) return;

        const interval = setInterval(goToNext, autoPlayInterval);
        return () => clearInterval(interval);
    }, [isPlaying, autoPlayInterval, goToNext, displayImages.length]);

    if (!displayImages.length) return null;

    const currentImage = displayImages[currentIndex];

    return (
        <section className={`relative overflow-hidden ${className}`}>
            {/* Main Slideshow Container */}
            <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
                {/* Background Blur Layer */}
                <div
                    className="absolute inset-0 scale-110 blur-2xl opacity-50"
                    style={{
                        backgroundImage: `url(${currentImage.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70 z-10" />

                {/* Image Container */}
                <div className="absolute inset-0 flex items-center justify-center p-8 md:p-16">
                    <div className={`relative w-full h-full max-w-6xl mx-auto transition-all duration-700 ease-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        <img
                            src={currentImage.url}
                            alt={currentImage.caption || 'School Memory'}
                            className="w-full h-full object-contain drop-shadow-2xl"
                        />
                    </div>
                </div>

                {/* Caption */}
                {currentImage.caption && (
                    <div className={`absolute bottom-0 left-0 right-0 z-20 p-8 md:p-12 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                        <div className="max-w-4xl mx-auto text-center">
                            <p className="text-white text-2xl md:text-3xl lg:text-4xl font-bold drop-shadow-lg">
                                {currentImage.caption}
                            </p>
                        </div>
                    </div>
                )}

                {/* Navigation Controls */}
                {showControls && displayImages.length > 1 && (
                    <>
                        {/* Prev Button */}
                        <button
                            onClick={goToPrev}
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 group"
                            aria-label="Previous Image"
                        >
                            <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 group-hover:-translate-x-0.5 transition-transform" />
                        </button>

                        {/* Next Button */}
                        <button
                            onClick={goToNext}
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 group"
                            aria-label="Next Image"
                        >
                            <ChevronRight className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* Play/Pause Button */}
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="absolute top-4 md:top-8 right-4 md:right-8 z-30 w-10 h-10 bg-white/20 backdrop-blur-md hover:bg-white/40 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
                            aria-label={isPlaying ? 'Pause Slideshow' : 'Play Slideshow'}
                        >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                        </button>
                    </>
                )}

                {/* Slide Indicators */}
                {showIndicators && displayImages.length > 1 && (
                    <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                        {displayImages.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full ${index === currentIndex
                                        ? 'w-8 h-2 bg-white'
                                        : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                                    }`}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Image Counter */}
                <div className="absolute top-4 md:top-8 left-4 md:left-8 z-30 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-bold">
                    {currentIndex + 1} / {displayImages.length}
                </div>
            </div>
        </section>
    );
}
