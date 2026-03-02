'use client';

import React, { useState } from 'react';
import { shareNoteWithClass } from '@/lib/actions/ai-slides';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, FileUp, Share2, CheckCircle2, Download, Presentation, Eye, Link as LinkIcon, Plus, X, ArrowRight, Save, Wand2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

// Color themes for slides
const THEMES = [
    { bg: [99, 102, 241], text: [255, 255, 255], sub: [199, 210, 254] },   // indigo
    { bg: [248, 250, 252], text: [30, 41, 59], sub: [100, 116, 139] },   // light
    { bg: [240, 253, 244], text: [20, 83, 45], sub: [34, 197, 94] },     // green
    { bg: [254, 249, 195], text: [113, 63, 18], sub: [202, 138, 4] },     // yellow
    { bg: [239, 246, 255], text: [30, 64, 175], sub: [59, 130, 246] },    // blue
    { bg: [254, 242, 242], text: [153, 27, 27], sub: [239, 68, 68] },     // red
    { bg: [250, 245, 255], text: [88, 28, 135], sub: [168, 85, 247] },    // purple
    { bg: [240, 253, 250], text: [17, 94, 89], sub: [20, 184, 166] },    // teal
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
    const [errorMsg, setErrorMsg] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);

    const addLinkField = () => setLinks([...links, ""]);
    const removeLinkField = (index: number) => setLinks(links.filter((_, i) => i !== index));
    const updateLinkField = (index: number, val: string) => {
        const newLinks = [...links];
        newLinks[index] = val;
        setLinks(newLinks);
    };

    // Phase 1: Synthesize Research
    const handleSynthesize = async () => {
        if (!file && links.every(l => !l.trim())) {
            return toast.error("Please provide a file or at least one link");
        }

        setPhase('synthesizing');
        setErrorMsg("");
        setProgress("Analyzing all sources (PDF + Links)...");

        try {
            const formData = new FormData();
            if (file) formData.append('file', file);
            formData.append('links', JSON.stringify(links.filter(l => l.trim())));
            formData.append('language', language);

            const response = await fetch('/api/teacher/synthesize-research', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || "Synthesis failed");
            }

            setSynthesisText(data.synthesis);
            setPhase('verifying');
        } catch (err: any) {
            setErrorMsg(err.message);
            toast.error(err.message);
            setPhase('upload');
        }
    };

    // Phase 2: Generate Slides from Verified Summary
    const handleGenerateSlides = async () => {
        if (!synthesisText.trim()) return toast.error("Summary cannot be empty");

        setPhase('generating');
        setProgress("Crafting premium slides from your verified research...");

        try {
            const response = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: synthesisText,
                    language,
                    teacherName,
                    schoolName
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || "Generation failed");
            }

            setSlideData(data.slideData);
            setPhase('done');
            setCurrentSlide(0);
            toast.success("Slides generated successfully!");
        } catch (err: any) {
            setErrorMsg(err.message);
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

            // Background
            doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
            doc.rect(0, 0, W, H, 'F');

            // Accent bar on left
            doc.setFillColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.rect(0, 0, 6, H, 'F');

            // Slide number badge
            doc.setFillColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.roundedRect(W - 30, 8, 22, 10, 5, 5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text(`${idx + 1} / ${slideData.length}`, W - 19, 14.5, { align: 'center' });

            // Branding Header
            doc.setFontSize(9);
            doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.text(schoolName, 18, 12);
            doc.text(`Instructor: ${teacherName}`, W - 35, 12, { align: 'right' });

            // Title
            doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
            doc.setFontSize(22);
            doc.setFont('helvetica', 'bold');
            const title = slide.title || "Untitled";
            const wrappedTitle = doc.splitTextToSize(title, W - 60);
            doc.text(wrappedTitle, 18, 28);

            const titleH = wrappedTitle.length * 9;
            doc.setDrawColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.setLineWidth(0.5);
            doc.line(18, 22 + titleH, W - 20, 22 + titleH);

            const startY = 28 + titleH;

            // Visual illustrations
            if (slide.visual) {
                const v = slide.visual;
                const vX = W / 2 + 10;
                const vY = startY + 10;
                const vW = W / 2 - 25;
                const vH = H - startY - 25;

                doc.setDrawColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                doc.setLineWidth(0.3);

                if (v.type === 'process' && v.steps) {
                    v.steps.forEach((step: string, si: number) => {
                        const sy = vY + si * 18;
                        doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
                        doc.roundedRect(vX, sy, vW, 14, 2, 2, 'FD');
                        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                        doc.setFontSize(9);
                        doc.text(`${si + 1}. ${step}`, vX + 4, sy + 8.5);
                        if (si < v.steps.length - 1) doc.line(vX + vW / 2, sy + 14, vX + vW / 2, sy + 18);
                    });
                } else if (v.type === 'comparison') {
                    doc.setFillColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                    doc.rect(vX, vY, vW / 2 - 2, vH, 'F');
                    doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
                    doc.rect(vX + vW / 2 + 2, vY, vW / 2 - 2, vH, 'FD');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(10);
                    doc.text(v.left || '', vX + (vW / 4) - 1, vY + vH / 2, { align: "center" });
                    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                    doc.text(v.right || '', vX + (3 * vW / 4) + 1, vY + vH / 2, { align: "center" });
                } else if (v.type === 'facts' && v.data) {
                    v.data.forEach((item: any, fi: number) => {
                        const fy = vY + fi * 15;
                        doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                        doc.setFontSize(11);
                        doc.text(item.value || '', vX, fy + 8);
                        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                        doc.setFontSize(8);
                        doc.text(item.label || '', vX, fy + 13);
                    });
                } else if (v.type === 'mindmap' && v.center) {
                    doc.setFillColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                    doc.circle(vX + vW / 2, vY + vH / 2, 10, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(8);
                    doc.text(v.center, vX + vW / 2, vY + vH / 2 + 3, { align: "center" });
                    (v.branches || []).forEach((b: string, bi: number) => {
                        const angle = (bi * 2 * Math.PI) / v.branches.length;
                        const bx = vX + vW / 2 + Math.cos(angle) * 30;
                        const by = vY + vH / 2 + Math.sin(angle) * 30;
                        doc.setDrawColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                        doc.line(vX + vW / 2, vY + vH / 2, bx, by);
                        doc.setFillColor(255, 255, 255);
                        doc.roundedRect(bx - 12, by - 4, 24, 8, 2, 2, 'FD');
                        doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                        doc.setFontSize(6);
                        doc.text(b, bx, by + 1.5, { align: 'center' });
                    });
                }
            }

            const contentW = slide.visual ? W / 2 - 20 : W - 40;
            doc.setFont('helvetica', 'normal');

            if (slide.type === 'title') {
                doc.setFontSize(14);
                doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                const sub = doc.splitTextToSize(slide.subtitle || '', contentW);
                doc.text(sub, 18, startY + 10);
            } else if (slide.type === 'content' || slide.type === 'summary') {
                doc.setFontSize(11);
                doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                let y = startY + 5;
                (slide.points || []).forEach((p: string) => {
                    const bullet = doc.splitTextToSize(`  •  ${p}`, contentW);
                    doc.text(bullet, 20, y);
                    y += bullet.length * 6 + 3;
                });
            } else if (slide.type === 'quiz') {
                doc.setFontSize(10);
                let y = startY + 5;
                (slide.questions || []).forEach((q: any, qi: number) => {
                    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                    doc.setFontSize(11);
                    const qText = doc.splitTextToSize(`Q${qi + 1}. ${q.q}`, contentW);
                    doc.text(qText, 20, y);
                    y += qText.length * 6 + 2;
                    doc.setFontSize(9);
                    doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                    if (q.options) {
                        q.options.forEach((o: string, oi: number) => {
                            const optText = doc.splitTextToSize(`  ${String.fromCharCode(65 + oi)})  ${o}`, contentW);
                            doc.text(optText, 25, y);
                            y += 5;
                        });
                    }
                    y += 4;
                });
            }

            // Speaker Notes / Lesson Guide (at very bottom)
            if (slide.speaker_notes) {
                doc.setFontSize(6);
                doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                doc.text(`Guide: ${slide.speaker_notes}`, 18, H - 15, { maxWidth: W - 40 });
            }

            // QR Code Placeholder on Last Slide
            if (idx === slideData.length - 1) {
                const qrSize = 30;
                doc.setDrawColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                doc.setLineWidth(1);
                doc.rect(W - 45, H - 45, qrSize, qrSize);
                doc.setFontSize(7);
                doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                doc.text("SCAN TO SAVE", W - 30, H - 48, { align: 'center' });
                doc.text("Digital Version", W - 30, H - 12, { align: 'center' });
            }

            // Student Tip
            doc.setFontSize(6);
            doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.text(`Student Action: ${slide.type === 'quiz' ? 'Engage & Answer' : 'Note key concepts'}`, 18, H - 10);

            // Footer
            doc.setFontSize(7);
            doc.setTextColor(170, 170, 170);
            doc.text(`${schoolName} | Premium AI Lesson by ${teacherName}`, W / 2, H - 6, { align: 'center' });
        });

        doc.save(`${file?.name?.split('.')[0] || 'Lesson'}-Slides.pdf`);
        toast.success("PDF Downloaded!");
    };

    const handleShare = async () => {
        if (!selectedClass || !slideData) return toast.error("Select a class to share with");
        setIsSharing(true);
        const res = await shareNoteWithClass({
            classId: selectedClass,
            title: slideData[0]?.title || "AI Lesson",
            content: slideData,
            fileUrl: "client-generated"
        });
        setIsSharing(false);
        if (res.error) toast.error(res.error);
        else toast.success("Shared with class!");
    };

    const SlidePreview = ({ slide, index }: { slide: any; index: number }) => {
        const theme = THEMES[index % THEMES.length];
        const bgStyle = { backgroundColor: `rgb(${theme.bg.join(',')})`, color: `rgb(${theme.text.join(',')})` };
        const accentStyle = { color: `rgb(${theme.sub.join(',')})` };

        return (
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700" style={bgStyle}>
                <div className="p-8 min-h-[400px] flex flex-col relative">
                    <div className="flex justify-between items-center mb-6 opacity-60 text-[10px] uppercase tracking-widest font-black">
                        <span>{schoolName}</span>
                        <span>BY {teacherName}</span>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <span className="text-5xl mb-2 block">{slide.emoji || '📄'}</span>
                            <h3 className="text-2xl font-black leading-tight">{slide.title}</h3>
                            <div className="h-1 w-20 rounded-full" style={{ backgroundColor: `rgb(${theme.sub.join(',')})` }}></div>

                            {slide.type === 'title' && <p className="text-lg opacity-80 italic">{slide.subtitle}</p>}
                            {(slide.type === 'content' || slide.type === 'summary') && (
                                <ul className="space-y-3 text-sm">
                                    {(slide.points || []).slice(0, 5).map((p: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: `rgb(${theme.sub.join(',')})` }}></span>
                                            {p}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {slide.type === 'quiz' && (
                                <div className="space-y-4 text-sm">
                                    {(slide.questions || []).slice(0, 2).map((q: any, i: number) => (
                                        <div key={i} className="space-y-2">
                                            <p className="font-bold border-l-4 pl-3" style={{ borderColor: `rgb(${theme.sub.join(',')})` }}>{q.q}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {slide.visual && (
                            <div className="w-full md:w-1/3 p-6 rounded-3xl border border-black/5 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center">
                                <p className="text-[10px] font-black mb-4 opacity-50 uppercase tracking-widest">{slide.visual.type}</p>
                                {slide.visual.type === 'process' && (
                                    <div className="space-y-2 w-full">
                                        {slide.visual.steps?.map((s: string, i: number) => (
                                            <div key={i} className="bg-white/50 p-2 rounded-xl text-[10px] font-bold shadow-sm">{s}</div>
                                        ))}
                                    </div>
                                )}
                                {slide.visual.type === 'comparison' && (
                                    <div className="space-y-2 w-full">
                                        <div className="bg-white/50 p-3 rounded-xl text-xs font-bold">{slide.visual.left}</div>
                                        <div className="text-[10px] font-black opacity-30">VS</div>
                                        <div className="bg-black/20 text-white p-3 rounded-xl text-xs font-bold">{slide.visual.right}</div>
                                    </div>
                                )}
                                {slide.visual.type === 'facts' && (
                                    <div className="grid grid-cols-1 gap-4">
                                        {slide.visual.data?.map((d: any, i: number) => (
                                            <div key={i}>
                                                <div className="text-3xl font-black" style={accentStyle}>{d.value}</div>
                                                <div className="text-[10px] font-bold opacity-60 uppercase">{d.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-4 right-8 text-[11px] font-black opacity-30">
                        SLIDE {index + 1} OF {slideData!.length}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-10">
            {/* PHASE 1: UPLOAD & RESEARCH */}
            {phase === 'upload' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Source File */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">1. Core Resource (PDF/DOC)</Label>
                            <div className="group relative border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer">
                                <input
                                    type="file"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                        <FileUp className="w-10 h-10 text-indigo-500" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {file ? file.name : "Upload Primary Material"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Research Links */}
                        <div className="space-y-3">
                            <Label className="text-sm font-bold uppercase tracking-wider text-slate-500">2. Enhance with External Links</Label>
                            <div className="space-y-3">
                                {links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <div className="relative flex-1">
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                            <Input
                                                placeholder="YouTube or Website URL"
                                                className="pl-10 rounded-xl"
                                                value={link}
                                                onChange={(e) => updateLinkField(idx, e.target.value)}
                                            />
                                        </div>
                                        {links.length > 1 && (
                                            <Button variant="ghost" size="icon" onClick={() => removeLinkField(idx)} className="rounded-xl text-red-500 hover:bg-red-50">
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={addLinkField} className="w-full rounded-xl border-dashed border-slate-300 text-slate-500 hover:text-indigo-600">
                                    <Plus className="w-4 h-4 mr-2" /> Add another research link
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-t pt-8">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <Label className="text-sm font-bold whitespace-nowrap">Language:</Label>
                            <Select value={language} onValueChange={setLanguage}>
                                <SelectTrigger className="w-[180px] rounded-xl h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="English">English</SelectItem>
                                    <SelectItem value="Hindi">Hindi</SelectItem>
                                    <SelectItem value="Marathi">Marathi</SelectItem>
                                    <SelectItem value="Spanish">Spanish</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            onClick={handleSynthesize}
                            disabled={!file && links.every(l => !l.trim())}
                            className="w-full md:w-auto px-10 h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 text-lg font-black"
                        >
                            Start Research Synthesis <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* PHASE 2: SYNTHESIZING */}
            {phase === 'synthesizing' && (
                <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="relative">
                        <Loader2 className="w-20 h-20 text-indigo-500 animate-spin" />
                        <Wand2 className="w-8 h-8 text-amber-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Synthesizing Your Research</h2>
                        <p className="text-slate-500 max-w-sm">{progress}</p>
                    </div>
                </div>
            )}

            {/* PHASE 3: VERIFYING / EDITING */}
            {phase === 'verifying' && (
                <div className="space-y-6 animate-in slide-in-from-right-10 duration-500">
                    <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-3xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="bg-amber-500 text-white p-2 rounded-xl">
                                <Save className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-amber-900 dark:text-amber-400">Step 2: Review & Verify Content</h3>
                                <p className="text-sm text-amber-800/70 dark:text-amber-400/50">Edit the summary below to refine your lesson before building slides.</p>
                            </div>
                        </div>
                        <Textarea
                            value={synthesisText}
                            onChange={(e) => setSynthesisText(e.target.value)}
                            className="min-h-[400px] rounded-2xl bg-white dark:bg-slate-900 border-amber-200 text-base leading-relaxed p-6 focus-visible:ring-amber-500"
                            placeholder="AI is preparing your summary..."
                        />
                    </div>
                    <div className="flex gap-4 justify-end">
                        <Button variant="outline" onClick={() => setPhase('upload')} className="h-12 rounded-xl px-8">
                            Back
                        </Button>
                        <Button onClick={handleGenerateSlides} className="h-12 rounded-xl px-12 bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-500/20">
                            Confirm & Generate Premium Slides <Presentation className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* PHASE 4: GENERATING */}
            {phase === 'generating' && (
                <div className="min-h-[400px] flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black text-slate-800 dark:text-white">Crafting Masterpiece Slides</h2>
                        <p className="text-slate-500">{progress}</p>
                    </div>
                </div>
            )}

            {/* PHASE 5: DONE (PREVIEW & SHARE) */}
            {phase === 'done' && slideData && (
                <div className="space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="flex items-center justify-between bg-emerald-600 text-white p-6 rounded-3xl shadow-xl shadow-emerald-500/20">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="w-10 h-10" />
                            <div className="hidden sm:block">
                                <h3 className="text-xl font-bold">{slideData.length} Professional Slides Ready</h3>
                                <p className="text-emerald-100/80 text-sm">Download your premium lesson deck now.</p>
                            </div>
                        </div>
                        <Button onClick={downloadPDF} size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50 rounded-2xl font-black px-8">
                            <Download className="w-5 h-5 mr-3" /> Download PDF
                        </Button>
                    </div>

                    {/* Preview Carousel */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black flex items-center gap-3">
                                <Eye className="w-6 h-6 text-indigo-500" /> Slide Preview
                            </h4>
                            <div className="flex items-center gap-3">
                                <Button size="icon" variant="outline" className="rounded-full w-12 h-12" disabled={currentSlide === 0} onClick={() => setCurrentSlide(currentSlide - 1)}>←</Button>
                                <span className="font-mono text-lg font-bold">{currentSlide + 1} / {slideData.length}</span>
                                <Button size="icon" variant="outline" className="rounded-full w-12 h-12" disabled={currentSlide === slideData.length - 1} onClick={() => setCurrentSlide(currentSlide + 1)}>→</Button>
                            </div>
                        </div>
                        <SlidePreview slide={slideData[currentSlide]} index={currentSlide} />
                    </div>

                    {/* Sharing */}
                    <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
                        <h4 className="text-lg font-bold flex items-center gap-3">
                            <Share2 className="w-6 h-6 text-indigo-500" /> Publish to Classroom
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="rounded-2xl h-14 flex-1 bg-white dark:bg-slate-900 border-slate-200">
                                    <SelectValue placeholder="Choose target class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map((cls) => (
                                        <SelectItem key={cls.id} value={cls.id}>
                                            Class {cls.name} {cls.section}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                onClick={handleShare}
                                disabled={isSharing || !selectedClass}
                                className="h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 font-bold"
                            >
                                {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Share with Students"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
