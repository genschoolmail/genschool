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
    Zap, Library, Sparkles, Plus,
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

    // ---- Persist helpers (no race condition — explicit save on successful operations) ----
    const persist = useCallback((overrides: Record<string, any> = {}) => {
        try {
            const current = {
                synthesis, chatHistory, slides, notes, persona,
                sources: sources.filter(s => s.type === 'link'),
                phase
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...overrides }));
        } catch { }
    }, [synthesis, chatHistory, slides, notes, persona, sources, phase]);

    // ---- Load from LocalStorage (once on mount) ----
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
                if (d.chatHistory?.length) setChatHistory(d.chatHistory);
                else setChatHistory([{ role: 'ai', content: '✅ Previous session restored. Ask me anything!' }]);
                setPhase('research');
            }
            if (d.slides?.length) setSlides(d.slides);
            if (d.notes?.length) setNotes(d.notes);
        } catch { }
    }, []);

    // ---- Source Management ----
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
        const newNote = { id: Date.now().toString(), content: content.slice(0, 800) };
        setNotes(prev => [newNote, ...prev]);
        setNotesOpen(true);
        toast.success("Saved to Notes!");
    };

    // ---- SYNTHESIZE (Build Knowledge Base) ----
    const handleSynthesize = async () => {
        if (!sources.length) return toast.error("Add at least one source first.");
        setLoading(true);
        setLoadingMsg(`Processing sources with "${persona}" mode...`);

        try {
            const fd = new FormData();
            sources.filter(s => s.type === 'file' && s.file).forEach(s => fd.append('file', s.file!));
            fd.append('links', JSON.stringify(sources.filter(s => s.type === 'link').map(s => s.url)));
            fd.append('language', language);
            fd.append('persona', persona);

            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 58000);
            const res = await fetch('/api/teacher/synthesize-research', { method: 'POST', body: fd, signal: controller.signal });
            clearTimeout(timeout);

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: `Server error ${res.status}` }));
                throw new Error(err.error || `Server error ${res.status}`);
            }
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            if (!data.synthesis) throw new Error("AI returned empty synthesis. Please try again.");

            const initialMsg: ChatMsg = { role: 'ai', content: `✅ Knowledge base built from ${sources.length} source(s) using "${persona}" mode!\n\nI'm ready to answer your questions. You can also use the toolbar above to generate Briefing Docs, FAQs, or Timelines — or click "Build Slides" to create a presentation.` };

            // Set all state at once and persist explicitly
            setSynthesis(data.synthesis);
            setChatHistory([initialMsg]);
            setPhase('research');

            // Explicit persist with the new values to avoid race condition
            persist({
                synthesis: data.synthesis,
                chatHistory: [initialMsg],
                phase: 'research'
            });

            toast.success("Knowledge base ready! Switching to Research Hub...");
        } catch (e: any) {
            const msg = e.name === 'AbortError' ? "Timeout — try a smaller file or fewer sources." : (e.message || "Synthesis failed. Please try again.");
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // ---- CHAT ----
    const handleChat = async () => {
        if (!query.trim()) return;
        if (!synthesis) { setPhase('library'); return toast.error("Build your knowledge base first."); }
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
            const aiMsg: ChatMsg = { role: 'ai', content: data.answer };
            const updatedHistory = [...newHistory, aiMsg];
            setChatHistory(updatedHistory);
            persist({ chatHistory: updatedHistory });
        } catch (e: any) {
            const errMsg: ChatMsg = { role: 'ai', content: `⚠️ Error: ${e.message}` };
            setChatHistory(prev => [...prev, errMsg]);
        } finally { setIsChatting(false); }
    };

    // ---- TRANSFORM ----
    const handleTransform = async (template: string) => {
        if (!synthesis) return toast.error("Build your knowledge base first.");
        setLoading(true);
        setLoadingMsg(`Generating ${template}...`);
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesis, mode: 'transform', template, language })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error);
            const content = data.output || "";
            saveNote(content);
            const aiMsg: ChatMsg = { role: 'ai', content: `✅ **${template.charAt(0).toUpperCase() + template.slice(1)}** generated and saved to your notes panel!\n\nHere's a preview:\n\n${content.slice(0, 400)}${content.length > 400 ? '...' : ''}` };
            setChatHistory(prev => {
                const updated = [...prev, aiMsg];
                persist({ chatHistory: updated });
                return updated;
            });
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    // ---- BUILD SLIDES ----
    const handleBuildSlides = async () => {
        if (!synthesis) { setPhase('library'); return toast.error("Build your knowledge base first."); }
        setLoading(true);
        setLoadingMsg("Designing your presentation...");
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesis, language, teacherName, schoolName, persona })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error || "Slide generation failed");
            if (!data.slideData?.length) throw new Error("No slides were generated. Please try again.");

            setSlides(data.slideData);
            setActiveSlide(0);
            setPhase('slides');
            persist({ slides: data.slideData, phase: 'slides' });
            toast.success(`${data.slideData.length} slides created!`);
        } catch (e: any) { toast.error(e.message); }
        finally { setLoading(false); }
    };

    // ---- SHARE ----
    const handleShare = async () => {
        if (!selectedClass) return toast.error("Select a class first.");
        if (!slides.length) return toast.error("No slides to share.");
        setIsSharing(true);
        try {
            const res = await shareNoteWithClass({ classId: selectedClass, title: slides[0]?.title || "AI Studio Slides", content: slides, fileUrl: "studio-v9" });
            if (res?.error) throw new Error(res.error);
            toast.success("Slides shared with class!");
        } catch (e: any) { toast.error(e.message); }
        finally { setIsSharing(false); }
    };

    // ---- PDF ----
    const downloadPDF = () => {
        if (!slides.length) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth(); const H = doc.internal.pageSize.getHeight();
        slides.forEach((slide, i) => {
            if (i > 0) doc.addPage();
            doc.setFillColor(10, 10, 10); doc.rect(0, 0, W, H, 'F');
            doc.setFontSize(8); doc.setTextColor(80, 80, 80);
            doc.text(`${schoolName.toUpperCase()} | AI STUDIO`, 15, 12);
            doc.setTextColor(232, 255, 65); doc.setFontSize(22); doc.setFont('helvetica', 'bold');
            const title = doc.splitTextToSize((slide.title || 'UNTITLED').toUpperCase(), W - 40);
            doc.text(title, 20, 32);
            doc.setTextColor(220, 220, 220); doc.setFontSize(11); doc.setFont('helvetica', 'normal');
            let y = 32 + title.length * 9 + 6;
            (slide.points || []).slice(0, 5).forEach((p: string) => {
                const wrapped = doc.splitTextToSize(`• ${p}`, W - 40);
                if (y < H - 20) { doc.text(wrapped, 20, y); y += wrapped.length * 6 + 3; }
            });
            doc.setFontSize(9); doc.setTextColor(70, 70, 70);
            doc.text(`${teacherName} | ${i + 1}/${slides.length}`, 20, H - 10);
        });
        doc.save(`${schoolName.replace(/\s+/g, '_')}_Slides.pdf`);
    };

    // =========================================================
    // RENDER
    // =========================================================
    return (
        <div className="flex flex-col w-full bg-white dark:bg-[#0A0A0A] rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-2xl" style={{ minHeight: '82vh', fontFamily: 'Inter, system-ui, sans-serif' }}>

            {/* ===== HEADER NAVIGATION ===== */}
            <header className="flex items-center justify-between px-6 h-14 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#0D0D0D] flex-shrink-0 gap-3">
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center"><Sparkles className="w-3.5 h-3.5 text-white" /></div>
                    <span className="font-black text-xs uppercase tracking-widest hidden sm:block">AI Research Studio</span>
                </div>

                {/* Tab Navigation */}
                <nav className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-0.5 gap-0.5">
                    {[
                        { id: 'library', label: 'Library', icon: BookOpen },
                        { id: 'research', label: 'Research Hub', icon: MessageSquare },
                        { id: 'slides', label: 'Slides', icon: LayoutGrid }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setPhase(tab.id as Phase)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all ${phase === tab.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
                            <tab.icon className="w-3 h-3" />
                            <span className="hidden sm:block">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="w-24 h-8 rounded-lg text-xs font-bold border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="English">🇬🇧 English</SelectItem><SelectItem value="Hindi">🇮🇳 Hindi</SelectItem><SelectItem value="Marathi">Marathi</SelectItem></SelectContent>
                    </Select>
                    <button title="Toggle Source Library" onClick={() => setSidebarOpen(v => !v)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${sidebarOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}><Library className="w-3.5 h-3.5" /></button>
                    <button title="Toggle Notes" onClick={() => setNotesOpen(v => !v)} className={`w-8 h-8 rounded-lg flex items-center justify-center relative transition-all ${notesOpen ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
                        <StickyNote className="w-3.5 h-3.5" />
                        {notes.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-black">{notes.length}</span>}
                    </button>
                </div>
            </header>

            {/* ===== BODY ===== */}
            <div className="flex flex-1 overflow-hidden">

                {/* LEFT: Source Sidebar */}
                <AnimatePresence initial={false}>
                    {sidebarOpen && (
                        <motion.aside key="sidebar" initial={{ width: 0, opacity: 0 }} animate={{ width: 268, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0D0D0D] flex-shrink-0 overflow-hidden">
                            <div className="w-[268px] h-full flex flex-col p-4 gap-4">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mb-1.5 block">Analysis Persona</Label>
                                    <Select value={persona} onValueChange={setPersona}>
                                        <SelectTrigger className="h-9 rounded-xl text-xs font-bold bg-white dark:bg-white/5 border-slate-200 dark:border-white/10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["Academic Deep Dive", "Classroom Storytelling", "Skeptical Analyst", "Quick Summary"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 min-h-0 flex flex-col gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Sources ({sources.length})</Label>
                                    <div className="flex-1 overflow-y-auto space-y-1.5">
                                        {sources.length === 0 && (
                                            <div className="text-center py-6 text-slate-300 dark:text-white/20">
                                                <FileText className="w-6 h-6 mx-auto mb-1 opacity-40" />
                                                <p className="text-[11px] font-bold">No sources added yet</p>
                                            </div>
                                        )}
                                        {sources.map(s => (
                                            <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                                {s.type === 'file' ? <FileText className="w-3 h-3 text-indigo-400 flex-shrink-0" /> : <LinkIcon className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                                                <span className="text-[11px] font-medium truncate flex-1 text-slate-700 dark:text-white/60">{s.name}</span>
                                                <button onClick={() => removeSource(s.id)} className="text-slate-300 hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                    {/* File Upload */}
                                    <div className="relative rounded-xl overflow-hidden">
                                        <input type="file" multiple accept=".pdf,.txt,.doc,.docx,image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={e => addFiles(e.target.files)} />
                                        <div className="flex items-center gap-2 p-3 bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-colors cursor-pointer">
                                            <FileUp className="w-3.5 h-3.5" /> Upload Files (PDF, Images)
                                        </div>
                                    </div>
                                    {/* URL Input */}
                                    <div className="flex gap-1.5">
                                        <input ref={linkInputRef} type="url" placeholder="Paste URL & press Enter..." className="flex-1 h-9 px-3 rounded-lg text-xs bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 font-medium outline-none focus:ring-2 focus:ring-indigo-500" onKeyDown={e => e.key === 'Enter' && addLink()} />
                                        <button onClick={addLink} className="w-9 h-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 flex-shrink-0"><Plus className="w-4 h-4" /></button>
                                    </div>

                                    {/* Build Button */}
                                    {sources.length > 0 && !synthesis && (
                                        <Button onClick={handleSynthesize} disabled={loading} className="w-full h-10 rounded-xl bg-indigo-600 font-black text-xs gap-2 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700">
                                            {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</> : <><Zap className="w-3.5 h-3.5" /> Build Knowledge Base</>}
                                        </Button>
                                    )}
                                    {synthesis && (
                                        <button onClick={() => { setSynthesis(""); setChatHistory([]); setSlides([]); setPhase('library'); localStorage.removeItem(STORAGE_KEY); }} className="w-full text-center text-[10px] text-slate-400 hover:text-red-500 font-bold transition-colors pt-1">
                                            ↻ Reset & Start Over
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* CENTER: Main Content */}
                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

                    {/* ── LIBRARY PHASE ── */}
                    {phase === 'library' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 flex items-center justify-center"><BookOpen className="w-8 h-8 text-indigo-600" /></div>
                            <div className="max-w-md space-y-2">
                                <h2 className="text-2xl font-black uppercase tracking-tight">
                                    {synthesis ? "Knowledge Base Ready ✅" : "Add Research Sources"}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    {synthesis
                                        ? `Your synthesis is ready. Switch to the Research Hub to chat with your sources or build slides.`
                                        : `Upload PDFs, documents, or add URLs in the library panel (left). Then click "Build Knowledge Base".`}
                                </p>
                            </div>
                            {synthesis ? (
                                <div className="flex gap-3">
                                    <Button onClick={() => setPhase('research')} className="h-11 px-8 rounded-xl bg-indigo-600 font-black text-xs gap-2"><MessageSquare className="w-3.5 h-3.5" /> Open Research Hub</Button>
                                    <Button onClick={() => setPhase('slides')} variant="outline" className="h-11 px-8 rounded-xl font-black text-xs gap-2"><LayoutGrid className="w-3.5 h-3.5" /> View Slides {slides.length > 0 ? `(${slides.length})` : ''}</Button>
                                </div>
                            ) : (
                                <Button onClick={() => setSidebarOpen(true)} variant="outline" className="h-11 px-8 rounded-xl font-black text-xs gap-2 border-dashed border-2">
                                    <Plus className="w-3.5 h-3.5" /> Open Library Panel
                                </Button>
                            )}
                        </div>
                    )}

                    {/* ── RESEARCH HUB PHASE ── */}
                    {phase === 'research' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Transform Toolbar */}
                            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-100 dark:border-white/5 bg-slate-50/80 dark:bg-white/[0.02] flex-shrink-0 flex-wrap">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 mr-1">Generate:</span>
                                {[{ id: 'briefing', label: '📄 Briefing' }, { id: 'faq', label: '❓ FAQ' }, { id: 'timeline', label: '📅 Timeline' }].map(t => (
                                    <button key={t.id} onClick={() => handleTransform(t.id)} disabled={loading || !synthesis}
                                        className="px-3 h-7 rounded-full text-[10px] font-black uppercase border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed">
                                        {t.label}
                                    </button>
                                ))}
                                <div className="ml-auto">
                                    <Button onClick={handleBuildSlides} disabled={loading || !synthesis} size="sm" className="h-7 rounded-full bg-indigo-600 font-black text-[10px] gap-1.5 px-4">
                                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <LayoutGrid className="w-3 h-3" />}
                                        Build Slides
                                    </Button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                {!synthesis ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                                        <AlertCircle className="w-10 h-10 text-slate-200 dark:text-white/10" />
                                        <div className="space-y-1">
                                            <p className="font-black text-sm text-slate-400">No knowledge base yet</p>
                                            <p className="text-xs text-slate-300 dark:text-white/20">Go to the Library, add sources, and click "Build Knowledge Base".</p>
                                        </div>
                                        <Button onClick={() => setPhase('library')} size="sm" variant="outline" className="rounded-xl text-xs font-bold">Go to Library</Button>
                                    </div>
                                ) : (
                                    <>
                                        {chatHistory.length === 0 && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-black flex-shrink-0">AI</div>
                                                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 text-sm text-slate-600 dark:text-white/70 max-w-[80%]">
                                                    ✅ Knowledge base is ready! Ask me anything about your sources, or use the toolbar above to generate documents.
                                                </div>
                                            </div>
                                        )}
                                        {chatHistory.map((msg, i) => (
                                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-black ${msg.role === 'user' ? 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white' : 'bg-indigo-600 text-white'}`}>
                                                    {msg.role === 'user' ? 'You' : 'AI'}
                                                </div>
                                                <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-800 dark:text-indigo-200 font-medium' : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-white/80'}`}>
                                                    {msg.content}
                                                    {msg.role === 'ai' && (
                                                        <button onClick={() => saveNote(msg.content)} className="mt-2 flex items-center gap-1 text-[10px] font-black uppercase text-slate-300 hover:text-indigo-400 transition-colors">
                                                            <Copy className="w-2.5 h-2.5" /> Save to Notes
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        {isChatting && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center"><Loader2 className="w-4 h-4 text-white animate-spin" /></div>
                                                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-xs text-slate-400 italic">Analyzing your sources...</div>
                                            </div>
                                        )}
                                        <div ref={chatEndRef} />
                                    </>
                                )}
                            </div>

                            {/* Chat Input */}
                            <div className="flex-shrink-0 p-3 border-t border-slate-100 dark:border-white/10">
                                <div className="flex gap-2 items-end">
                                    <Textarea value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChat())}
                                        placeholder={synthesis ? "Ask anything about your research... (Enter to send)" : "Build your knowledge base first..."}
                                        disabled={!synthesis} rows={2}
                                        className="flex-1 resize-none rounded-xl bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-sm font-medium focus-visible:ring-indigo-500 disabled:opacity-40" />
                                    <Button onClick={handleChat} disabled={isChatting || !query.trim() || !synthesis} className="h-11 w-11 rounded-xl bg-indigo-600 p-0 flex-shrink-0">
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── SLIDE STUDIO PHASE ── */}
                    {phase === 'slides' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {slides.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-8">
                                    <AlertCircle className="w-10 h-10 text-slate-200 dark:text-white/10" />
                                    <div className="space-y-1">
                                        <p className="font-black text-sm text-slate-400">No slides generated yet</p>
                                        <p className="text-xs text-slate-300 dark:text-white/20">{synthesis ? 'Go to Research Hub and click "Build Slides".' : 'You need to build a knowledge base first.'}</p>
                                    </div>
                                    <Button onClick={() => setPhase(synthesis ? 'research' : 'library')} size="sm" variant="outline" className="rounded-xl text-xs font-bold">
                                        {synthesis ? 'Go to Research Hub' : 'Go to Library'}
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col">
                                    {/* Slide Viewer */}
                                    <div className="flex-1 flex items-center justify-center p-6 bg-slate-100 dark:bg-[#0A0A0A]">
                                        <div className="w-full max-w-3xl aspect-video rounded-2xl bg-[#0F0F0F] border border-white/10 shadow-2xl relative overflow-hidden flex flex-col justify-center p-10 gap-5">
                                            <div className="flex items-start gap-5">
                                                <span className="text-6xl drop-shadow-xl flex-shrink-0 leading-none">{slides[activeSlide]?.emoji || '🎯'}</span>
                                                <div className="flex-1 min-w-0">
                                                    <h2 className="text-2xl font-black text-[#E8FF41] uppercase tracking-tight leading-tight mb-4">
                                                        {slides[activeSlide]?.title || 'Untitled'}
                                                    </h2>
                                                    <ul className="space-y-2">
                                                        {(slides[activeSlide]?.points || []).slice(0, 4).map((p: string, pi: number) => (
                                                            <li key={pi} className="flex gap-2.5 items-start">
                                                                <div className="w-1 h-1 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                                                                <p className="text-white/65 text-xs leading-relaxed">{p}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 right-6 text-[10px] font-black text-white/20">{activeSlide + 1} / {slides.length}</div>
                                        </div>
                                    </div>

                                    {/* Slide Controls */}
                                    <div className="flex-shrink-0 p-3 bg-white dark:bg-[#0D0D0D] border-t border-slate-200 dark:border-white/10 flex items-center gap-3 flex-wrap">
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => setActiveSlide(v => Math.max(0, v - 1))} disabled={activeSlide === 0} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
                                            <div className="flex gap-1">
                                                {slides.map((_, i) => (
                                                    <button key={i} onClick={() => setActiveSlide(i)} className={`rounded-full transition-all ${i === activeSlide ? 'w-5 h-2 bg-indigo-600' : 'w-2 h-2 bg-slate-200 dark:bg-white/20 hover:bg-slate-400'}`} />
                                                ))}
                                            </div>
                                            <button onClick={() => setActiveSlide(v => Math.min(slides.length - 1, v + 1))} disabled={activeSlide === slides.length - 1} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/10 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
                                        </div>

                                        <div className="ml-auto flex items-center gap-2 flex-wrap">
                                            <Button onClick={downloadPDF} variant="outline" size="sm" className="h-8 rounded-lg gap-1.5 text-xs font-bold"><Download className="w-3 h-3" /> PDF</Button>
                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger className="w-40 h-8 rounded-lg text-xs font-bold"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Button onClick={handleShare} disabled={isSharing || !selectedClass} size="sm" className="h-8 rounded-lg bg-indigo-600 gap-1.5 text-xs font-bold px-4">
                                                {isSharing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Share2 className="w-3 h-3" />} Share
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* RIGHT: Notes Panel */}
                <AnimatePresence initial={false}>
                    {notesOpen && (
                        <motion.aside key="notes" initial={{ width: 0, opacity: 0 }} animate={{ width: 260, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }} className="border-l border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0D0D0D] flex-shrink-0 overflow-hidden">
                            <div className="w-[260px] h-full flex flex-col p-4 gap-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-amber-500">Notes ({notes.length})</Label>
                                    <button onClick={() => setNotesOpen(false)}><X className="w-3.5 h-3.5 text-slate-400" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {notes.length === 0 && (
                                        <div className="text-center py-8 text-slate-300 dark:text-white/20">
                                            <StickyNote className="w-6 h-6 mx-auto mb-1 opacity-40" />
                                            <p className="text-[11px] font-bold">No notes yet</p>
                                        </div>
                                    )}
                                    {notes.map(n => (
                                        <div key={n.id} className="p-2.5 rounded-lg bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 group relative">
                                            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-white/60 line-clamp-5">{n.content}</p>
                                            <button onClick={() => setNotes(prev => prev.filter(x => x.id !== n.id))} className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3 text-red-400" /></button>
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={downloadPDF} disabled={!slides.length} variant="outline" size="sm" className="w-full rounded-lg h-9 gap-1.5 text-xs font-bold"><Download className="w-3 h-3" /> Export PDF</Button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>

            {/* ===== GLOBAL LOADING OVERLAY ===== */}
            <AnimatePresence>
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/92 dark:bg-black/92 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-5">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-12 h-12 rounded-full border-4 border-t-indigo-600 border-slate-200 dark:border-white/10" />
                        <div className="text-center space-y-1">
                            <p className="font-black text-base">{loadingMsg}</p>
                            <p className="text-xs text-slate-400 animate-pulse">This may take 15–30 seconds...</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
