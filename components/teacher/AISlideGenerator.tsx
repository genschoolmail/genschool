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
    Copy, Lightbulb, FileCheck, Map, Music, UserCircle, StickyNote,
    Layers, Zap, MousePointer2, PanelsTopLeft, Command, Library
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

// --- v8 Integrated Aesthetics & Themes ---
const STUDIO_THEMES = [
    { name: 'Studio Dark', bg: 'bg-[#0A0A0A]', border: 'border-white/10', card: 'bg-white/5', accent: 'text-[#E8FF41]', accentBg: 'bg-[#E8FF41]' },
    { name: 'Slate Pro', bg: 'bg-[#0F172A]', border: 'border-white/10', card: 'bg-white/5', accent: 'text-sky-400', accentBg: 'bg-sky-400' }
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
    // --- State: Research Studio v8 (Integrated) ---
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [outputPanelOpen, setOutputPanelOpen] = useState(true);
    const [currentPhase, setCurrentPhase] = useState<Phase>('library');
    const [sources, setSources] = useState<Source[]>([]);
    const [language, setLanguage] = useState("English");
    const [isProcessing, setIsProcessing] = useState(false);
    const [progressLabel, setProgressLabel] = useState("");

    // --- State: Intelligence Suite ---
    const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
    const [persona, setPersona] = useState("Academic Deep Dive");
    const [mermaidCode, setMermaidCode] = useState<string | null>(null);

    // --- State: Content & Storage ---
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [userQuery, setUserQuery] = useState("");
    const [synthesisText, setSynthesisText] = useState("");
    const [slideData, setSlideData] = useState<any[] | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [selectedClass, setSelectedClass] = useState("");
    const [isSharing, setIsSharing] = useState(false);

    // Dynamic Mermaid Import
    useEffect(() => {
        if (mermaidCode) {
            // @ts-ignore
            import('mermaid').then(m => {
                m.default.initialize({ startOnLoad: true, theme: 'dark' });
                m.default.contentLoaded();
            });
        }
    }, [mermaidCode]);

    // --- Persistence ---
    useEffect(() => {
        const savedNotebook = localStorage.getItem('active_notebook_studio_v8');
        if (savedNotebook) {
            try {
                const data = JSON.parse(savedNotebook);
                if (data.sources) setSources(data.sources.filter((s: any) => s.type === 'link'));
                if (data.chatHistory) setChatHistory(data.chatHistory);
                if (data.synthesisText) setSynthesisText(data.synthesisText);
                if (data.slideData) setSlideData(data.slideData);
                if (data.stickyNotes) setStickyNotes(data.stickyNotes);
                if (data.persona) setPersona(data.persona);
            } catch (e) { console.error("Persistence failed", e); }
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
        localStorage.setItem('active_notebook_studio_v8', JSON.stringify(dataToSave));
    }, [sources, chatHistory, synthesisText, slideData, stickyNotes, persona]);

    // --- Core Logic ---
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
        setOutputPanelOpen(true);
        toast.success("Saved to Insights Dashboard");
    };

    const handleSynthesizeAll = async () => {
        if (sources.length === 0) return toast.error("Please add at least one source");
        setIsProcessing(true);
        setProgressLabel(`Applying ${persona} Intelligence...`);
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
            setCurrentPhase('research');
            setChatHistory([{ role: 'ai', content: `Knowledge Base Initialized. How would you like to explore these sources?` }]);
        } catch (err: any) {
            toast.error(err.message);
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
                body: JSON.stringify({ summary: synthesisText, customQuery: userQuery, mode: 'chat', persona })
            });
            const data = await res.json();
            setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);
        } catch (err) { toast.error("Hub Error"); }
    };

    const handleTransform = async (template: 'briefing' | 'faq' | 'timeline' | 'graph') => {
        if (!synthesisText) return;
        setIsProcessing(true);
        setProgressLabel(`Transforming to ${template}...`);
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesisText, mode: 'transform', template, language })
            });
            const data = await res.json();
            if (template === 'graph') setMermaidCode(data.output);
            else saveNote(data.output, 'draft');
        } catch (err) { toast.error("Transform Failed"); }
        finally { setIsProcessing(false); }
    };

    const handleBuildSlides = async () => {
        setIsProcessing(true);
        setProgressLabel("Designing Studio Presentation...");
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesisText, language, teacherName, schoolName, persona })
            });
            const data = await res.json();
            setSlideData(data.slideData);
            setCurrentPhase('slides');
            setCurrentSlide(0);
        } catch (err: any) { toast.error(err.message); }
        finally { setIsProcessing(false); }
    };

    const downloadPDF = () => {
        if (!slideData) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        const theme = { bg: [10, 10, 10], accent: [232, 255, 65], sub: [150, 150, 150] };

        slideData.forEach((slide: any, idx: number) => {
            if (idx > 0) doc.addPage();
            doc.setFillColor(theme.bg[0], theme.bg[1], theme.bg[2]);
            doc.rect(0, 0, W, H, 'F');
            doc.setFontSize(8);
            doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.text(`GROUNDED RESEARCH | ${schoolName.toUpperCase()}`, 15, 12);

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            const titleText = doc.splitTextToSize(slide.title?.toUpperCase() || "UNTITLED", W / 2 - 30);
            doc.text(titleText, 20, 45);

            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            let startY = 45 + (titleText.length * 12) + 12;
            (slide.points || []).slice(0, 3).forEach((p: string) => {
                const wrappedP = doc.splitTextToSize(p, W / 2 - 30);
                doc.text(wrappedP, 20, startY);
                startY += (wrappedP.length * 6) + 10;
            });

            doc.setFillColor(255, 255, 255, 0.05);
            doc.roundedRect(W / 2 + 10, 30, W / 2 - 25, H - 60, 8, 8, 'F');
            doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
            doc.setFontSize(60);
            doc.text(slide.emoji || "✨", W / 2 + (W / 4), H / 2, { align: 'center' });

            doc.setFontSize(8);
            doc.setTextColor(theme.sub[0], theme.sub[1], theme.sub[2]);
            doc.text(`Instructor: ${teacherName} | PAGE ${idx + 1}`, 20, H - 10);
        });
        doc.save(`${schoolName}-ResearchStudio.pdf`);
    };

    const handleShare = async () => {
        if (!selectedClass || !slideData) return toast.error("Select a class");
        setIsSharing(true);
        const res = await shareNoteWithClass({
            classId: selectedClass,
            title: slideData[0]?.title || "Research Hub Insight",
            content: slideData,
            fileUrl: "integrated-v8-studio"
        });
        setIsSharing(false);
        if (res.error) toast.error(res.error);
        else toast.success("Deployed to Classroom");
    };

    // --- Components: Unified Dashboard v8 ---
    const SourcePanel = () => (
        <motion.div
            initial={false}
            animate={{ width: sidebarOpen ? 300 : 0 }}
            className="h-full bg-slate-50 dark:bg-[#0D0D0D] border-r border-slate-200 dark:border-white/10 hidden md:flex flex-col overflow-hidden"
        >
            <div className="w-[300px] p-6 space-y-8 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">Knowledge Library</h2>
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="rounded-xl"><ChevronLeft className="w-4 h-4" /></Button>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-indigo-500">Analysis Persona</Label>
                        <Select value={persona} onValueChange={setPersona}>
                            <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-xs font-bold">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {["Academic Deep Dive", "Classroom Storytelling", "Skeptical Analyst", "Quick Summary"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-slate-400">Active Sources ({sources.length})</Label>
                        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 no-scrollbar">
                            <AnimatePresence>
                                {sources.map(s => (
                                    <motion.div key={s.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/5">
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

                <div className="mt-auto space-y-4">
                    <div className="relative group">
                        <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => {
                            if (e.target.files) Array.from(e.target.files).forEach(addFile);
                        }} />
                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-xl shadow-indigo-600/30 group-hover:bg-indigo-700 transition-all">
                            <FileUp className="w-4 h-4" />
                            <span>Library Upload</span>
                        </div>
                    </div>
                    <Input placeholder="Paste URL..." className="h-12 rounded-2xl border-dashed text-xs font-bold" onKeyDown={(e) => e.key === 'Enter' && (addLink((e.target as HTMLInputElement).value), (e.target as HTMLInputElement).value = '')} />
                </div>
            </div>
        </motion.div>
    );

    const InsightPanel = () => (
        <motion.div
            initial={false}
            animate={{ width: outputPanelOpen ? 300 : 0 }}
            className="h-full bg-slate-50 dark:bg-[#0D0D0D] border-l border-slate-200 dark:border-white/10 hidden lg:flex flex-col overflow-hidden"
        >
            <div className="w-[300px] p-6 space-y-8 flex flex-col h-full">
                <div className="flex items-center justify-between">
                    <h2 className="text-xs font-black uppercase tracking-widest text-[#E8FF41]">Production Output</h2>
                    <Button variant="ghost" size="icon" onClick={() => setOutputPanelOpen(false)} className="rounded-xl"><ChevronRight className="w-4 h-4" /></Button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                    {stickyNotes.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-10 py-20">
                            <StickyNote className="w-12 h-12 mb-4" />
                            <p className="text-xs font-black uppercase tracking-widest">Dashboard Empty</p>
                        </div>
                    ) : (
                        stickyNotes.map(note => (
                            <motion.div key={note.id} layout className="p-4 rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 space-y-2 group">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${note.category === 'fact' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-amber-500/10 text-amber-500'}`}>{note.category}</span>
                                    <button onClick={() => setStickyNotes(stickyNotes.filter(n => n.id !== note.id))} className="opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3 text-red-500" /></button>
                                </div>
                                <p className="text-xs font-bold leading-relaxed">{note.content}</p>
                            </motion.div>
                        ))
                    )}
                </div>

                <div className="pt-4 border-t border-black/5 dark:border-white/10">
                    <Button onClick={downloadPDF} className="w-full h-14 rounded-2xl bg-white dark:bg-white/5 hover:bg-[#E8FF41] hover:text-black font-black text-xs border border-slate-200 dark:border-white/10 transition-all">
                        <FileCheck className="w-4 h-4 mr-3" /> EXPORT DASHBOARD
                    </Button>
                </div>
            </div>
        </motion.div>
    );

    // --- Main Integrated Layout ---
    return (
        <div className="min-h-[85vh] bg-white dark:bg-[#0A0A0A] rounded-[32px] border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden relative shadow-2xl">
            {/* Header: Integrated Studio Navigation */}
            <header className="h-20 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0A0A0A]/50 backdrop-blur-3xl px-8 flex items-center justify-between z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xl">STUDIO</div>
                        <div className="hidden sm:block">
                            <h1 className="text-sm font-black uppercase tracking-widest">{schoolName} Hub</h1>
                            <p className="text-[9px] font-bold text-indigo-500 uppercase">Intelligence Suite v8</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                    {[
                        { id: 'library', icon: BookOpen, label: 'Sources' },
                        { id: 'research', icon: MessageSquare, label: 'Research' },
                        { id: 'slides', icon: Layout, label: 'Slides' }
                    ].map((btn) => (
                        <button
                            key={btn.id}
                            onClick={() => setCurrentPhase(btn.id as Phase)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentPhase === btn.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl' : 'opacity-40'}`}
                        >
                            <btn.icon className="w-3.5 h-3.5" />
                            <span className="hidden md:inline">{btn.label}</span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className={`w-10 h-10 rounded-xl ${sidebarOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5'}`}><Library className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => setOutputPanelOpen(!outputPanelOpen)} className={`w-10 h-10 rounded-xl ${outputPanelOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5'}`}><PanelsTopLeft className="w-4 h-4" /></Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* 3-Column Grid Implementation */}
                <SourcePanel />

                <main className="flex-1 flex flex-col relative bg-white dark:bg-[#0A0A0A] overflow-hidden">
                    {/* TRANSFORMATION TOOLS BAR (FLOATING) */}
                    {synthesisText && currentPhase !== 'slides' && (
                        <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-2xl border border-slate-200 dark:border-white/10 z-40 shadow-2xl">
                            <Button onClick={() => handleTransform('briefing')} variant="ghost" className="h-9 rounded-xl text-[9px] font-black uppercase px-4"><FileText className="w-3 h-3 mr-2" /> Briefing</Button>
                            <Button onClick={() => handleTransform('faq')} variant="ghost" className="h-9 rounded-xl text-[9px] font-black uppercase px-4"><MessageSquare className="w-3 h-3 mr-2 text-emerald-400" /> FAQ</Button>
                            <Button onClick={() => handleTransform('timeline')} variant="ghost" className="h-9 rounded-xl text-[9px] font-black uppercase px-4"><History className="w-3 h-3 mr-2 text-amber-500" /> Timeline</Button>
                            <div className="w-px h-5 bg-white/10 mx-1"></div>
                            <Button onClick={() => handleTransform('graph')} variant="ghost" className="h-9 rounded-xl text-[9px] font-black uppercase px-4"><Map className="w-3 h-3 mr-2 text-rose-500" /> Knowledge Graph</Button>
                        </div>
                    )}

                    <div className="flex-1 overflow-y-auto p-10 no-scrollbar">
                        {/* Phase 1: Knowledge Library */}
                        {currentPhase === 'library' && (
                            <div className="max-w-4xl mx-auto py-12">
                                {sources.length === 0 ? (
                                    <div className="text-center space-y-8 py-20 bg-slate-50 dark:bg-white/5 rounded-[48px] border-2 border-dashed border-slate-200 dark:border-white/10">
                                        <div className="w-24 h-24 bg-indigo-600/10 rounded-[40px] flex items-center justify-center mx-auto text-indigo-600"><BookOpen className="w-10 h-10" /></div>
                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-black uppercase tracking-tighter">Initialize Intelligence</h2>
                                            <p className="text-slate-400 font-bold text-sm">Add research sources to activate the synthesis engine.</p>
                                        </div>
                                        <Button onClick={() => setSidebarOpen(true)} className="h-14 px-10 rounded-2xl bg-indigo-600 font-black shadow-xl shadow-indigo-600/30">Build Research Library</Button>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="p-10 rounded-[48px] bg-slate-50 dark:bg-indigo-600/5 border border-slate-200 dark:border-indigo-600/20 flex flex-col md:flex-row items-center justify-between gap-10">
                                            <div className="space-y-2">
                                                <h2 className="text-3xl font-black uppercase tracking-tighter">Library Synchronized</h2>
                                                <p className="text-xs font-bold opacity-40 uppercase tracking-widest">{sources.length} active multi-source streams</p>
                                            </div>
                                            <Button onClick={handleSynthesizeAll} className="h-16 px-12 rounded-3xl bg-indigo-600 font-black text-base shadow-2xl shadow-indigo-600/20 hover:scale-105 transition-all">Generate Foundation</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Phase 2: Research Hub */}
                        {currentPhase === 'research' && (
                            <div className="h-full flex flex-col relative">
                                <AnimatePresence>
                                    {mermaidCode && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-[40px] bg-white dark:bg-white/5 border border-[#E8FF41]/20 my-10">
                                            <div className="flex justify-between mb-8"><span className="text-[10px] font-black uppercase text-[#E8FF41]">Knowledge Map</span><Button variant="ghost" size="icon" onClick={() => setMermaidCode(null)}><X /></Button></div>
                                            <div className="mermaid flex justify-center">{mermaidCode}</div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="max-w-3xl mx-auto w-full space-y-10 pb-32">
                                    {chatHistory.map((msg, i) => (
                                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${msg.role === 'user' ? 'bg-slate-100 dark:bg-white/10' : 'bg-[#E8FF41] text-black shadow-lg shadow-yellow-500/20'}`}>
                                                {msg.role === 'user' ? <UserCircle className="w-6 h-6" /> : 'AI'}
                                            </div>
                                            <div className={`p-6 rounded-[28px] text-sm leading-relaxed max-w-[80%] ${msg.role === 'user' ? 'bg-slate-50 dark:bg-indigo-600/10 text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-white/5 border border-white/5'}`}>
                                                {msg.content}
                                                {msg.role === 'ai' && (
                                                    <div className="mt-6 flex gap-2 border-t border-black/5 dark:border-white/5 pt-4">
                                                        <Button variant="ghost" size="sm" onClick={() => saveNote(msg.content)} className="h-8 rounded-lg text-[9px] font-black uppercase"><Copy className="w-3 h-3 mr-2" /> Save to Output</Button>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {synthesisText && (
                                        <div className="p-8 rounded-[40px] bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mt-12 relative group">
                                            <div className="absolute -top-3 left-8 px-4 py-1 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest">Synthetic Brain Summary</div>
                                            <Textarea value={synthesisText} onChange={(e) => setSynthesisText(e.target.value)} className="min-h-[350px] border-none bg-transparent text-sm italic opacity-80 focus-visible:ring-0 p-2 scrollbar-hide" />
                                            <div className="mt-6 flex justify-end"><Button onClick={handleBuildSlides} className="h-12 bg-indigo-600 px-10 rounded-2xl font-black text-xs">Transform to Slides</Button></div>
                                        </div>
                                    )}
                                </div>

                                <div className="sticky bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-[#0A0A0A] to-transparent">
                                    <div className="max-w-3xl mx-auto relative group">
                                        <Input
                                            placeholder="Ask your sources anything..."
                                            className="h-16 rounded-[24px] bg-slate-100 dark:bg-white/10 border-none text-sm font-bold pl-8 shadow-2xl focus-visible:ring-2 focus-visible:ring-indigo-600"
                                            value={userQuery} onChange={(e) => setUserQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleChatQuery()}
                                        />
                                        <Button onClick={handleChatQuery} className="absolute right-2 top-2 bottom-2 px-8 rounded-2xl bg-indigo-600 font-black text-xs hover:scale-105 transition-all">Analyze</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Phase 3: Slide Studio */}
                        {currentPhase === 'slides' && slideData && (
                            <div className="h-full flex flex-col space-y-12 py-12">
                                <div className="max-w-4xl mx-auto w-full aspect-video scale-105">
                                    <div className="h-full rounded-[40px] overflow-hidden bg-[#0A0A0A] text-white border border-white/10 relative p-16 shadow-2xl flex flex-col justify-center">
                                        <div className="text-center space-y-10">
                                            <span className="text-9xl block drop-shadow-2xl">{slideData[currentSlide]?.emoji || '🧬'}</span>
                                            <h2 className="text-5xl font-black text-[#E8FF41] uppercase tracking-tighter leading-tight">{slideData[currentSlide]?.title}</h2>
                                            <div className="space-y-4 max-w-2xl mx-auto">
                                                {(slideData[currentSlide]?.points || []).slice(0, 3).map((p: string, pi: number) => (
                                                    <p key={pi} className="text-base font-bold opacity-60 italic">{p}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-4xl mx-auto w-full flex items-center justify-between bg-slate-50 dark:bg-white/5 p-8 rounded-[40px] border border-slate-200 dark:border-white/10">
                                    <div className="flex items-center gap-3">
                                        {slideData.map((_, i) => (
                                            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2.5 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-16 bg-[#E8FF41]' : 'w-2.5 bg-slate-300 dark:bg-white/10 hover:bg-white/30'}`}></button>
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        <Button variant="ghost" onClick={downloadPDF} className="h-14 px-10 rounded-2xl border border-slate-200 dark:border-white/10 font-black text-[10px] uppercase tracking-widest"><Download className="w-4 h-4 mr-2" /> PDF</Button>
                                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                                            <SelectTrigger className="w-56 h-14 rounded-2xl border-none bg-indigo-600/10 text-indigo-600 font-black text-xs"><SelectValue placeholder="Distribution" /></SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                        <Button disabled={isSharing || !selectedClass} onClick={handleShare} className="h-14 px-12 rounded-2xl bg-indigo-600 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-600/30">
                                            {isSharing ? <Loader2 className="animate-spin" /> : "Deploy Class"}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>

                <InsightPanel />
            </div>

            {/* v8 Processing Overlay (Studio Design) */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-3xl z-50 flex flex-col items-center justify-center p-10 text-center">
                        <div className="relative mb-12">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="w-56 h-56 rounded-full border-[0.5px] border-indigo-500/20" />
                            <motion.div animate={{ rotate: -360 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} className="absolute inset-3 rounded-full border-2 border-t-indigo-600 border-transparent shadow-[0_0_40px_rgba(79,70,229,0.3)]" />
                            <div className="absolute inset-0 flex items-center justify-center"><Zap className="w-16 h-16 text-indigo-600 animate-pulse" /></div>
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-[0.2em]">{progressLabel}</h3>
                        <p className="mt-4 text-xs font-black uppercase tracking-[0.4em] opacity-30 animate-pulse">Syncing Knowledge Layers...</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
