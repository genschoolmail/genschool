'use client';

import React, { useState, useEffect, useRef } from 'react';
import { shareNoteWithClass } from '@/lib/actions/ai-slides';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    Loader2, FileUp, Share2, CheckCircle2, Download, Presentation, Eye,
    Link as LinkIcon, Plus, X, ArrowRight, Save, Wand2, Sparkles,
    Quote, BookOpen, MessageSquare, History, Layout, Settings,
    ChevronLeft, ChevronRight, Search, FileText, Trash2, Maximize2,
    Copy, Lightbulb, FileCheck, Map, Music, UserCircle, StickyNote
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

// "Studio" 2025 Themes
const THEMES = [
    { bg: [26, 26, 26], text: [255, 255, 255], accent: [232, 255, 65], sub: [150, 150, 150] }, // Dark Navy + Magic Yellow
    { bg: [30, 41, 59], text: [255, 255, 255], accent: [56, 189, 248], sub: [148, 163, 184] }, // Slate + Sky Blue
    { bg: [15, 23, 42], text: [255, 255, 255], accent: [244, 63, 94], sub: [100, 116, 139] },  // Deep Space + Rose
];

type Source = {
    id: string;
    type: 'file' | 'link';
    name: string;
    url?: string;
    file?: File;
};

type ChatMessage = {
    role: 'user' | 'ai';
    content: string;
    sources?: string[];
};

type StickyNoteData = {
    id: string;
    content: string;
    category: 'fact' | 'idea' | 'draft';
    timestamp: number;
};

type Phase = 'library' | 'research' | 'slides';

export default function AISlideGenerator({
    classes,
    schoolName = "School",
    teacherName = "Teacher"
}: {
    classes: any[],
    schoolName?: string,
    teacherName?: string
}) {
    // --- State: Research Studio Workspace ---
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [rightPanelOpen, setRightPanelOpen] = useState(false);
    const [currentPhase, setCurrentPhase] = useState<Phase>('library');
    const [sources, setSources] = useState<Source[]>([]);
    const [language, setLanguage] = useState("English");
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressLabel, setProgressLabel] = useState("");

    // --- State: Intelligence Suite (v7) ---
    const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
    const [persona, setPersona] = useState("Academic Deep Dive");
    const [mermaidCode, setMermaidCode] = useState<string | null>(null);

    // --- State: Research Hub (Chat) ---
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userQuery, setUserQuery] = useState("");
    const [synthesisText, setSynthesisText] = useState("");

    // --- State: Slide Canvas ---
    const [slideData, setSlideData] = useState<any[] | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedClass, setSelectedClass] = useState("");
    const [isSharing, setIsSharing] = useState(false);

    // Dynamic Mermaid Import (v7)
    useEffect(() => {
        if (mermaidCode) {
            // @ts-ignore
            import('mermaid').then(m => {
                m.default.initialize({ startOnLoad: true, theme: 'dark' });
                m.default.contentLoaded();
            });
        }
    }, [mermaidCode]);

    // --- Persistence: LocalStorage ---
    useEffect(() => {
        const savedNotebook = localStorage.getItem('active_notebook_studio_v7');
        if (savedNotebook) {
            try {
                const data = JSON.parse(savedNotebook);
                if (data.sources) setSources(data.sources.filter((s: any) => s.type === 'link'));
                if (data.chatHistory) setChatHistory(data.chatHistory);
                if (data.synthesisText) setSynthesisText(data.synthesisText);
                if (data.slideData) setSlideData(data.slideData);
                if (data.stickyNotes) setStickyNotes(data.stickyNotes);
                if (data.persona) setPersona(data.persona);
            } catch (e) {
                console.error("Failed to load notebook", e);
            }
        }
    }, []);

    useEffect(() => {
        const dataToSave = {
            sources: sources.filter(s => s.type === 'link'),
            chatHistory,
            synthesisText,
            slideData,
            stickyNotes,
            persona
        };
        localStorage.setItem('active_notebook_studio_v7', JSON.stringify(dataToSave));
    }, [sources, chatHistory, synthesisText, slideData, stickyNotes, persona]);

    // --- Source Management ---
    const addLink = (url: string) => {
        if (!url) return;
        const newSource: Source = { id: Math.random().toString(36).substr(2, 9), type: 'link', name: url, url };
        setSources([...sources, newSource]);
    };

    const addFile = (file: File) => {
        const newSource: Source = { id: Math.random().toString(36).substr(2, 9), type: 'file', name: file.name, file };
        setSources([...sources, newSource]);
    };

    const removeSource = (id: string) => setSources(sources.filter(s => s.id !== id));

    const saveNote = (content: string, category: 'fact' | 'idea' | 'draft' = 'fact') => {
        const newNote: StickyNoteData = {
            id: Math.random().toString(36).substr(2, 9),
            content,
            category,
            timestamp: Date.now()
        };
        setStickyNotes([newNote, ...stickyNotes]);
        setRightPanelOpen(true);
        toast.success("Saved to Output Dashboard");
    };

    // --- Synthesis: Phase 1 ---
    const handleSynthesizeAll = async () => {
        if (sources.length === 0) return toast.error("Please add at least one source");
        setIsProcessing(true);
        setCurrentPhase('research');
        setProgressLabel(`Applying ${persona} Synthesis...`);

        try {
            const formData = new FormData();
            const links = sources.filter(s => s.type === 'link').map(s => s.url);
            const files = sources.filter(s => s.type === 'file').map(s => s.file);

            files.forEach(f => formData.append('file', f!));
            formData.append('links', JSON.stringify(links));
            formData.append('language', language);
            formData.append('persona', persona);

            const res = await fetch('/api/teacher/synthesize-research', { method: 'POST', body: formData });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setSynthesisText(data.synthesis);
            setChatHistory([{
                role: 'ai',
                content: `Synthesis Complete (${persona}). I've analyzed ${sources.length} sources. What would you like to explore first?`
            }]);
        } catch (err: any) {
            toast.error(err.message);
            setCurrentPhase('library');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChatQuery = async () => {
        if (!userQuery.trim() || !synthesisText) return;
        const newUserMsg: ChatMessage = { role: 'user', content: userQuery };
        setChatHistory(prev => [...prev, newUserMsg]);
        setUserQuery("");

        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: synthesisText,
                    customQuery: userQuery,
                    mode: 'chat',
                    persona
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);
        } catch (err: any) {
            toast.error("Failed to reach Hub Assistant");
        }
    };

    const handleTransform = async (template: 'briefing' | 'faq' | 'timeline' | 'graph') => {
        if (!synthesisText) return;
        setIsProcessing(true);
        setProgressLabel(`Generating ${template}...`);
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    summary: synthesisText,
                    mode: 'transform',
                    template,
                    language
                })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (template === 'graph') {
                setMermaidCode(data.output);
                toast.success("Knowledge Graph Built");
            } else {
                saveNote(data.output, 'draft');
            }
        } catch (err: any) {
            toast.error(`Failed to generate ${template}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // --- Slide Generation ---
    const handleBuildSlides = async () => {
        setIsProcessing(true);
        setProgressLabel("Designing Gamma-style Studio Deck...");
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesisText, language, teacherName, schoolName, persona })
            });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setSlideData(data.slideData);
            setCurrentPhase('slides');
            setCurrentSlide(0);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsProcessing(false);
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

            doc.setFillColor(10, 10, 10);
            doc.rect(0, 0, W, H, 'F');

            doc.setFontSize(8);
            doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.setFont('helvetica', 'bold');
            doc.text(`GROUNDED IN RESEARCH | ${schoolName.toUpperCase()}`, 15, 12);
            doc.text(`NOTEBOOKLM STUDIO v2.0`, W - 15, 12, { align: 'right' });

            const layout = slide.layout || 'STUDIO_SPLIT';

            if (layout === 'STUDIO_SPLIT') {
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(28);
                doc.setFont('helvetica', 'bold');
                const titleText = doc.splitTextToSize(slide.title?.toUpperCase() || "UNTITLED", W / 2 - 35);
                doc.text(titleText, 20, 45);

                let startY = 45 + (titleText.length * 12) + 10;
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                (slide.points || []).forEach((p: string, pi: number) => {
                    if (pi > 3) return;
                    const wrappedP = doc.splitTextToSize(p, W / 2 - 35);
                    doc.setFillColor(theme.accent[0], theme.accent[1], theme.accent[2]);
                    doc.setGState(new (doc as any).GState({ opacity: 0.2 }));
                    doc.rect(20, startY - 4, 15, 6, 'F');
                    doc.setGState(new (doc as any).GState({ opacity: 1 }));
                    doc.setTextColor(255, 255, 255);
                    doc.text(wrappedP, 20, startY + 2);
                    startY += (wrappedP.length * 6) + 12;
                });

                const cardX = W / 2 + 10;
                const cardW = W / 2 - 25;
                doc.setFillColor(255, 255, 255, 0.05);
                doc.roundedRect(cardX, 30, cardW, H - 60, 8, 8, 'F');
                doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
                doc.setFontSize(50);
                doc.text(slide.emoji || "✨", cardX + cardW / 2, H / 2, { align: 'center' });
            } else if (layout === 'STUDIO_CENTER') {
                doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
                doc.setFontSize(50);
                doc.setFont('helvetica', 'bold');
                const heroTitle = doc.splitTextToSize(slide.title?.toUpperCase() || "", W - 60);
                doc.text(heroTitle, W / 2, H / 2 - 10, { align: 'center' });
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(18);
                doc.setFont('helvetica', 'italic');
                doc.text(slide.subtitle || slide.points?.[0] || "", W / 2, H / 2 + 15, { align: 'center' });
            } else if (layout === 'STUDIO_GRID') {
                doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
                doc.setFontSize(22);
                doc.setFont('helvetica', 'bold');
                doc.text(slide.title?.toUpperCase() || "OVERVIEW", 20, 40);

                let gx = 20;
                const gw = (W - 60) / 3;
                (slide.points || []).slice(0, 3).forEach((p: string, i: number) => {
                    doc.setFillColor(255, 255, 255, 0.05);
                    doc.roundedRect(gx, 50, gw, 60, 5, 5, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(9);
                    const wrappedP = doc.splitTextToSize(p, gw - 10);
                    doc.text(wrappedP, gx + 5, 65);
                    gx += gw + 10;
                });
            }

            doc.setFontSize(8);
            doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.setFont('helvetica', 'normal');
            doc.text(`Instructor: ${teacherName} | Source: Integrated Research Portfolio`, 20, H - 10);
            doc.text(`PAGE ${idx + 1}`, W - 20, H - 10, { align: 'right' });
            doc.setDrawColor(theme.accent[0], theme.accent[1], theme.accent[2]);
            doc.setGState(new (doc as any).GState({ opacity: 0.3 }));
            doc.line(20, H - 15, W - 20, H - 15);
        });

        doc.save(`${schoolName}-${teacherName}-IntelligenceSuite.pdf`);
    };

    const handleShare = async () => {
        if (!selectedClass || !slideData) return toast.error("Select a class");
        setIsSharing(true);
        const res = await shareNoteWithClass({
            classId: selectedClass,
            title: slideData[0]?.title || "AI Research Lesson",
            content: slideData,
            fileUrl: "studio-v7-generated"
        });
        setIsSharing(false);
        if (res.error) toast.error(res.error);
        else toast.success("Shared with class!");
    };

    // --- Render Helpers ---

    const Sidebar = () => (
        <motion.div
            initial={false}
            animate={{ width: sidebarOpen ? 300 : 0 }}
            className="h-full bg-slate-50 dark:bg-[#121212] border-r border-slate-200 dark:border-white/10 flex flex-col overflow-hidden relative"
        >
            <div className="p-6 space-y-8 min-w-[300px] flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Intelligence Source</h2>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}><ChevronLeft className="w-4 h-4" /></Button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-indigo-500">Director's Persona</Label>
                        <Select value={persona} onValueChange={setPersona}>
                            <SelectTrigger className="w-full h-11 rounded-xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Academic Deep Dive">Academic Deep Dive</SelectItem>
                                <SelectItem value="Classroom Storytellers">Classroom Storytelling</SelectItem>
                                <SelectItem value="Skeptical Analyst">Skeptical Analyst</SelectItem>
                                <SelectItem value="Quick Summary">Quick Summary</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Library ({sources.length})</Label>
                        <div className="space-y-2 overflow-y-auto max-h-[300px] no-scrollbar">
                            <AnimatePresence>
                                {sources.map(s => (
                                    <motion.div
                                        key={s.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {s.type === 'file' ? <FileText className="w-3 h-3 text-indigo-400" /> : <LinkIcon className="w-3 h-3 text-emerald-400" />}
                                            <span className="text-[11px] font-bold truncate">{s.name}</span>
                                        </div>
                                        <button onClick={() => removeSource(s.id)} className="text-slate-400 hover:text-red-500"><X className="w-3 h-3" /></button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-6 space-y-4">
                    <div className="relative group">
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => {
                            if (e.target.files) Array.from(e.target.files).forEach(addFile);
                        }} />
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-xl shadow-indigo-500/20 group-hover:bg-indigo-700 transition-all">
                            <FileUp className="w-4 h-4" />
                            <span>Add Research Files</span>
                        </div>
                    </div>
                    <Input
                        placeholder="Paste URL..."
                        className="rounded-2xl border-dashed h-12 text-xs font-bold"
                        onKeyDown={(e) => e.key === 'Enter' && (addLink((e.target as HTMLInputElement).value), (e.target as HTMLInputElement).value = '')}
                    />
                </div>
            </div>
        </motion.div>
    );

    const OutputDashboard = () => (
        <motion.div
            initial={false}
            animate={{ width: rightPanelOpen ? 320 : 0 }}
            className="h-full bg-slate-50 dark:bg-[#0D0D0D] border-l border-slate-200 dark:border-white/10 flex flex-col overflow-hidden relative"
        >
            <div className="p-6 space-y-6 min-w-[320px] h-full flex flex-col">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-black uppercase tracking-widest text-[#E8FF41]">Intelligence Suite</h2>
                    <Button variant="ghost" size="icon" onClick={() => setRightPanelOpen(false)}><ChevronRight className="w-4 h-4" /></Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-indigo-500">Output Drafts & Notes</Label>
                        <div className="space-y-3">
                            {stickyNotes.length === 0 ? (
                                <div className="p-12 text-center opacity-20 border-2 border-dashed rounded-3xl">
                                    <StickyNote className="w-8 h-8 mx-auto mb-2" />
                                    <p className="text-[10px] font-black">No Notes Saved</p>
                                </div>
                            ) : (
                                stickyNotes.map(note => (
                                    <motion.div
                                        key={note.id}
                                        layout
                                        className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2 relative group"
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${note.category === 'fact' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {note.category}
                                            </span>
                                            <button onClick={() => setStickyNotes(stickyNotes.filter(n => n.id !== note.id))} className="opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3 text-red-500" /></button>
                                        </div>
                                        <p className="text-xs font-medium leading-relaxed">{note.content}</p>
                                        <div className="text-[8px] opacity-30 text-right">{new Date(note.timestamp).toLocaleTimeString()}</div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/10 space-y-2">
                    <Button onClick={downloadPDF} className="w-full h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-bold text-xs hover:bg-[#E8FF41] hover:text-black transition-all">
                        <FileCheck className="w-4 h-4 mr-2" /> Export Smart PDF
                    </Button>
                </div>
            </div>
        </motion.div>
    );

    const SlidePreview = ({ slide, index }: { slide: any; index: number }) => {
        const theme = THEMES[index % THEMES.length];
        const layout = slide.layout || 'STUDIO_SPLIT';

        return (
            <div className="rounded-[40px] overflow-hidden shadow-2xl border border-white/10 bg-[#0A0A0A] text-white aspect-video relative group flex-shrink-0 w-full snap-center">
                <div className="absolute top-8 left-10 right-10 flex justify-between items-center opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">
                    <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-[#E8FF41]" />
                        <span>Intelligence Suite v7</span>
                    </div>
                    <span>{schoolName} • {persona}</span>
                </div>

                <div className="p-16 h-full flex items-center">
                    {layout === 'STUDIO_SPLIT' ? (
                        <div className="grid grid-cols-2 gap-16 w-full items-center">
                            <div className="space-y-10 text-left">
                                <h3 className="text-5xl font-black leading-tight tracking-tighter uppercase text-[#E8FF41]">
                                    {slide.title}
                                </h3>
                                <div className="space-y-6">
                                    {(slide.points || []).slice(0, 3).map((p: string, i: number) => (
                                        <div key={i} className="relative pl-8">
                                            <div className="absolute left-0 top-0 w-1.5 h-full bg-[#E8FF41] rounded-full opacity-40"></div>
                                            <p className="text-lg font-medium leading-relaxed opacity-90">{p}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-white/5 rounded-[48px] aspect-square flex flex-col items-center justify-center border border-white/10 relative overflow-hidden group-hover:border-[#E8FF41]/50 transition-all duration-700">
                                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #E8FF41 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                                <span className="text-[12rem] relative z-10 filter drop-shadow-[0_0_50px_rgba(232,255,65,0.3)]">{slide.emoji || '🧬'}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-full text-center space-y-10">
                            <span className="text-9xl mb-6 block drop-shadow-2xl">{slide.emoji || '🌟'}</span>
                            <h2 className="text-[5rem] font-black text-[#E8FF41] uppercase tracking-tighter leading-none">{slide.title}</h2>
                            <p className="text-3xl opacity-60 max-w-3xl mx-auto italic font-medium leading-relaxed">{slide.subtitle || slide.points?.[0]}</p>
                        </div>
                    )}
                </div>

                <div className="absolute bottom-8 left-10 right-10 flex justify-between items-center opacity-40 text-[10px] uppercase font-black tracking-widest">
                    <div className="flex items-center gap-3">
                        <Settings className="w-4 h-4 text-[#E8FF41]" />
                        <span>Authorized for {teacherName}</span>
                    </div>
                    <span>Page {index + 1} of {slideData?.length}</span>
                </div>
            </div>
        );
    };

    // --- Main Workflow Router ---
    return (
        <div className="fixed inset-0 bg-[#0A0A0A] text-slate-900 dark:text-white flex overflow-hidden font-sans">
            {/* Sidebar (Sources & Persona) */}
            <Sidebar />

            {/* Content Area */}
            <main className="flex-1 flex flex-col relative bg-white dark:bg-[#0A0A0A]">
                {/* Global Luxury Header */}
                <header className="h-20 border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-10 bg-white/50 dark:bg-[#0A0A0A]/80 backdrop-blur-3xl z-20">
                    <div className="flex items-center gap-8">
                        {!sidebarOpen && (
                            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="rounded-2xl w-12 h-12 bg-white/5"><ChevronRight /></Button>
                        )}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-2xl shadow-indigo-500/30">LM</div>
                            <div>
                                <h1 className="text-lg font-black uppercase tracking-[0.2em]">{schoolName} Studio v7</h1>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-black">Live Intelligence Feed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Phase Navigation Tabs */}
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 p-1.5 rounded-[24px] border border-slate-200 dark:border-white/10">
                        <button onClick={() => setCurrentPhase('library')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPhase === 'library' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}><BookOpen className="w-4 h-4 mb-1.5 mx-auto" /> Library</button>
                        <button onClick={() => synthesisText && setCurrentPhase('research')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPhase === 'research' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}><MessageSquare className="w-4 h-4 mb-1.5 mx-auto" /> Research Hub</button>
                        <button onClick={() => slideData && setCurrentPhase('slides')} className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPhase === 'slides' ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}><Layout className="w-4 h-4 mb-1.5 mx-auto" /> Studio</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-36 h-11 rounded-2xl text-xs font-black border-none bg-slate-100 dark:bg-white/5">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                {["English", "Hindi", "Marathi", "Spanish"].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setRightPanelOpen(!rightPanelOpen)}
                            className={`w-12 h-12 rounded-2xl transition-all ${rightPanelOpen ? 'bg-indigo-600 text-white' : 'bg-white/5 hover:bg-white/10'}`}
                        >
                            <StickyNote />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 overflow-hidden relative flex">
                    {/* TRANSFORMATION TOOLS FLOATING BAR */}
                    {synthesisText && currentPhase !== 'slides' && (
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-white/5 backdrop-blur-3xl rounded-[24px] border border-white/10 z-30 shadow-2xl">
                            <Button onClick={() => handleTransform('briefing')} variant="ghost" size="sm" className="rounded-xl text-[9px] font-black uppercase px-4 h-10 hover:bg-indigo-500/20"><FileText className="w-3 h-3 mr-2 text-indigo-400" /> Briefing</Button>
                            <Button onClick={() => handleTransform('faq')} variant="ghost" size="sm" className="rounded-xl text-[9px] font-black uppercase px-4 h-10 hover:bg-emerald-500/20"><MessageSquare className="w-3 h-3 mr-2 text-emerald-400" /> FAQ</Button>
                            <Button onClick={() => handleTransform('timeline')} variant="ghost" size="sm" className="rounded-xl text-[9px] font-black uppercase px-4 h-10 hover:bg-amber-500/20"><History className="w-3 h-3 mr-2 text-amber-400" /> Timeline</Button>
                            <div className="w-px h-6 bg-white/10 mx-2"></div>
                            <Button onClick={() => handleTransform('graph')} variant="ghost" size="sm" className="rounded-xl text-[9px] font-black uppercase px-4 h-10 hover:bg-rose-500/20"><Map className="w-3 h-3 mr-2 text-rose-400" /> Graph View</Button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                        {/* PHASE: LIBRARY */}
                        {currentPhase === 'library' && (
                            <div className="max-w-5xl mx-auto py-32 px-10">
                                {sources.length === 0 ? (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-10">
                                        <div className="w-32 h-32 bg-indigo-600/10 rounded-[48px] flex items-center justify-center mx-auto border border-indigo-600/20 relative">
                                            <div className="absolute inset-0 bg-indigo-600/20 blur-3xl rounded-full"></div>
                                            <BookOpen className="w-16 h-16 text-indigo-600 relative z-10" />
                                        </div>
                                        <div className="space-y-6">
                                            <h2 className="text-5xl font-black tracking-tighter uppercase tracking-[0.05em]">Initialize Workspace</h2>
                                            <p className="text-slate-400 text-xl max-w-xl mx-auto leading-relaxed font-medium">
                                                Your Intelligence Suite is ready. Add research sources from the left to begin the synthesis process.
                                            </p>
                                        </div>
                                        <Button onClick={() => setSidebarOpen(true)} className="h-16 rounded-3xl px-12 bg-indigo-600 font-black shadow-3xl shadow-indigo-600/30 hover:scale-105 transition-all">Build Your Knowledge Base</Button>
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                        <div className="md:col-span-2 space-y-10">
                                            <div className="p-10 rounded-[48px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-10 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] -z-10 group-hover:bg-indigo-600/20 transition-all duration-1000"></div>
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/20"><Sparkles className="w-8 h-8" /></div>
                                                    <div>
                                                        <h3 className="text-3xl font-black uppercase tracking-tighter">Ready for Intelligence</h3>
                                                        <p className="text-sm opacity-40 font-bold uppercase tracking-widest mt-1">Applying global context across {sources.length} inputs</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <Button onClick={handleSynthesizeAll} className="h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 font-black shadow-2xl flex-1 text-base">Generate Research Foundation</Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-8">
                                            <div className="p-8 rounded-[40px] bg-emerald-500/10 border border-emerald-500/20 space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500">Security & Privacy</span>
                                                </div>
                                                <p className="text-xs font-bold leading-relaxed opacity-60">Your research data is processed securely through internal AI gateways. Multi-factor encryption applied.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* PHASE: RESEARCH HUB */}
                        {currentPhase === 'research' && (
                            <div className="h-full flex flex-col bg-white dark:bg-[#0A0A0A] relative">
                                <div className="p-8 border-b border-black/5 dark:border-white/10 bg-white/50 dark:bg-[#0A0A0A]/50 backdrop-blur-3xl">
                                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-[#E8FF41] rounded-2xl flex items-center justify-center text-black shadow-xl shadow-yellow-500/10">
                                                <UserCircle className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black uppercase tracking-[0.2em]">Research Hub</h3>
                                                <p className="text-[10px] opacity-40 font-black uppercase tracking-widest">{persona} Enabled</p>
                                            </div>
                                        </div>
                                        <Button onClick={handleBuildSlides} className="h-12 px-8 rounded-2xl bg-indigo-600 font-black text-xs shadow-xl shadow-indigo-600/20">Finalize & Build Slides</Button>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-12 space-y-10 no-scrollbar relative">
                                    <AnimatePresence>
                                        {mermaidCode && currentPhase === 'research' && (
                                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto p-10 rounded-[48px] bg-white/5 border border-[#E8FF41]/20 my-12 relative overflow-hidden">
                                                <div className="flex justify-between items-center mb-8">
                                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#E8FF41]">Knowledge Mapping View</h4>
                                                    <Button variant="ghost" size="icon" onClick={() => setMermaidCode(null)} className="rounded-full"><X /></Button>
                                                </div>
                                                <div className="mermaid flex justify-center">{mermaidCode}</div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="max-w-4xl mx-auto space-y-12 pb-32">
                                        {chatHistory.map((msg, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className={`flex gap-8 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200 dark:bg-white/10' : 'bg-[#E8FF41] text-black shadow-lg shadow-yellow-500/20'}`}>
                                                    {msg.role === 'user' ? <UserCircle className="w-6 h-6" /> : <Sparkles className="w-5 h-5" />}
                                                </div>
                                                <div className="space-y-6 max-w-2xl">
                                                    <div className={`text-sm leading-[1.8] p-8 rounded-[32px] ${msg.role === 'user' ? 'bg-slate-100 dark:bg-indigo-600/10 text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-white/5 opacity-90'}`}>
                                                        {msg.content}
                                                        {msg.role === 'ai' && (
                                                            <div className="mt-8 flex gap-3 pt-6 border-t border-black/5 dark:border-white/5">
                                                                <Button variant="ghost" size="sm" onClick={() => saveNote(msg.content)} className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10"><Copy className="w-3 h-3 mr-2" /> Save Insight</Button>
                                                                <Button variant="ghost" size="sm" className="h-9 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10"><Lightbulb className="w-3 h-3 mr-2" /> Elaborate</Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {/* FOUNDATIONAL SUMMARY EDIT BOX */}
                                        {synthesisText && (
                                            <div className="p-1 rounded-[40px] bg-indigo-600/5 border border-indigo-600/20 mt-20 relative group">
                                                <div className="absolute -top-4 left-10 px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl">Master Synthesis Portfolio</div>
                                                <Textarea
                                                    value={synthesisText}
                                                    onChange={(e) => setSynthesisText(e.target.value)}
                                                    className="min-h-[400px] border-none bg-transparent text-sm leading-relaxed p-10 scrollbar-hide focus-visible:ring-0 italic opacity-80"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-white dark:from-[#0A0A0A] via-white dark:via-[#0A0A0A] to-transparent">
                                    <div className="max-w-4xl mx-auto relative">
                                        <Input
                                            placeholder={`Instruct your Research Assistant (${persona})...`}
                                            className="h-20 rounded-[30px] pr-40 bg-slate-100 dark:bg-white/10 border-none text-base font-bold pl-8 focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all shadow-2xl"
                                            value={userQuery}
                                            onChange={(e) => setUserQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleChatQuery()}
                                        />
                                        <div className="absolute right-3 top-3 bottom-3 flex gap-2">
                                            <Button onClick={handleChatQuery} className="h-14 px-10 rounded-[22px] bg-indigo-600 hover:bg-indigo-700 font-black text-sm shadow-xl shadow-indigo-600/20">Analyze</Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PHASE: SLIDE STUDIO */}
                        {currentPhase === 'slides' && slideData && (
                            <div className="h-full flex flex-col bg-[#0A0A0A] relative">
                                <div className="flex-1 flex items-center justify-center p-16 overflow-hidden">
                                    <motion.div
                                        key={currentSlide}
                                        initial={{ opacity: 0, scale: 0.95, rotateY: -10 }}
                                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        className="max-w-6xl w-full"
                                    >
                                        <SlidePreview slide={slideData[currentSlide]} index={currentSlide} />

                                        <div className="flex items-center justify-between mt-12 px-4">
                                            <div className="flex items-center gap-2">
                                                {slideData.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setCurrentSlide(i)}
                                                        className={`h-2.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-20 bg-[#E8FF41]' : 'w-2.5 bg-white/10 hover:bg-white/30'}`}
                                                    ></button>
                                                ))}
                                            </div>
                                            <div className="flex gap-4">
                                                <Button variant="ghost" onClick={() => setCurrentPhase('research')} className="rounded-2xl font-black border border-white/10 h-14 px-10 uppercase tracking-widest text-xs">Re-Search</Button>
                                                <Button onClick={downloadPDF} className="rounded-2xl font-black bg-[#E8FF41] text-black hover:bg-[#d8f03b] h-14 px-10 uppercase tracking-widest text-xs shadow-xl shadow-yellow-500/10">Capture Studio PDF</Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                <div className="p-10 border-t border-white/10 bg-white/5 backdrop-blur-3xl">
                                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 border border-emerald-500/20"><Share2 className="w-8 h-8" /></div>
                                            <div>
                                                <h4 className="text-2xl font-black uppercase tracking-tighter">Live Deployment</h4>
                                                <p className="text-[10px] opacity-40 font-black uppercase tracking-[0.3em] mt-1">Authorized for Student Release</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6 w-full md:w-auto">
                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger className="w-72 rounded-2xl h-16 bg-white/5 border-white/10 text-base font-black">
                                                    <SelectValue placeholder="Distribution Class" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl">
                                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                disabled={isSharing || !selectedClass}
                                                onClick={handleShare}
                                                className="h-16 px-12 rounded-2xl bg-indigo-600 font-black shadow-3xl shadow-indigo-600/30 text-lg"
                                            >
                                                {isSharing ? <Loader2 className="w-6 h-6 animate-spin" /> : "Deploy Intelligence"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Output (Intelligence Suite) Dashboard - Persistent Right Panel */}
                    <OutputDashboard />
                </div>

                {/* Intelligent Processing Overlay */}
                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#0A0A0A]/95 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-12 text-center"
                        >
                            <div className="relative mb-16">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="w-64 h-64 rounded-full border-[0.5px] border-indigo-500/30" />
                                <motion.div animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} className="absolute inset-4 rounded-full border-[2px] border-t-[#E8FF41] border-transparent" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-20 h-20 text-[#E8FF41] animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-6 max-w-md">
                                <h3 className="text-4xl font-black tracking-tighter uppercase tracking-[0.2em] text-white underline decoration-[#E8FF41] decoration-4 underline-offset-8">{progressLabel}</h3>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mt-8">
                                    <motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="h-full w-2/3 bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]" />
                                </div>
                                <p className="text-slate-400 text-xs font-black uppercase tracking-[0.4em] animate-pulse">Computing Multimodal Knowledge Graph...</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
