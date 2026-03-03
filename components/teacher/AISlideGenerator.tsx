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
    Loader2, FileUp, Share2, X, Download, Layout, Link as LinkIcon,
    BookOpen, MessageSquare, History, ChevronLeft, ChevronRight,
    FileText, Trash2, Copy, FileCheck, Map, UserCircle, StickyNote,
    Zap, PanelsTopLeft, Library, ArrowRight, Sparkles, Plus, CheckCircle2,
    LayoutGrid, BarChart3, Send, AlertCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'framer-motion';

type Source = { id: string; type: 'file' | 'link'; name: string; url?: string; file?: File; };
type ChatMsg = { role: 'user' | 'ai'; content: string; };
type Note = { id: string; content: string; category: string; };
type Phase = 'library' | 'research' | 'slides';

export default function AISlideGenerator({ classes, schoolName = "School", teacherName = "Teacher" }: {
    classes: any[]; schoolName?: string; teacherName?: string;
}) {
    const chatEndRef = useRef<HTMLDivElement>(null);
    const linkInputRef = useRef<HTMLInputElement>(null);

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

    // Scroll chat to bottom
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

    // Load from LocalStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem('studio_v9');
            if (saved) {
                const d = JSON.parse(saved);
                if (d.synthesis) setSynthesis(d.synthesis);
                if (d.chatHistory) setChatHistory(d.chatHistory);
                if (d.slides) { setSlides(d.slides); }
                if (d.notes) setNotes(d.notes);
                if (d.persona) setPersona(d.persona);
                if (d.sources) setSources(d.sources.filter((s: any) => s.type === 'link'));
                if (d.phase) setPhase(d.phase);
            }
        } catch { }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem('studio_v9', JSON.stringify({
                synthesis, chatHistory, slides, notes, persona,
                sources: sources.filter(s => s.type === 'link'), phase
            }));
        } catch { }
    }, [synthesis, chatHistory, slides, notes, persona, sources, phase]);

    const addLink = () => {
        const url = linkInputRef.current?.value?.trim();
        if (!url) return;
        setSources(prev => [...prev, { id: Date.now().toString(), type: 'link', name: url, url }]);
        if (linkInputRef.current) linkInputRef.current.value = '';
    };

    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const newSources: Source[] = Array.from(files).map(f => ({ id: Date.now() + f.name, type: 'file', name: f.name, file: f }));
        setSources(prev => [...prev, ...newSources]);
    };

    const removeSource = (id: string) => setSources(prev => prev.filter(s => s.id !== id));

    const saveNote = (content: string) => {
        setNotes(prev => [{ id: Date.now().toString(), content: content.slice(0, 500), category: 'insight' }, ...prev]);
        setNotesOpen(true);
        toast.success("Saved to Notes!");
    };

    // ---- API Calls ----
    const handleSynthesize = async () => {
        if (!sources.length) return toast.error("Add at least one source first.");
        setLoading(true); setLoadingMsg(`Synthesizing with "${persona}" persona...`);
        try {
            const fd = new FormData();
            sources.filter(s => s.type === 'file' && s.file).forEach(s => fd.append('file', s.file!));
            fd.append('links', JSON.stringify(sources.filter(s => s.type === 'link').map(s => s.url)));
            fd.append('language', language);
            fd.append('persona', persona);

            const res = await fetch('/api/teacher/synthesize-research', { method: 'POST', body: fd });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Synthesis failed");

            setSynthesis(data.synthesis);
            setChatHistory([{ role: 'ai', content: `✅ Knowledge base ready! I've synthesized ${sources.length} source(s) using the "${persona}" lens. What would you like to explore?` }]);
            setPhase('research');
            toast.success("Knowledge base built!");
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const handleChat = async () => {
        if (!query.trim() || !synthesis) return;
        const userMsg = query.trim();
        setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        setQuery("");
        setIsChatting(true);
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesis, customQuery: userMsg, mode: 'chat', persona, language })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error);
            setChatHistory(prev => [...prev, { role: 'ai', content: data.answer }]);
        } catch (e: any) {
            setChatHistory(prev => [...prev, { role: 'ai', content: `⚠️ Error: ${e.message}` }]);
        } finally { setIsChatting(false); }
    };

    const handleTransform = async (template: string) => {
        if (!synthesis) return toast.error("Build your knowledge base first.");
        setLoading(true); setLoadingMsg(`Generating ${template}...`);
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesis, mode: 'transform', template, language })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error);
            if (template === 'graph') {
                setChatHistory(prev => [...prev, { role: 'ai', content: `**Knowledge Graph Generated:**\n\`\`\`\n${data.output}\n\`\`\`` }]);
            } else {
                saveNote(data.output);
                setChatHistory(prev => [...prev, { role: 'ai', content: `✅ **${template.toUpperCase()} generated** and saved to your notes!` }]);
            }
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const handleBuildSlides = async () => {
        if (!synthesis) return toast.error("Build your knowledge base first.");
        setLoading(true); setLoadingMsg("Designing your slides...");
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
            toast.success(`${data.slideData.length} slides generated!`);
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    const handleShare = async () => {
        if (!selectedClass || !slides.length) return toast.error("Select a class first.");
        setIsSharing(true);
        try {
            const res = await shareNoteWithClass({ classId: selectedClass, title: slides[0]?.title || "Studio Slides", content: slides, fileUrl: "studio-v9" });
            if (res.error) throw new Error(res.error);
            toast.success("Deployed to class!");
        } catch (e: any) { toast.error(e.message); }
        finally { setIsSharing(false); }
    };

    const downloadPDF = () => {
        if (!slides.length) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth(); const H = doc.internal.pageSize.getHeight();
        slides.forEach((slide, i) => {
            if (i > 0) doc.addPage();
            doc.setFillColor(10, 10, 10); doc.rect(0, 0, W, H, 'F');
            doc.setFontSize(8); doc.setTextColor(100, 100, 100);
            doc.text(`${schoolName.toUpperCase()} | STUDIO v9`, 15, 12);
            doc.setTextColor(232, 255, 65); doc.setFontSize(24); doc.setFont('helvetica', 'bold');
            const title = doc.splitTextToSize((slide.title || 'UNTITLED').toUpperCase(), W - 40);
            doc.text(title, 20, 35);
            doc.setTextColor(255, 255, 255); doc.setFontSize(11); doc.setFont('helvetica', 'normal');
            let y = 35 + title.length * 10 + 8;
            (slide.points || []).forEach((p: string) => {
                const wrapped = doc.splitTextToSize(`• ${p}`, W - 40);
                doc.text(wrapped, 20, y); y += wrapped.length * 6 + 4;
            });
            doc.setFontSize(10); doc.setTextColor(100, 100, 100);
            doc.text(`${teacherName} | ${i + 1}/${slides.length}`, 20, H - 10);
        });
        doc.save(`${schoolName.replace(/\s+/g, '_')}_Studio_v9.pdf`);
    };

    // ---- Render Sections ----
    const navTabs = [
        { id: 'library', label: 'Library', icon: BookOpen },
        { id: 'research', label: 'Research Hub', icon: MessageSquare },
        { id: 'slides', label: 'Slide Studio', icon: LayoutGrid }
    ];

    return (
        <div className="flex flex-col w-full bg-white dark:bg-[#0A0A0A] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl min-h-[80vh]" style={{ fontFamily: 'Inter, sans-serif' }}>

            {/* ===== TOP HEADER ===== */}
            <div className="flex items-center justify-between px-8 h-16 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D0D0D] flex-shrink-0 gap-4">
                {/* Brand */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-black text-sm uppercase tracking-widest hidden sm:block">AI Studio <span className="text-indigo-500">v9</span></span>
                </div>

                {/* Phase Navigation */}
                <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-2xl p-1 gap-1">
                    {navTabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                if (tab.id === 'research' && !synthesis) return toast.error("Build your knowledge base first.");
                                if (tab.id === 'slides' && !slides.length) return toast.error("Generate slides first.");
                                setPhase(tab.id as Phase);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${phase === tab.id
                                    ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-md'
                                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
                                }`}
                        >
                            <tab.icon className="w-3.5 h-3.5" />
                            <span className="hidden md:block">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-28 h-9 rounded-xl text-xs font-bold border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="English">🇬🇧 English</SelectItem><SelectItem value="Hindi">🇮🇳 Hindi</SelectItem><SelectItem value="Marathi">Marathi</SelectItem></SelectContent>
                    </Select>
                    <button onClick={() => setSidebarOpen(v => !v)} className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-all ${sidebarOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}><Library className="w-4 h-4" /></button>
                    <button onClick={() => setNotesOpen(v => !v)} className={`w-9 h-9 rounded-xl flex items-center justify-center relative transition-all ${notesOpen ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                        <StickyNote className="w-4 h-4" />
                        {notes.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black">{notes.length}</span>}
                    </button>
                </div>
            </div>

            {/* ===== BODY ===== */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* LEFT SIDEBAR - Source Library */}
                <AnimatePresence initial={false}>
                    {sidebarOpen && (
                        <motion.aside
                            key="sidebar"
                            initial={{ width: 0 }} animate={{ width: 280 }} exit={{ width: 0 }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                            className="border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0D0D0D] flex-shrink-0 overflow-hidden"
                        >
                            <div className="w-[280px] h-full flex flex-col p-5 gap-5">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-2 block">Research Persona</Label>
                                    <Select value={persona} onValueChange={setPersona}>
                                        <SelectTrigger className="h-10 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["Academic Deep Dive", "Classroom Storytelling", "Skeptical Analyst", "Quick Summary"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 min-h-0 flex flex-col gap-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Sources ({sources.length})</Label>
                                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                                        {sources.length === 0 && (
                                            <div className="text-center py-8 text-slate-300 dark:text-white/20">
                                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                                <p className="text-xs font-bold">No sources yet</p>
                                            </div>
                                        )}
                                        {sources.map(s => (
                                            <div key={s.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                {s.type === 'file' ? <FileText className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" /> : <LinkIcon className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
                                                <span className="text-[11px] font-semibold truncate flex-1 text-slate-700 dark:text-white/70">{s.name}</span>
                                                <button onClick={() => removeSource(s.id)}><X className="w-3 h-3 text-slate-300 hover:text-red-500" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="relative">
                                        <input type="file" multiple accept=".pdf,.txt,.doc,.docx,.ppt,.pptx,image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => addFiles(e.target.files)} />
                                        <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-600 text-white text-xs font-black cursor-pointer hover:bg-indigo-700 transition-colors">
                                            <FileUp className="w-4 h-4" /> Upload Files
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input ref={linkInputRef} type="url" placeholder="Paste a URL..." className="flex-1 h-10 px-3 rounded-xl text-xs bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium outline-none focus:ring-2 focus:ring-indigo-500" onKeyDown={e => e.key === 'Enter' && addLink()} />
                                        <button onClick={addLink} className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600"><Plus className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* CENTER MAIN AREA */}
                <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#0A0A0A] overflow-hidden">

                    {/* ── PHASE: LIBRARY ── */}
                    {phase === 'library' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-8">
                            <div className="w-20 h-20 rounded-[24px] bg-indigo-600/10 flex items-center justify-center">
                                <BookOpen className="w-10 h-10 text-indigo-600" />
                            </div>
                            <div className="space-y-3 max-w-lg">
                                <h2 className="text-3xl font-black uppercase tracking-tight">Research Studio</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    {sources.length === 0
                                        ? "Add PDFs, documents, or URLs to your library, then click \"Build Knowledge Base\" to begin."
                                        : `${sources.length} source${sources.length > 1 ? 's' : ''} ready. Click the button below to synthesize your research.`}
                                </p>
                            </div>

                            {sources.length > 0 && (
                                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                                    <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 space-y-2">
                                        {sources.slice(0, 3).map(s => (
                                            <div key={s.id} className="flex items-center gap-2 text-xs text-slate-600 dark:text-white/60">
                                                {s.type === 'file' ? <FileText className="w-3 h-3 text-indigo-400" /> : <LinkIcon className="w-3 h-3 text-emerald-400" />}
                                                <span className="truncate">{s.name}</span>
                                            </div>
                                        ))}
                                        {sources.length > 3 && <p className="text-xs text-slate-400">+{sources.length - 3} more</p>}
                                    </div>
                                    <Button
                                        onClick={handleSynthesize}
                                        disabled={loading}
                                        className="w-full h-14 rounded-2xl bg-indigo-600 font-black text-sm shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 transition-all gap-3"
                                    >
                                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> {loadingMsg}</> : <><Zap className="w-5 h-5" /> Build Knowledge Base</>}
                                    </Button>
                                    <p className="text-xs text-slate-400">Persona: <span className="font-bold text-indigo-500">{persona}</span></p>
                                </div>
                            )}

                            {sources.length === 0 && (
                                <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 text-sm font-bold text-slate-400 hover:border-indigo-400 hover:text-indigo-500 transition-all">
                                    <Plus className="w-4 h-4" /> Open Source Library
                                </button>
                            )}
                        </div>
                    )}

                    {/* ── PHASE: RESEARCH HUB ── */}
                    {phase === 'research' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Transform Bar */}
                            <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] overflow-x-auto flex-shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mr-2 whitespace-nowrap">Transform:</span>
                                {[
                                    { id: 'briefing', label: 'Briefing Doc', color: 'indigo' },
                                    { id: 'faq', label: 'FAQ Sheet', color: 'emerald' },
                                    { id: 'timeline', label: 'Timeline', color: 'amber' },
                                    { id: 'graph', label: 'Knowledge Graph', color: 'rose' }
                                ].map(t => (
                                    <button key={t.id} onClick={() => handleTransform(t.id)} disabled={loading}
                                        className={`flex-shrink-0 px-4 h-8 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all ${loading ? 'opacity-40 cursor-not-allowed' : ''}`}>
                                        {t.label}
                                    </button>
                                ))}
                                <div className="ml-auto flex-shrink-0">
                                    <Button onClick={handleBuildSlides} disabled={loading} size="sm" className="h-8 rounded-full bg-indigo-600 font-black text-[10px] uppercase tracking-wider gap-2 px-5">
                                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <LayoutGrid className="w-3 h-3" />}
                                        Build Slides
                                    </Button>
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {chatHistory.map((msg, i) => (
                                    <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                        <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs font-black ${msg.role === 'user' ? 'bg-slate-200 dark:bg-white/10' : 'bg-indigo-600 text-white'}`}>
                                            {msg.role === 'user' ? 'You' : 'AI'}
                                        </div>
                                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 font-medium' : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white/80'}`}>
                                            {msg.content}
                                            {msg.role === 'ai' && (
                                                <button onClick={() => saveNote(msg.content)} className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-indigo-400 transition-colors">
                                                    <Copy className="w-3 h-3" /> Save to Notes
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isChatting && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div>
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-sm text-slate-400 italic">Analyzing sources...</div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            {/* Chat Input */}
                            <div className="flex-shrink-0 p-4 border-t border-slate-100 dark:border-white/10">
                                <div className="flex gap-3 items-end">
                                    <Textarea
                                        value={query}
                                        onChange={e => setQuery(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChat())}
                                        placeholder="Ask anything about your research..."
                                        rows={2}
                                        className="flex-1 resize-none rounded-2xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-sm font-medium focus-visible:ring-indigo-500"
                                    />
                                    <Button onClick={handleChat} disabled={isChatting || !query.trim()} className="h-12 w-12 rounded-2xl bg-indigo-600 p-0 flex-shrink-0">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── PHASE: SLIDE STUDIO ── */}
                    {phase === 'slides' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {slides.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center p-10">
                                    <AlertCircle className="w-12 h-12 text-slate-200 dark:text-white/10" />
                                    <p className="text-slate-400 font-bold text-sm">No slides yet. Go to Research Hub and click "Build Slides".</p>
                                    <Button onClick={() => setPhase('research')} variant="outline" className="rounded-2xl">Go to Research Hub</Button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    {/* Slide View */}
                                    <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center bg-[#0A0A0A]">
                                        <div className="w-full max-w-4xl aspect-video rounded-[32px] overflow-hidden border border-white/10 shadow-2xl relative bg-[#0F0F0F] flex flex-col p-12 gap-6">
                                            <div className="flex items-start gap-6">
                                                <span className="text-7xl drop-shadow-2xl flex-shrink-0">{slides[activeSlide]?.emoji || '🎯'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-3xl font-black text-[#E8FF41] uppercase tracking-tight leading-none mb-4">
                                                        {slides[activeSlide]?.title || 'Untitled'}
                                                    </h2>
                                                    <div className="space-y-3">
                                                        {(slides[activeSlide]?.points || []).slice(0, 4).map((p: string, pi: number) => (
                                                            <div key={pi} className="flex gap-3 items-start">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                                                                <p className="text-white/70 text-sm leading-relaxed">{p}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {slides[activeSlide]?.visual && (
                                                <div className="mt-auto p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#E8FF41] mb-1">{slides[activeSlide].visual.label}</p>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {(slides[activeSlide].visual.elements || []).map((el: string, ei: number) => (
                                                            <span key={ei} className="px-3 py-1 rounded-full bg-white/5 text-xs font-bold text-white/50">{el}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute bottom-6 right-8 text-[10px] font-black text-white/20">{activeSlide + 1} / {slides.length}</div>
                                        </div>
                                    </div>

                                    {/* Controls Bar */}
                                    <div className="flex-shrink-0 p-4 bg-white dark:bg-[#0D0D0D] border-t border-slate-200 dark:border-white/10 flex items-center gap-4 flex-wrap">
                                        {/* Prev/Next */}
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setActiveSlide(v => Math.max(0, v - 1))} disabled={activeSlide === 0} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5"><ChevronLeft className="w-4 h-4" /></button>
                                            <div className="flex gap-1">
                                                {slides.map((_, i) => (
                                                    <button key={i} onClick={() => setActiveSlide(i)} className={`rounded-full transition-all ${i === activeSlide ? 'w-6 h-2 bg-indigo-600' : 'w-2 h-2 bg-slate-200 dark:bg-white/20 hover:bg-slate-400'}`} />
                                                ))}
                                            </div>
                                            <button onClick={() => setActiveSlide(v => Math.min(slides.length - 1, v + 1))} disabled={activeSlide === slides.length - 1} className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5"><ChevronRight className="w-4 h-4" /></button>
                                        </div>

                                        <div className="flex items-center gap-2 ml-auto flex-wrap">
                                            <Button onClick={downloadPDF} variant="outline" size="sm" className="rounded-xl h-9 gap-2 text-xs font-bold"><Download className="w-3.5 h-3.5" /> PDF</Button>
                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger className="w-44 h-9 rounded-xl text-xs font-bold"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Button onClick={handleShare} disabled={isSharing || !selectedClass} size="sm" className="h-9 rounded-xl bg-indigo-600 gap-2 text-xs font-bold px-5">
                                                {isSharing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Share2 className="w-3.5 h-3.5" />} Share
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* RIGHT PANEL - Notes */}
                <AnimatePresence initial={false}>
                    {notesOpen && (
                        <motion.aside
                            key="notes"
                            initial={{ width: 0 }} animate={{ width: 280 }} exit={{ width: 0 }}
                            transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
                            className="border-l border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0D0D0D] flex-shrink-0 overflow-hidden"
                        >
                            <div className="w-[280px] h-full flex flex-col p-5 gap-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-amber-500">Saved Notes ({notes.length})</Label>
                                    <button onClick={() => setNotesOpen(false)}><X className="w-4 h-4 text-slate-400" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                    {notes.length === 0 && (
                                        <div className="text-center py-8 text-slate-300 dark:text-white/20">
                                            <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                            <p className="text-xs font-bold">No notes yet</p>
                                        </div>
                                    )}
                                    {notes.map(n => (
                                        <div key={n.id} className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 group relative">
                                            <p className="text-xs leading-relaxed text-slate-700 dark:text-white/70 line-clamp-4">{n.content}</p>
                                            <button onClick={() => setNotes(prev => prev.filter(x => x.id !== n.id))} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3 text-red-400" /></button>
                                        </div>
                                    ))}
                                </div>
                                {slides.length > 0 && (
                                    <Button onClick={downloadPDF} variant="outline" size="sm" className="w-full rounded-xl h-10 gap-2 text-xs font-bold"><Download className="w-3.5 h-3.5" /> Export Slides PDF</Button>
                                )}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* ===== GLOBAL LOADING OVERLAY ===== */}
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/90 dark:bg-black/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-6"
                    >
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                            <div className="w-16 h-16 rounded-full border-4 border-t-indigo-600 border-slate-200 dark:border-white/10" />
                        </motion.div>
                        <div className="text-center">
                            <p className="font-black text-lg">{loadingMsg}</p>
                            <p className="text-xs text-slate-400 mt-1 animate-pulse">This may take up to 30 seconds...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
