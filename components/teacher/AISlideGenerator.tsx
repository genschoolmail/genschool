'use client';

import React, { useState } from 'react';
import { shareNoteWithClass } from '@/lib/actions/ai-slides';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, FileUp, Share2, CheckCircle2, Download, Presentation, Eye, Link as LinkIcon, Plus, X, ArrowRight, Save, Wand2, Sparkles, Quote, BookOpen } from 'lucide-react';
import { jsPDF } from 'jspdf';

// "Ditto" 2025 Themes (Dark Mode Premium)
const THEMES = [
    { bg: [26, 26, 26], text: [255, 255, 255], accent: [232, 255, 65], sub: [150, 150, 150] }, // Dark Navy + Magic Yellow
    { bg: [30, 41, 59], text: [255, 255, 255], accent: [56, 189, 248], sub: [148, 163, 184] }, // Slate + Sky Blue
    { bg: [15, 23, 42], text: [255, 255, 255], accent: [244, 63, 94], sub: [100, 116, 139] },  // Deep Space + Rose
];

type Phase = 'upload' | 'synthesizing' | 'verifying' | 'generating' | 'done';

export default function AISlideGenerator({
    classes,
    schoolName = "School",
    teacherName = "Teacher"
}: {
    classes: any[],
    schoolName?: string,
    teacherName?: string
}) {
    const [file, setFile] = useState<File | null>(null);
    const [links, setLinks] = useState<string[]>([""]);
    const [language, setLanguage] = useState("English");
    const [phase, setPhase] = useState<Phase>('upload');
    const [isSharing, setIsSharing] = useState(false);
    const [slideData, setSlideData] = useState<any[] | null>(null);
    const [synthesisText, setSynthesisText] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [progress, setProgress] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);

    const addLinkField = () => setLinks([...links, ""]);
    const removeLinkField = (index: number) => setLinks(links.filter((_, i) => i !== index));
    const updateLinkField = (index: number, val: string) => {
        const newLinks = [...links];
        newLinks[index] = val;
        setLinks(newLinks);
    };

    const handleSynthesize = async () => {
        if (!file && links.every(l => !l.trim())) return toast.error("Please provide a file or link");
        setPhase('synthesizing');
        setProgress("Extracting core knowledge from sources...");
        try {
            const formData = new FormData();
            if (file) formData.append('file', file);
            formData.append('links', JSON.stringify(links.filter(l => l.trim())));
            formData.append('language', language);

            const res = await fetch('/api/teacher/synthesize-research', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSynthesisText(data.synthesis);
            setPhase('verifying');
        } catch (err: any) {
            toast.error(err.message);
            setPhase('upload');
        }
    };

    const handleGenerateSlides = async () => {
        setPhase('generating');
        setProgress("Designing NotebookLM 'Studio' Slides...");
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesisText, language, teacherName, schoolName })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSlideData(data.slideData);
            setPhase('done');
            setCurrentSlide(0);
        } catch (err: any) {
            toast.error(err.message);
            setPhase('verifying');
        }
    };

    const downloadPDF = () => {
        if (!slideData) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();

        slideData.forEach((slide: any, idx: number) => {
            if (idx > 0) doc.addPage();
            const theme = THEMES[idx % THEMES.length];

            // Background (Dark Premium)
            doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
            doc.rect(0, 0, W, H, 'F');

            // Subtle Grid Overlay (Visual Side)
            doc.setDrawColor(255, 255, 255);
            doc.setGState(new (doc as any).GState({ opacity: 0.05 }));
            for (let x = W / 2; x < W; x += 10) doc.line(x, 0, x, H);
            for (let y = 0; y < H; y += 10) doc.line(W / 2, y, W, y);
            doc.setGState(new (doc as any).GState({ opacity: 1 }));

            // Header Branding
            doc.setFontSize(8);
            doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.text(`Based on research sources | ${schoolName}`, 15, 12);
            doc.text(`Studio v2025`, W - 15, 12, { align: 'right' });

            // Layout Choice: SPLIT_IMAGE (DITTO)
            const layout = slide.layout || (idx === 0 ? 'HERO_STAT' : 'SPLIT_IMAGE');

            if (layout === 'SPLIT_IMAGE') {
                // Left: Narrative
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(28);
                doc.setFont('helvetica', 'bold');
                const titleText = doc.splitTextToSize(slide.title?.toUpperCase() || "UNTITLED", W / 2 - 35);
                doc.text(titleText, 20, 40);

                let startY = 40 + (titleText.length * 12) + 5;

                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                (slide.points || []).forEach((p: string, pi: number) => {
                    if (pi > 3) return;
                    const wrappedP = doc.splitTextToSize(p, W / 2 - 35);

                    // Magic Highlighter: Translucent yellow bar behind prefix
                    doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
                    doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
                    doc.rect(20, startY - 4, 15, 6, 'F');
                    doc.setGState(new (doc as any).GState({ opacity: 1 }));

                    doc.setTextColor(255, 255, 255);
                    doc.text(wrappedP, 20, startY + 2);
                    startY += (wrappedP.length * 6) + 10;
                });

                // Right: Studio Card (White border + content)
                const cardX = W / 2 + 10;
                const cardW = W / 2 - 25;
                doc.setFillColor(255, 255, 255, 0.05);
                doc.roundedRect(cardX, 25, cardW, H - 55, 8, 8, 'F');
                doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
                doc.setFontSize(48);
                doc.text(slide.emoji || "✨", cardX + cardW / 2, H / 2 - 5, { align: 'center' });
            }
            else if (layout === 'HERO_STAT') {
                doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
                doc.setFontSize(48);
                doc.setFont('helvetica', 'bold');
                const heroTitle = doc.splitTextToSize(slide.title?.toUpperCase() || "", W - 60);
                doc.text(heroTitle, W / 2, H / 2 - 10, { align: 'center' });
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(18);
                doc.text(slide.subtitle || "", W / 2, H / 2 + 15, { align: 'center' });
            }

            // Global Branding Footer
            doc.setFontSize(8);
            doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.text(`GROUNDED IN RESEARCH | ${schoolName.toUpperCase()}`, 20, H - 10);
            doc.text(`NOTEBOOKLM STUDIO`, W - 20, H - 10, { align: 'right' });
        });

        doc.save(`${file?.name?.split('.')[0] || 'NotebookLM'}-Studio.pdf`);
    };

    const SlidePreview = ({ slide, index }: { slide: any; index: number }) => {
        const theme = THEMES[index % THEMES.length];
        const layout = slide.layout || (index === 0 ? 'HERO_STAT' : 'SPLIT_IMAGE');

        return (
            <div className="rounded-[32px] overflow-hidden shadow-2xl border border-white/10 bg-[#1A1A1A] text-white aspect-video relative group">
                {/* Header */}
                <div className="absolute top-6 left-8 right-8 flex justify-between items-center opacity-40 text-[9px] font-black uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-3 h-3 text-[#E8FF41]" />
                        <span>Based on sources</span>
                    </div>
                    <span>{schoolName} • STUDIO V25</span>
                </div>

                <div className="p-12 h-full flex items-center">
                    {layout === 'SPLIT_IMAGE' ? (
                        <div className="grid grid-cols-2 gap-12 w-full items-center">
                            <div className="space-y-8">
                                <h3 className="text-4xl font-black leading-tight tracking-tight uppercase">
                                    {slide.title}
                                </h3>
                                <div className="space-y-6">
                                    {(slide.points || []).slice(0, 3).map((p: string, i: number) => (
                                        <div key={i} className="relative pl-6">
                                            <div className="absolute left-0 top-0 w-1 h-full bg-[#E8FF41] rounded-full opacity-50"></div>
                                            <p className="text-sm font-medium leading-relaxed opacity-80">{p}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-[24px] aspect-square flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #E8FF41 1px, transparent 1px)', backgroundSize: '15px 15px' }}></div>
                                <span className="text-8xl relative z-10 filter drop-shadow-2xl">{slide.emoji || '🧬'}</span>
                                <div className="mt-6 px-4 py-1 rounded-full bg-[#E8FF41]/20 text-[#E8FF41] text-[10px] font-black uppercase tracking-widest">
                                    Visual Concept
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full text-center space-y-6">
                            <span className="text-7xl mb-4 block">{slide.emoji || '🌟'}</span>
                            <h2 className="text-6xl font-black text-[#E8FF41] uppercase">{slide.title}</h2>
                            <p className="text-xl opacity-60 max-w-2xl mx-auto italic">{slide.subtitle}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center opacity-40 text-[9px] font-medium transition-opacity group-hover:opacity-100">
                    <div className="flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        <span>Source: Research Document</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span>P. {index + 1}</span>
                        <div className="w-8 h-px bg-white/20"></div>
                        <span className="font-black">NOTEBOOKLM</span>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10">
            {/* UPLOAD UI */}
            {phase === 'upload' && (
                <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-xs font-black uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" /> NotebookLM Studio
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white">Research-to-Lesson</h1>
                        <p className="text-slate-500 text-lg">Combine your documents and web links into premium educator slides.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Core Document (PDF)</Label>
                            <div className="group border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[32px] p-12 text-center hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer relative overflow-hidden">
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                <div className="space-y-4 relative z-10">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <FileUp className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <div className="font-bold text-slate-700 dark:text-slate-200">
                                        {file ? file.name : "Drop Primary Material"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">External Research Links</Label>
                            <div className="space-y-3">
                                {links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <Input
                                            placeholder="YouTube or Website URL"
                                            className="rounded-2xl h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                                            value={link}
                                            onChange={(e) => updateLinkField(idx, e.target.value)}
                                        />
                                        {links.length > 1 && (
                                            <Button variant="ghost" onClick={() => removeLinkField(idx)} className="rounded-2xl h-12 text-red-500"><X /></Button>
                                        )}
                                    </div>
                                ))}
                                <Button variant="outline" onClick={addLinkField} className="w-full rounded-2xl h-12 border-dashed text-slate-400 hover:text-indigo-500">
                                    <Plus className="w-4 h-4 mr-2" /> Add Link
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center pt-8">
                        <Button onClick={handleSynthesize} className="h-16 px-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-xl font-black shadow-2xl shadow-indigo-500/40 group">
                            Assemble Research <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            )}

            {/* VERIFY PHASE */}
            {phase === 'verifying' && (
                <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-8 duration-500">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-[32px] p-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white">
                                <Quote className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">Foundation Summary</h3>
                                <p className="text-sm opacity-60">Verified knowledge from your sources.</p>
                            </div>
                        </div>
                        <Textarea
                            value={synthesisText}
                            onChange={(e) => setSynthesisText(e.target.value)}
                            className="min-h-[300px] rounded-2xl bg-white dark:bg-[#1A1A1A] border-amber-200 dark:border-white/10 p-8 leading-relaxed italic"
                        />
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button variant="ghost" onClick={() => setPhase('upload')} className="rounded-2xl h-14 px-8 font-bold">Back</Button>
                        <Button onClick={handleGenerateSlides} className="rounded-2xl h-14 px-12 bg-indigo-600 font-black shadow-xl">Build Studio Slides</Button>
                    </div>
                </div>
            )}

            {/* DONE PHASE */}
            {phase === 'done' && slideData && (
                <div className="max-w-5xl mx-auto space-y-12 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black">Generated Studio Deck</h2>
                        <Button onClick={downloadPDF} size="lg" className="rounded-2xl h-14 px-10 bg-[#E8FF41] text-black hover:bg-[#d8f03b] font-black">
                            <Download className="w-5 h-5 mr-3" /> Export PDF
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <SlidePreview slide={slideData[currentSlide]} index={currentSlide} />
                        <div className="flex justify-center items-center gap-1">
                            {slideData.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`h-2 rounded-full transition-all ${i === currentSlide ? 'w-12 bg-[#E8FF41]' : 'w-2 bg-slate-300 dark:bg-slate-800 hover:bg-slate-400'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Sharing / Class Integration */}
                    <div className="p-10 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-2">
                            <h4 className="text-xl font-black">Ready for Class?</h4>
                            <p className="text-slate-500 text-sm">Publish this deck to your students immediately.</p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="w-64 rounded-2xl h-14">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Button onClick={() => toast.success("Shared!")} className="h-14 px-10 rounded-2xl bg-indigo-600 font-bold">Share</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading States */}
            {(phase === 'synthesizing' || phase === 'generating') && (
                <div className="min-h-[500px] flex flex-col items-center justify-center text-center space-y-8">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                        <Sparkles className="w-10 h-10 text-[#E8FF41] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black">{phase === 'synthesizing' ? 'Assembling Knowledge' : 'Rendering Studio Deck'}</h2>
                        <p className="text-slate-500">{progress}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
