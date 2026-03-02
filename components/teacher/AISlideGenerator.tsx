'use client';

import React, { useState } from 'react';
import { shareNoteWithClass } from '@/lib/actions/ai-slides';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, FileUp, Share2, CheckCircle2, Download, Presentation, Eye } from 'lucide-react';
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

export default function AISlideGenerator({ classes }: { classes: any[] }) {
    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState("English");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [slideData, setSlideData] = useState<any[] | null>(null);
    const [selectedClass, setSelectedClass] = useState("");
    const [progress, setProgress] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [currentSlide, setCurrentSlide] = useState(0);

    const handleGenerate = async () => {
        if (!file) return toast.error("Please select a file first");

        setIsGenerating(true);
        setErrorMsg("");
        setProgress("Uploading document...");

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('language', language);

            setProgress("AI is analyzing your document...");

            const response = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                body: formData
            });

            setProgress("Building slides...");

            let data: any = {};
            try {
                data = await response.json();
            } catch {
                data = { error: `Server timeout (HTTP ${response.status}). Try a smaller file.` };
            }

            if (!response.ok || data.error) {
                const msg = data.error || `Generation failed (HTTP ${response.status})`;
                setErrorMsg(msg);
                toast.error(msg);
            } else {
                setSlideData(data.slideData);
                setCurrentSlide(0);
                setErrorMsg("");
                toast.success(`Generated ${data.slideData?.length || 0} slides!`);
            }
        } catch (err: any) {
            const msg = "Network error: " + (err.message || "Check your connection");
            setErrorMsg(msg);
            toast.error(msg);
        } finally {
            setIsGenerating(false);
            setProgress("");
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

            // Slide number badge (top-right)
            doc.setFillColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.roundedRect(W - 30, 8, 22, 10, 5, 5, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(8);
            doc.text(`${idx + 1} / ${slideData.length}`, W - 19, 14.5, { align: 'center' });

            // Title
            doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
            doc.setFontSize(22);
            const title = slide.title || "Untitled";
            const wrappedTitle = doc.splitTextToSize(title, W - 60);
            doc.text(wrappedTitle, 18, 28);

            // Divider line under title
            const titleH = wrappedTitle.length * 9;
            doc.setDrawColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.setLineWidth(0.5);
            doc.line(18, 22 + titleH, W - 20, 22 + titleH);

            const startY = 28 + titleH;

            if (slide.type === 'title') {
                // Subtitle centered
                doc.setFontSize(14);
                doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                const sub = doc.splitTextToSize(slide.subtitle || '', W - 60);
                doc.text(sub, 18, startY + 10);

            } else if (slide.type === 'content' || slide.type === 'summary') {
                doc.setFontSize(11);
                doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                let y = startY + 5;
                (slide.points || []).slice(0, 7).forEach((p: string) => {
                    const bullet = doc.splitTextToSize(`  •  ${p}`, W - 50);
                    doc.text(bullet, 20, y);
                    y += bullet.length * 6 + 3;
                });

            } else if (slide.type === 'quiz') {
                doc.setFontSize(10);
                let y = startY + 5;
                (slide.questions || []).slice(0, 4).forEach((q: any, qi: number) => {
                    doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                    doc.setFontSize(11);
                    const qText = doc.splitTextToSize(`Q${qi + 1}. ${q.q}`, W - 50);
                    doc.text(qText, 20, y);
                    y += qText.length * 6 + 2;

                    doc.setFontSize(9);
                    doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                    if (q.options) {
                        q.options.forEach((o: string, oi: number) => {
                            doc.text(`  ${String.fromCharCode(65 + oi)})  ${o}`, 25, y);
                            y += 5;
                        });
                    }
                    y += 4;
                });

            } else if (slide.type === 'lesson_plan') {
                let y = startY + 5;
                doc.setFontSize(12);
                doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                doc.text("Objectives:", 20, y); y += 7;

                doc.setFontSize(10);
                doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                (slide.objectives || []).forEach((o: string) => {
                    const t = doc.splitTextToSize(`  •  ${o}`, W - 50);
                    doc.text(t, 22, y);
                    y += t.length * 5 + 3;
                });

                y += 5;
                doc.setFontSize(12);
                doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
                doc.text("Activities:", 20, y); y += 7;

                doc.setFontSize(10);
                doc.setTextColor(theme.text[0], theme.text[1], theme.text[2]);
                (slide.activities || []).forEach((a: string) => {
                    const t = doc.splitTextToSize(`  •  ${a}`, W - 50);
                    doc.text(t, 22, y);
                    y += t.length * 5 + 3;
                });
            }

            // Footer
            doc.setFontSize(7);
            doc.setTextColor(170, 170, 170);
            doc.text('Generated by AI Slide Generator', W / 2, H - 6, { align: 'center' });
        });

        doc.save(`${file?.name?.split('.')[0] || 'AI'}-Slides.pdf`);
        toast.success("PDF downloaded!");
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

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Shared with class!");
        }
    };

    // Slide Preview Component
    const SlidePreview = ({ slide, index }: { slide: any; index: number }) => {
        const theme = THEMES[index % THEMES.length];
        const bgStyle = { backgroundColor: `rgb(${theme.bg.join(',')})`, color: `rgb(${theme.text.join(',')})` };
        const accentStyle = { color: `rgb(${theme.sub.join(',')})` };

        return (
            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-700" style={bgStyle}>
                <div className="p-6 min-h-[220px] flex flex-col relative">
                    {/* Slide number */}
                    <div className="absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `rgba(${theme.sub.join(',')},0.3)` }}>
                        {index + 1}/{slideData!.length}
                    </div>

                    {/* Emoji */}
                    <span className="text-4xl mb-2">{slide.emoji || '📄'}</span>

                    {/* Title */}
                    <h3 className="text-lg font-bold leading-tight mb-2">{slide.title}</h3>

                    {/* Content */}
                    {slide.type === 'title' && (
                        <p className="text-sm opacity-70 mt-1">{slide.subtitle}</p>
                    )}

                    {(slide.type === 'content' || slide.type === 'summary') && (
                        <ul className="space-y-1 text-xs mt-1">
                            {(slide.points || []).slice(0, 4).map((p: string, i: number) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="mt-0.5" style={accentStyle}>●</span> {p}
                                </li>
                            ))}
                            {(slide.points?.length || 0) > 4 && (
                                <li className="opacity-50 text-[10px]">+{slide.points.length - 4} more in PDF</li>
                            )}
                        </ul>
                    )}

                    {slide.type === 'quiz' && (
                        <div className="space-y-2 text-xs mt-1">
                            {(slide.questions || []).slice(0, 2).map((q: any, i: number) => (
                                <div key={i}>
                                    <p className="font-medium">Q{i + 1}. {q.q}</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {q.options?.map((o: string, j: number) => (
                                            <span key={j} className="px-1.5 py-0.5 rounded text-[10px] bg-white/20">{String.fromCharCode(65 + j)}) {o}</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {slide.type === 'lesson_plan' && (
                        <div className="text-xs space-y-2 mt-1">
                            <div>
                                <span className="font-semibold" style={accentStyle}>Objectives:</span>
                                <ul className="mt-0.5 space-y-0.5">{(slide.objectives || []).map((o: string, i: number) => <li key={i}>• {o}</li>)}</ul>
                            </div>
                            <div>
                                <span className="font-semibold" style={accentStyle}>Activities:</span>
                                <ul className="mt-0.5 space-y-0.5">{(slide.activities || []).map((a: string, i: number) => <li key={i}>• {a}</li>)}</ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-8">
            {/* Step 1: Upload & Generate */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Select File (PDF, Image, DOC)</Label>
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-indigo-500 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                                onChange={(e) => { setFile(e.target.files?.[0] || null); setSlideData(null); setErrorMsg(""); }}
                            />
                            <div className="flex flex-col items-center gap-2">
                                <FileUp className="w-8 h-8 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {file ? file.name : "Click to upload or drag and drop"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Target Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="rounded-xl h-12">
                                <SelectValue placeholder="Select Language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="English">English</SelectItem>
                                <SelectItem value="Hindi">Hindi</SelectItem>
                                <SelectItem value="Marathi">Marathi</SelectItem>
                                <SelectItem value="Gujarati">Gujarati</SelectItem>
                                <SelectItem value="Spanish">Spanish</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !file}
                    className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {progress || "Processing..."}</>
                    ) : (
                        <><Presentation className="w-5 h-5 mr-2" /> Generate Slide Deck</>
                    )}
                </Button>

                {errorMsg && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
                        <span className="text-red-500 text-xl mt-0.5">⚠️</span>
                        <div>
                            <p className="font-semibold text-red-700 dark:text-red-400 text-sm">Generation Failed</p>
                            <p className="text-red-600 dark:text-red-300 text-xs mt-1">{errorMsg}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Step 2: Slide Preview & Actions */}
            {slideData && (
                <div className="pt-8 border-t border-slate-100 dark:border-slate-700 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Success banner + Download */}
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-500/20">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{slideData.length} Slides Ready!</h3>
                                    <p className="text-sm text-slate-500">Preview below or download as PDF</p>
                                </div>
                            </div>
                            <Button onClick={downloadPDF} className="bg-emerald-600 hover:bg-emerald-700 rounded-xl h-11 px-6">
                                <Download className="w-5 h-5 mr-2" /> Download PDF
                            </Button>
                        </div>
                    </div>

                    {/* Slide Carousel */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Eye className="w-5 h-5 text-indigo-500" /> Slide Preview
                            </h4>
                            <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" className="rounded-lg" disabled={currentSlide === 0} onClick={() => setCurrentSlide(currentSlide - 1)}>←</Button>
                                <span className="text-sm font-medium text-slate-500">{currentSlide + 1} / {slideData.length}</span>
                                <Button size="sm" variant="outline" className="rounded-lg" disabled={currentSlide === slideData.length - 1} onClick={() => setCurrentSlide(currentSlide + 1)}>→</Button>
                            </div>
                        </div>
                        <SlidePreview slide={slideData[currentSlide]} index={currentSlide} />
                    </div>

                    {/* Share */}
                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-indigo-500" /> Share with Students
                        </h4>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="rounded-xl h-11 flex-1">
                                    <SelectValue placeholder="Choose a class to share with" />
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
                                className="h-11 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700"
                            >
                                {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : "Share & Notify"}
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">
                            Shared content will be available for 30 days in students&apos; AI Notes section.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
