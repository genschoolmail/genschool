'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { shareNoteWithClass } from '@/lib/actions/ai-slides';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
    Loader2, FileUp, Share2, X, Download, Link as LinkIcon,
    BookOpen, MessageSquare, ChevronLeft, ChevronRight,
    FileText, Trash2, Copy, StickyNote,
    Zap, Library, Sparkles, Plus, ArrowRight,
    LayoutGrid, Send, AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

type Source = { id: string; type: 'file' | 'link'; name: string; url?: string; file?: File; };
type ChatMsg = { role: 'user' | 'ai'; content: string; };
type Note = { id: string; content: string; };
type Phase = 'library' | 'research' | 'slides';

const STORAGE_KEY = 'ai_studio_v9';

export default function AISlideGenerator({ classes, schoolName = "School", teacherName = "Teacher" }: {
    classes: any[]; schoolName?: string; teacherName?: string;
}) {
    const chatEndRef = useRef<HTMLDivElement>(null);
    const linkInputRef = useRef<HTMLInputElement>(null);
    const initialized = useRef(false);

    // ---- State ----
    const [phase, setPhase] = useState<Phase>('library');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [notesOpen, setNotesOpen] = useState(false);
    const [sources, setSources] = useState<Source[]>([]);
    const [persona, setPersona] = useState("Academic Deep Dive");
    const [language, setLanguage] = useState("English");
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState("Processing...");
    const [synthesis, setSynthesis] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
    const [query, setQuery] = useState("");
    const [isChatting, setIsChatting] = useState(false);
    const [slides, setSlides] = useState<any[]>([]);
    const [activeSlide, setActiveSlide] = useState(0);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [isSharing, setIsSharing] = useState(false);

    // ---- Scroll chat ----
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

    // ---- Robust Persist (takes full scope to avoid closure stale data) ----
    const persistSnapshot = (data: {
        synthesis: string;
        chatHistory: ChatMsg[];
        slides: any[];
        notes: Note[];
        persona: string;
        sources: Source[];
        phase: Phase;
    }) => {
        try {
            const payload = {
                ...data,
                sources: data.sources.filter(s => s.type === 'link') // Don't save files
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        } catch (e) {
            console.error("Storage failed", e);
            // If quota error, we still continue but warn in console
        }
    };

    // ---- Load from LocalStorage ----
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            const d = JSON.parse(saved);
            if (d.persona) setPersona(d.persona);
            if (d.sources?.length) setSources(d.sources.filter((s: any) => s.type === 'link'));
            if (d.synthesis) {
                setSynthesis(d.synthesis);
                setChatHistory(d.chatHistory?.length ? d.chatHistory : [{ role: 'ai', content: 'Session restored. How can I help?' }]);
                setPhase(d.phase || 'research');
            }
            if (d.slides?.length) setSlides(d.slides);
            if (d.notes?.length) setNotes(d.notes);
        } catch { }
    }, []);

    const addLink = () => {
        const url = linkInputRef.current?.value?.trim();
        if (!url) return;
        setSources(prev => [...prev, { id: Date.now().toString(), type: 'link', name: url, url }]);
        if (linkInputRef.current) linkInputRef.current.value = '';
    };
    const addFiles = (files: FileList | null) => {
        if (!files) return;
        setSources(prev => [...prev, ...Array.from(files).map(f => ({ id: Date.now() + f.name, type: 'file' as const, name: f.name, file: f }))]);
    };
    const removeSource = (id: string) => setSources(prev => prev.filter(s => s.id !== id));
    const saveNote = (content: string) => {
        const newNote = { id: Date.now().toString(), content: content.slice(0, 1000) };
        setNotes(prev => [newNote, ...prev]);
        setNotesOpen(true);
        toast.success("Saved to Notes!");
    };

    // ---- SYNTHESIZE ----
    const handleSynthesize = async () => {
        if (!sources.length) return toast.error("Add at least one source first.");
        setLoading(true);
        setLoadingMsg("Uploading & analyzing sources...");

        try {
            const fd = new FormData();
            sources.filter(s => s.type === 'file' && s.file).forEach(s => fd.append('file', s.file!));
            fd.append('links', JSON.stringify(sources.filter(s => s.type === 'link').map(s => s.url)));
            fd.append('language', language);
            fd.append('persona', persona);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);

            const res = await fetch('/api/teacher/synthesize-research', {
                method: 'POST',
                body: fd,
                signal: controller.signal
            });
            clearTimeout(timeout);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || `Server returned ${res.status}`);
            }

            const data = await res.json();
            if (!data.synthesis) throw new Error("Synthesis failed: Empty response from AI.");

            const welcomeMsg: ChatMsg = {
                role: 'ai',
                content: `✅ **Synthesis Complete!** I have analyzed your ${sources.length} sources using the "${persona}" lens.\n\nYou can now:\n1. Ask follow-up questions in the chat below.\n2. Use the toolbar above to generate Briefings/FAQs.\n3. Click "Build Slides" to create a presentation.`
            };

            // Update state
            setSynthesis(data.synthesis);
            setChatHistory([welcomeMsg]);
            setPhase('research');

            // Explicit persist with CURRENT data
            persistSnapshot({
                synthesis: data.synthesis,
                chatHistory: [welcomeMsg],
                slides, notes, persona, sources, phase: 'research'
            });

            toast.success("Knowledge base ready!");
        } catch (e: any) {
            console.error("Synthesis error:", e);
            toast.error(e.name === 'AbortError' ? "Request timed out (60s). Try fewer sources." : e.message);
        } finally {
            setLoading(false);
        }
    };

    // ---- CHAT ----
    const handleChat = async () => {
        if (!query.trim() || !synthesis) return;
        const userMsg = query.trim();
        const newHistory: ChatMsg[] = [...chatHistory, { role: 'user', content: userMsg }];
        setChatHistory(newHistory);
        setQuery("");
        setIsChatting(true);
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesis, customQuery: userMsg, mode: 'chat', persona, language })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Chat failed");
            const updated = [...newHistory, { role: 'ai' as const, content: data.answer }];
            setChatHistory(updated);
            persistSnapshot({ synthesis, chatHistory: updated, slides, notes, persona, sources, phase });
        } catch (e: any) {
            setChatHistory(prev => [...prev, { role: 'ai', content: `⚠️ Error: ${e.message}` }]);
        } finally { setIsChatting(false); }
    };

    // ---- TRANSFORM (FAQs, Briefings) ----
    const handleTransform = async (template: string) => {
        if (!synthesis) return;
        setLoading(true);
        setLoadingMsg(`AI is writing your ${template}...`);
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesis, mode: 'transform', template, language })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error);
            saveNote(data.output);
            const updatedChat = [...chatHistory, { role: 'ai' as const, content: `✅ **${template.toUpperCase()}** created and saved to your Notes!` }];
            setChatHistory(updatedChat);
            persistSnapshot({ synthesis, chatHistory: updatedChat, slides, notes, persona, sources, phase });
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    // ---- BUILD SLIDES ----
    const handleBuildSlides = async () => {
        if (!synthesis) return;
        setLoading(true);
        setLoadingMsg("AI is designing your slides...");
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesis, language, teacherName, schoolName, persona })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error);
            setSlides(data.slideData);
            setActiveSlide(0);
            setPhase('slides');
            persistSnapshot({ synthesis, chatHistory, slides: data.slideData, notes, persona, sources, phase: 'slides' });
            toast.success("Slides generated!");
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const handleShare = async () => {
        if (!selectedClass || !slides.length) return;
        setIsSharing(true);
        try {
            await shareNoteWithClass({ classId: selectedClass, title: slides[0]?.title || "Research Project", content: slides, fileUrl: "studio-v9" });
            toast.success("Shared successfully!");
        } catch (e: any) { toast.error("Sharing failed."); }
        finally { setIsSharing(false); }
    };

    const downloadPDF = () => {
        if (!slides.length) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        slides.forEach((slide, i) => {
            if (i > 0) doc.addPage();
            doc.setFillColor(10, 10, 10).rect(0, 0, W, H, 'F');
            doc.setTextColor(232, 255, 65).setFontSize(24).setFont('helvetica', 'bold');
            doc.text((slide.title || '').toUpperCase(), 20, 30);
            doc.setTextColor(255, 255, 255).setFontSize(12).setFont('helvetica', 'normal');
            let y = 50;
            (slide.points || []).forEach((p: string) => {
                const lines = doc.splitTextToSize(`• ${p}`, W - 40);
                doc.text(lines, 20, y);
                y += lines.length * 8;
            });
            doc.setFontSize(8).setTextColor(100, 100, 100).text(`${schoolName} | Slide ${i + 1}`, 20, H - 10);
        });
        doc.save("Research_Slides.pdf");
    };

    return (
        <div className="flex flex-col w-full bg-white dark:bg-[#0A0A0A] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl"
            style={{ minHeight: '85vh', fontFamily: 'Inter, sans-serif' }}>

            {/* HEADER */}
            <header className="flex items-center justify-between px-6 h-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D0D0D]">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-black text-xs uppercase tracking-[0.2em] hidden sm:block">Research Studio</span>
                </div>

                <nav className="flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl p-1">
                    {[
                        { id: 'library', label: 'Library', icon: Library },
                        { id: 'research', label: 'Research Hub', icon: MessageSquare },
                        { id: 'slides', label: 'Slides', icon: LayoutGrid }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setPhase(tab.id as Phase)}
                            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${phase === tab.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden md:block">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-2">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-28 h-9 rounded-xl text-[10px] font-bold tracking-widest bg-slate-100 dark:bg-white/5 border-none"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="English">ENGLISH</SelectItem><SelectItem value="Hindi">HINDI</SelectItem><SelectItem value="Marathi">MARATHI</SelectItem></SelectContent>
                    </Select>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${sidebarOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400'}`}><Library className="w-4 h-4" /></button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 280, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-r border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-[#0D0D0D] overflow-hidden flex flex-col">
                            <div className="w-[280px] p-5 flex flex-col h-full gap-5">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 block">LENS MODE</Label>
                                    <Select value={persona} onValueChange={setPersona}>
                                        <SelectTrigger className="h-10 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["Academic Deep Dive", "Classroom Storytelling", "Skeptical Analyst", "Quick Summary"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">SOURCES ({sources.length})</Label>
                                    {sources.map(s => (
                                        <div key={s.id} className="flex items-center gap-2.5 p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                            {s.type === 'file' ? <FileText className="w-3.5 h-3.5 text-indigo-500" /> : <LinkIcon className="w-3.5 h-3.5 text-emerald-500" />}
                                            <span className="text-[11px] font-bold truncate flex-1">{s.name}</span>
                                            <button onClick={() => removeSource(s.id)} className="text-slate-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                                        </div>
                                    ))}
                                    {sources.length === 0 && <div className="text-center py-10 opacity-20"><BookOpen className="w-8 h-8 mx-auto" /><p className="text-[10px] font-bold mt-2">NO SOURCES</p></div>}
                                </div>

                                <div className="space-y-3">
                                    <div className="relative group">
                                        <input type="file" multiple onChange={e => addFiles(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        <div className="w-full h-10 rounded-xl bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center gap-2 group-hover:bg-indigo-700 transition-all uppercase tracking-widest">
                                            <FileUp className="w-3.5 h-3.5" /> UPLOAD PDF
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input ref={linkInputRef} placeholder="Paste URL..." className="flex-1 h-10 px-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold outline-none" onKeyDown={e => e.key === 'Enter' && addLink()} />
                                        <button onClick={addLink} className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600"><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <Button onClick={handleSynthesize} disabled={loading || sources.length === 0} className="w-full h-12 rounded-xl bg-indigo-600 font-black text-xs gap-2 shadow-xl shadow-indigo-600/20">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />} BUILD KNOWLEDGE
                                    </Button>
                                    {synthesis && <button onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.reload(); }} className="w-full text-[10px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest">↻ Reset Project</button>}
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* MAIN CONTENT */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#0A0A0A]">
                    {/* LIBRARY */}
                    {phase === 'library' && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-6">
                            <div className="w-20 h-20 rounded-[2rem] bg-indigo-600/5 flex items-center justify-center text-indigo-600">
                                {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : <Library className="w-10 h-10" />}
                            </div>
                            <div className="max-w-md">
                                <h1 className="text-2xl font-black uppercase tracking-tight mb-2">
                                    {synthesis ? "Project Grounded ✅" : sources.length > 0 ? "Ready to Analyze 🧠" : "Smart Research Studio"}
                                </h1>
                                <p className="text-slate-400 text-sm font-medium">
                                    {synthesis ? "Your interactive knowledge base is ready. Jump to the Hub to explore." : sources.length > 0 ? `We found ${sources.length} sources. Click "Build Knowledge" to start.` : "Upload your teaching materials or paste URLs to create a specialized AI model for your class."}
                                </p>
                            </div>
                            <div className="flex gap-4">
                                {synthesis ? (
                                    <Button onClick={() => setPhase('research')} size="lg" className="rounded-2xl bg-indigo-600 font-black px-10 gap-3 shadow-2xl shadow-indigo-600/30">OPEN HUB <ArrowRight className="w-4 h-4" /></Button>
                                ) : sources.length > 0 ? (
                                    <Button onClick={handleSynthesize} disabled={loading} size="lg" className="rounded-2xl bg-indigo-600 font-black px-10 gap-3 shadow-2xl shadow-indigo-600/30 animate-bounce">
                                        {loading ? "PROCESSING..." : "START ANALYSIS"}
                                    </Button>
                                ) : (
                                    <Button onClick={() => setSidebarOpen(true)} variant="outline" className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 px-8 h-12 font-black text-xs">ADD YOUR SOURCES</Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* RESEARCH HUB */}
                    {phase === 'research' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="h-14 border-b border-slate-200 dark:border-white/10 bg-white/50 dark:bg-[#0D0D0D]/50 backdrop-blur-md flex items-center gap-2 px-5 shrink-0 overflow-x-auto">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">Magic Tools:</span>
                                {['Briefing', 'FAQ', 'Timeline'].map(t => (
                                    <button key={t} onClick={() => handleTransform(t)} disabled={!synthesis || loading} className="h-8 px-4 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase hover:bg-slate-100 dark:hover:bg-white/10 transition-all disabled:opacity-20 uppercase tracking-widest">{t}</button>
                                ))}
                                <Button onClick={handleBuildSlides} disabled={!synthesis || loading} size="sm" className="ml-auto h-8 rounded-full bg-indigo-600 font-black text-[10px] px-5 tracking-widest">BUILD SLIDES</Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {!synthesis ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-3">
                                        <AlertCircle className="w-12 h-12 opacity-20" />
                                        <p className="font-black text-xs uppercase tracking-widest">Awaiting Knowledge Base</p>
                                        <Button onClick={() => setPhase('library')} size="sm" variant="outline" className="rounded-xl border-dashed">Go to Library</Button>
                                    </div>
                                ) : (
                                    <>
                                        {chatHistory.map((m, i) => (
                                            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`w-8 h-8 rounded-[0.75rem] flex items-center justify-center shrink-0 text-[10px] font-black ${m.role === 'user' ? 'bg-slate-200 dark:bg-white/10' : 'bg-indigo-600 text-white'}`}>{m.role === 'user' ? 'YOU' : 'AI'}</div>
                                                <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed whitespace-pre-wrap ${m.role === 'user' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-100' : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10'}`}>
                                                    {m.content}
                                                    {m.role === 'ai' && (
                                                        <button onClick={() => saveNote(m.content)} className="mt-3 flex items-center gap-2 text-[10px] font-black text-indigo-500 hover:opacity-70 uppercase tracking-widest"><Copy className="w-3 h-3" /> Save to Notes</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isChatting && <div className="flex gap-4"><div className="w-8 h-8 bg-indigo-600 rounded-[0.75rem] flex items-center justify-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div><div className="p-4 rounded-3xl bg-white dark:bg-white/5 animate-pulse text-[10px] font-black tracking-widest">ANALYZING SOURCES...</div></div>}
                                        <div ref={chatEndRef} />
                                    </>
                                )}
                            </div>

                            <div className="p-5 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D0D0D]">
                                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                                    <Textarea value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChat())} placeholder={synthesis ? "Ask your research library..." : "Build knowledge base first..."} disabled={!synthesis || isChatting} className="flex-1 min-h-[50px] max-h-[200px] rounded-2xl bg-slate-50 dark:bg-white/5 border-none text-sm font-medium focus-visible:ring-indigo-600" />
                                    <Button onClick={handleChat} disabled={!query.trim() || !synthesis || isChatting} className="h-12 w-12 rounded-2xl bg-indigo-600 shrink-0"><Send className="w-5 h-5" /></Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* SLIDES */}
                    {phase === 'slides' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {slides.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-4">
                                    <LayoutGrid className="w-14 h-14 opacity-20" />
                                    <p className="font-black text-xs uppercase tracking-widest">No Slides Found</p>
                                    <Button onClick={() => setPhase('research')} size="sm" variant="outline" className="rounded-xl border-dashed">Open Hub to Build Slides</Button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1 flex items-center justify-center p-8 bg-slate-100 dark:bg-black/40">
                                        <div className="w-full max-w-4xl aspect-video bg-[#0A0A0A] rounded-[2.5rem] border border-white/10 shadow-3xl overflow-hidden p-12 flex flex-col justify-center gap-6 relative">
                                            <div className="absolute top-8 left-12 text-[10px] font-black text-white/20 tracking-widest">{schoolName} | {persona}</div>
                                            <h2 className="text-3xl font-black text-[#E8FF41] uppercase tracking-tight leading-tight">{slides[activeSlide]?.title}</h2>
                                            <ul className="space-y-3">
                                                {slides[activeSlide]?.points?.map((p: string, pi: number) => (
                                                    <li key={pi} className="flex gap-4 items-start translate-x-1">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                                        <p className="text-white/70 text-sm font-medium leading-relaxed">{p}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="absolute bottom-8 right-12 text-[10px] font-black text-white/30">{activeSlide + 1} / {slides.length}</div>
                                        </div>
                                    </div>

                                    <div className="h-20 border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D0D0D] flex items-center px-10 gap-6">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} disabled={activeSlide === 0} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-slate-50"><ChevronLeft className="w-5 h-5" /></button>
                                            <div className="flex gap-1.5 px-4">
                                                {slides.map((_, i) => <button key={i} onClick={() => setActiveSlide(i)} className={`h-1.5 transition-all rounded-full ${i === activeSlide ? 'w-8 bg-indigo-600' : 'w-1.5 bg-slate-200 dark:bg-white/10 hover:bg-slate-400'}`} />)}
                                            </div>
                                            <button onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} disabled={activeSlide === slides.length - 1} className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center disabled:opacity-20 hover:bg-slate-50"><ChevronRight className="w-5 h-5" /></button>
                                        </div>

                                        <div className="ml-auto flex items-center gap-3">
                                            <Button onClick={downloadPDF} variant="outline" className="h-10 rounded-xl text-[10px] font-black tracking-widest px-6"><Download className="w-4 h-4 mr-2" /> EXPORT PDF</Button>
                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger className="w-44 h-10 rounded-xl text-[10px] font-black tracking-widest"><SelectValue placeholder="CHOOSE CLASS" /></SelectTrigger>
                                                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name.toUpperCase()}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Button onClick={handleShare} disabled={isSharing || !selectedClass} className="h-10 px-8 rounded-xl bg-indigo-600 font-black text-[10px] tracking-widest shadow-xl shadow-indigo-600/20">
                                                {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : "PUBLISH"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* NOTES DRAWER */}
                <AnimatePresence>
                    {notesOpen && (
                        <motion.aside initial={{ width: 0 }} animate={{ width: 300 }} exit={{ width: 0 }} className="border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D0D0D] overflow-hidden flex flex-col">
                            <div className="w-[300px] p-6 h-full flex flex-col gap-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Sticky Notes ({notes.length})</span>
                                    <button onClick={() => setNotesOpen(false)}><X className="w-5 h-5 opacity-40 hover:opacity-100" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                                    {notes.map(n => (
                                        <div key={n.id} className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 group relative shadow-sm">
                                            <p className="text-xs leading-relaxed text-amber-900/70 dark:text-amber-200/60 line-clamp-[8]">{n.content}</p>
                                            <button onClick={() => setNotes(prev => prev.filter(x => x.id !== n.id))} className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-black rounded-lg p-1.5 shadow-md"><Trash2 className="w-3.5 h-3.5 text-red-500" /></button>
                                        </div>
                                    ))}
                                    {notes.length === 0 && <div className="text-center py-20 opacity-20"><StickyNote className="w-10 h-10 mx-auto" /><p className="text-[10px] font-black mt-3">NO NOTES SAVED</p></div>}
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* GLOBAL LOADING */}
            <AnimatePresence>
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-10 gap-6">
                        <div className="relative">
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="w-16 h-16 rounded-full border-t-2 border-indigo-600 border-slate-200 dark:border-white/10" />
                            <Sparkles className="w-6 h-6 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-black uppercase tracking-tight">{loadingMsg}</h3>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase animate-pulse">Processing deep-intelligence layer...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
