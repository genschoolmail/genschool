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
    LayoutGrid, Send, AlertCircle, Terminal, Bug
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
    const [debugOpen, setDebugOpen] = useState(false);
    const [sources, setSources] = useState<Source[]>([]);
    const [persona, setPersona] = useState("Academic Deep Dive");
    const [language, setLanguage] = useState("English");
    const [loading, setLoading] = useState(false);
    const [loadingMsg, setLoadingMsg] = useState("Initializing...");
    const [synthesis, setSynthesis] = useState("");
    const [chatHistory, setChatHistory] = useState<ChatMsg[]>([]);
    const [query, setQuery] = useState("");
    const [isChatting, setIsChatting] = useState(false);
    const [slides, setSlides] = useState<any[]>([]);
    const [activeSlide, setActiveSlide] = useState(0);
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [researchEditMode, setResearchEditMode] = useState(false);
    const [editSynthesis, setEditSynthesis] = useState("");

    // Safe render helper - prevents React Error #31
    const safeStr = (val: any): string => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'number') return String(val);
        return JSON.stringify(val);
    };

    // Debug Logs
    const [logs, setLogs] = useState<{ t: string, m: string, type: 'info' | 'error' | 'success' }[]>([]);

    const addLog = (m: string, type: 'info' | 'error' | 'success' = 'info') => {
        setLogs(prev => [{ t: new Date().toLocaleTimeString(), m, type }, ...prev].slice(0, 50));
    };

    // ---- Scroll chat ----
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

    // ---- Robust Persist ----
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
            const payload = { ...data, sources: data.sources.filter(s => s.type === 'link') };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            addLog("Progress saved to storage", 'success');
        } catch (e: any) {
            addLog(`Storage error: ${e.message}`, 'error');
        }
    };

    // ---- Load from LocalStorage ----
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        addLog("Studio initialized", 'info');
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (!saved) return;
            const d = JSON.parse(saved);
            if (d.persona) setPersona(d.persona);
            if (d.sources?.length) setSources(d.sources.filter((s: any) => s.type === 'link'));
            if (d.synthesis) {
                setSynthesis(d.synthesis);
                setChatHistory(d.chatHistory?.length ? d.chatHistory : [{ role: 'ai', content: 'Session restored.' }]);
                setPhase(d.phase || 'research');
                addLog("Previous session restored successfully", 'success');
            }
            if (d.slides?.length) setSlides(d.slides);
            if (d.notes?.length) setNotes(d.notes);
        } catch (e: any) {
            addLog(`Failed to load session: ${e.message}`, 'error');
        }
    }, []);

    const addLink = () => {
        const url = linkInputRef.current?.value?.trim();
        if (!url) return;
        setSources(prev => [...prev, { id: Date.now().toString(), type: 'link', name: url, url }]);
        if (linkInputRef.current) linkInputRef.current.value = '';
        addLog(`Link added: ${url}`, 'info');
    };
    const addFiles = (files: FileList | null) => {
        if (!files) return;
        const newSources = Array.from(files).map(f => ({ id: Date.now() + f.name, type: 'file' as const, name: f.name, file: f }));
        setSources(prev => [...prev, ...newSources]);
        addLog(`${newSources.length} file(s) added to library`, 'info');
    };
    const removeSource = (id: string) => setSources(prev => prev.filter(s => s.id !== id));

    const saveNote = (content: string) => {
        const newNote = { id: Date.now().toString(), content: content.slice(0, 1500) };
        setNotes(prev => [newNote, ...prev]);
        setNotesOpen(true);
        toast.success("Saved to Notes!");
    };

    // ---- SYNTHESIZE ----
    const handleSynthesize = async () => {
        if (!sources.length) return toast.error("Add sources first.");
        setLoading(true);
        setLoadingMsg("Uploading & analyzing...");
        addLog(`Starting synthesis for ${sources.length} sources...`, 'info');

        try {
            const fd = new FormData();
            sources.filter(s => s.type === 'file' && s.file).forEach(s => fd.append('file', s.file!));
            fd.append('links', JSON.stringify(sources.filter(s => s.type === 'link').map(s => s.url)));
            fd.append('language', language);
            fd.append('persona', persona);

            addLog("Sending payload to /api/teacher/synthesize-research...", 'info');
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 85000); // Increased timeout

            const startTime = Date.now();
            const res = await fetch('/api/teacher/synthesize-research', {
                method: 'POST',
                body: fd,
                signal: controller.signal
            });
            clearTimeout(timeout);
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                const msg = errData.error || `Server error ${res.status}`;
                if (errData.discovery) addLog(`DISCOVERY: ${errData.discovery}`, 'error');
                if (errData.debug) addLog(`LAST ERR: ${errData.debug}`, 'error');
                addLog(`API FAILED (${res.status}): ${msg}`, 'error');
                throw new Error(msg);
            }

            const data = await res.json();
            if (!data.synthesis) {
                addLog("API returned success but 'synthesis' field is missing or empty.", 'error');
                throw new Error("Empty response from AI engine.");
            }

            addLog(`Synthesis complete in ${duration}s! Size: ${data.synthesis.length} chars`, 'success');

            const welcomeMsg: ChatMsg = {
                role: 'ai',
                content: `✅ **Synthesis Complete!** I have analyzed your sources using the "${persona}" lens.\n\nAsk me anything, or click "Build Slides" to create a presentation.`
            };

            setSynthesis(data.synthesis);
            setChatHistory([welcomeMsg]);
            setPhase('research');

            persistSnapshot({
                synthesis: data.synthesis,
                chatHistory: [welcomeMsg],
                slides, notes, persona, sources, phase: 'research'
            });

            toast.success("Project ready!");
        } catch (e: any) {
            const m = e.name === 'AbortError' ? "Request timed out (85s). Vercel might have killed the process." : e.message;
            addLog(`CRITICAL ERROR: ${m}`, 'error');
            setDebugOpen(true);
            toast.error(m);
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
        addLog(`Asking AI: "${userMsg.slice(0, 30)}..."`, 'info');
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
            addLog("AI responded successfully", 'success');
        } catch (e: any) {
            addLog(`Chat error: ${e.message}`, 'error');
            setChatHistory(prev => [...prev, { role: 'ai', content: `⚠️ Error: ${e.message}` }]);
        } finally { setIsChatting(false); }
    };

    // ---- TRANSFORM (FAQs, Briefings) ----
    const handleTransform = async (template: string) => {
        if (!synthesis) return;
        setLoading(true);
        setLoadingMsg(`AI is writing your ${template}...`);
        addLog(`Transforming research into ${template}...`, 'info');
        try {
            const res = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ summary: synthesis, mode: 'transform', template, language })
            });
            const data = await res.json();
            if (!res.ok || data.error) throw new Error(data.error);
            saveNote(data.output);
            addLog(`Success! ${template} added to notes.`, 'success');
        } catch (e: any) {
            addLog(`Transform error: ${e.message}`, 'error');
            toast.error(e.message);
        } finally { setLoading(false); }
    };

    // ---- BUILD SLIDES ----
    const handleBuildSlides = async () => {
        if (!synthesis) return;
        setLoading(true);
        setLoadingMsg("Designing slides...");
        addLog("Generating slide deck...", 'info');
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
            addLog(`Success! ${data.slideData.length} slides created.`, 'success');
            toast.success("Slides generated!");
        } catch (e: any) {
            addLog(`Slide error: ${e.message}`, 'error');
            toast.error(e.message);
        } finally { setLoading(false); }
    };

    const handleShare = async () => {
        if (!selectedClass || !slides.length) return;
        setIsSharing(true);
        addLog(`Sharing research deck with ${selectedClass}...`, 'info');
        try {
            await shareNoteWithClass({
                classId: selectedClass,
                title: slides[0]?.title || "Research Project",
                content: slides,
                fileUrl: "studio-v11"
            });
            addLog("Successfully shared with class!", 'success');
            toast.success("Shared successfully!");
        } catch (e: any) {
            addLog(`Share error: ${e.message}`, 'error');
            toast.error("Sharing failed.");
        } finally { setIsSharing(false); }
    };

    const downloadPDF = () => {
        if (!slides.length) return;
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const W = doc.internal.pageSize.getWidth();
        const H = doc.internal.pageSize.getHeight();
        slides.forEach((slide, i) => {
            if (i > 0) doc.addPage();
            doc.setFillColor(15, 15, 20).rect(0, 0, W, H, 'F');
            doc.setTextColor(232, 255, 65).setFontSize(26).setFont('helvetica', 'bold');
            doc.text((slide.title || '').toUpperCase(), 20, 35);
            doc.setTextColor(255, 255, 255).setFontSize(14).setFont('helvetica', 'normal');
            let y = 55;
            (slide.points || []).forEach((p: string) => {
                const lines = doc.splitTextToSize(`• ${p}`, W - 40);
                doc.text(lines, 20, y);
                y += lines.length * 9;
            });
            doc.setFontSize(9).setTextColor(80, 80, 100).text(`${schoolName} | Slide ${i + 1}`, 20, H - 12);
        });
        doc.save(`${schoolName.replace(/\s/g, '_')}_Slides.pdf`);
    };

    return (
        <div className="flex flex-col w-full bg-slate-50 dark:bg-[#08080A] rounded-[2.5rem] border border-slate-200 dark:border-white/[0.08] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)]"
            style={{ minHeight: '88vh', fontFamily: 'Inter, sans-serif' }}>

            {/* HEADER */}
            <header className="flex items-center justify-between px-8 h-20 bg-white/70 dark:bg-[#0D0D0F]/70 backdrop-blur-2xl border-b border-slate-200 dark:border-white/[0.08] relative z-20">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-black text-[10px] uppercase tracking-[0.3em] text-indigo-500 leading-none mb-1">Intelligence Suite</span>
                        <span className="font-bold text-sm tracking-tight">AI RESEARCH STUDIO</span>
                    </div>
                </div>

                <nav className="flex items-center bg-slate-200/50 dark:bg-white/[0.03] rounded-[1.25rem] p-1.5 border border-slate-200 dark:border-white/[0.05]">
                    {[
                        { id: 'library', label: 'Library', icon: Library },
                        { id: 'research', label: 'Research Hub', icon: MessageSquare },
                        { id: 'slides', label: 'Slide Deck', icon: LayoutGrid }
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setPhase(tab.id as Phase)}
                            className={`flex items-center gap-2.5 px-6 py-2.5 rounded-[0.85rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${phase === tab.id ? 'bg-white dark:bg-indigo-600 text-indigo-600 dark:text-white shadow-xl shadow-indigo-600/10 scale-105' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}>
                            <tab.icon className="w-4 h-4" />
                            <span className="hidden lg:block">{tab.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-3">
                    <button onClick={() => setDebugOpen(!debugOpen)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${debugOpen ? 'bg-red-500 text-white' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 hover:text-red-500'}`} title="Debug Console">
                        <Bug className="w-4 h-4" />
                    </button>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${sidebarOpen ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-white/[0.05] text-slate-400 hover:text-indigo-400'}`}>
                        <Library className="w-4 h-4" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden relative">
                {/* SIDEBAR */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="border-r border-slate-200 dark:border-white/[0.05] bg-white/30 dark:bg-[#0D0D0F]/30 backdrop-blur-xl overflow-hidden flex flex-col z-10">
                            <div className="w-[300px] p-6 flex flex-col h-full gap-6">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2.5 block px-1">Analysis Persona</Label>
                                    <Select value={persona} onValueChange={setPersona}>
                                        <SelectTrigger className="h-12 rounded-[1rem] text-xs font-bold bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] shadow-sm"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {["Academic Deep Dive", "Classroom Storytelling", "Skeptical Analyst", "Quick Summary"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-2.5">
                                    <div className="flex items-center justify-between px-1 mb-2">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">Sources ({sources.length})</Label>
                                        <button onClick={() => setSources([])} className="text-[9px] font-black text-slate-300 hover:text-red-500 tracking-tighter uppercase transition-colors">Clear all</button>
                                    </div>
                                    <div className="space-y-2">
                                        {sources.map(s => (
                                            <div key={s.id} className="flex items-center gap-3 p-3.5 rounded-[1.25rem] bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/[0.05] group hover:border-indigo-500/30 transition-all">
                                                <div className={`p-2 rounded-lg ${s.type === 'file' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                    {s.type === 'file' ? <FileText className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
                                                </div>
                                                <span className="text-[11px] font-bold truncate flex-1 leading-none">{s.name}</span>
                                                <button onClick={() => removeSource(s.id)} className="text-slate-300 hover:text-red-500 hover:scale-110 transition-all"><X className="w-4 h-4" /></button>
                                            </div>
                                        ))}
                                    </div>
                                    {sources.length === 0 && (
                                        <div className="text-center py-16 opacity-30 select-none">
                                            <div className="w-16 h-16 bg-slate-200 dark:bg-white/[0.03] rounded-3xl flex items-center justify-center mx-auto mb-4"><BookOpen className="w-8 h-8" /></div>
                                            <p className="text-[10px] font-black tracking-widest uppercase">Empty Library</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-white/[0.05]">
                                    <div className="relative group">
                                        <input type="file" multiple onChange={e => addFiles(e.target.files)} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                        <div className="w-full h-12 rounded-[1rem] bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center gap-3 group-hover:bg-indigo-700 transition-all uppercase tracking-[0.15em] shadow-lg shadow-indigo-600/20">
                                            <FileUp className="w-4 h-4" /> Add PDF / Image
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <input ref={linkInputRef} placeholder="Paste link..." className="flex-1 h-12 px-4 rounded-[1rem] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] text-xs font-bold outline-none ring-offset-transparent focus:ring-2 focus:ring-indigo-500/50 transition-all" onKeyDown={e => e.key === 'Enter' && addLink()} />
                                        <button onClick={addLink} className="w-12 h-12 rounded-[1rem] bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 shadow-lg shadow-emerald-500/10 transition-all"><Plus className="w-5 h-5" /></button>
                                    </div>
                                    <Button onClick={handleSynthesize} disabled={loading || sources.length === 0} className="w-full h-14 rounded-[1.25rem] bg-indigo-600 font-black text-xs gap-3 shadow-2xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-current" />} BUILD KNOWLEDGE
                                    </Button>
                                    {synthesis && (
                                        <button onClick={() => { if (confirm("Clear current project?")) { localStorage.removeItem(STORAGE_KEY); window.location.reload(); } }} className="w-full text-[9px] font-black text-slate-400 hover:text-red-500 transition-colors uppercase tracking-[0.2em] py-2">
                                            ↻ New Research Project
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* MAIN CONTENT AREA */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#08080A] relative">

                    {/* DEBUG PANEL (Requested) */}
                    <AnimatePresence>
                        {debugOpen && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 260 }} exit={{ height: 0 }} className="absolute inset-x-0 bottom-0 bg-black/90 text-emerald-400 font-mono text-[10px] p-4 overflow-y-auto z-30 border-t border-white/10 backdrop-blur-xl">
                                <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                                    <span className="font-bold flex items-center gap-2 text-white"><Bug className="w-3 h-3 text-red-500" /> SYSTEM DEBUG CONSOLE</span>
                                    <button onClick={() => setDebugOpen(false)} className="text-white/50 hover:text-white"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="space-y-1">
                                    {logs.map((L, i) => (
                                        <div key={i} className={`flex gap-3 ${L.type === 'error' ? 'text-red-400' : L.type === 'success' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                            <span className="opacity-40 shrink-0">[{L.t}]</span>
                                            <span className={`shrink-0 font-bold ${L.type === 'error' ? 'text-red-500' : L.type === 'success' ? 'text-emerald-500' : 'text-indigo-400'}`}>{L.type.toUpperCase()}:</span>
                                            <span className="break-all">{L.m}</span>
                                        </div>
                                    ))}
                                    {logs.length === 0 && <div className="opacity-30 italic px-2">No system logs collected yet...</div>}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* PHASE: LIBRARY */}
                    {phase === 'library' && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center gap-8 relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 rounded-[2.5rem] bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08] flex items-center justify-center text-indigo-500 shadow-2xl relative">
                                {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : <Library className="w-10 h-10" />}
                                {sources.length > 0 && <span className="absolute -top-2 -right-2 bg-emerald-500 text-white px-3 py-1 rounded-full text-[10px] font-black shadow-lg animate-pulse">{sources.length} READY</span>}
                            </motion.div>

                            <div className="max-w-md relative">
                                <h1 className="text-3xl font-black uppercase tracking-tight mb-3 leading-tight">
                                    {loading ? "Constructing Model..." : synthesis ? "Knowledge Base Synced" : sources.length > 0 ? "Sources Grounded" : "Universal Scientist"}
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed px-4">
                                    {loading
                                        ? `Our AI is reading your materials and building a specialized educational foundation. This will take ~20-60 seconds.`
                                        : synthesis
                                            ? "Analysis complete. You can now chat with your data, generate specific teaching outputs, or build a presentation."
                                            : sources.length > 0
                                                ? `Your ${sources.length} materials are staged. Click below to begin the deep-intelligence analysis.`
                                                : "Ground your AI with custom files and links to create a research-accurate classroom environment."}
                                </p>
                            </div>

                            <div className="flex gap-4 relative z-10 scale-110">
                                {synthesis ? (
                                    <Button onClick={() => setPhase('research')} size="lg" className="rounded-[1.25rem] bg-indigo-600 font-black px-12 h-14 gap-3 shadow-2xl shadow-indigo-600/40 hover:scale-105 active:scale-95 transition-all">
                                        GO TO HUB <ArrowRight className="w-4 h-4" />
                                    </Button>
                                ) : sources.length > 0 ? (
                                    <Button onClick={handleSynthesize} disabled={loading} size="lg" className="rounded-[1.25rem] bg-indigo-600 font-black px-12 h-14 gap-3 shadow-2xl shadow-indigo-600/40 hover:scale-105 active:animate-none group transition-all">
                                        {loading ? "SYNTHESIZING..." : <>BUILD KNOWLEDGE <Zap className="w-4 h-4 fill-current group-hover:animate-pulse" /></>}
                                    </Button>
                                ) : (
                                    <Button onClick={() => setSidebarOpen(true)} variant="outline" className="rounded-[1.25rem] border-2 border-dashed border-slate-300 dark:border-white/[0.1] px-10 h-14 font-black text-xs tracking-[0.1em] hover:bg-slate-100 dark:hover:bg-white/[0.03] transition-all">
                                        ADD YOUR MATERIALS
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* PHASE: RESEARCH HUB */}
                    {phase === 'research' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="h-16 border-b border-slate-200 dark:border-white/[0.05] bg-white/50 dark:bg-[#0D0D0F]/50 backdrop-blur-2xl flex items-center gap-3 px-6 shrink-0 overflow-x-auto relative z-10">
                                <div className="flex items-center bg-slate-100 dark:bg-white/[0.04] rounded-xl p-1 shrink-0">
                                    <button onClick={() => setResearchEditMode(false)} className={`h-7 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!researchEditMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>Chat</button>
                                    <button onClick={() => { setResearchEditMode(true); setEditSynthesis(synthesis); }} className={`h-7 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${researchEditMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400'}`}>Edit Source</button>
                                </div>
                                {!researchEditMode && <div className="flex gap-2">
                                    {['Teaching Briefing', 'FAQ List', 'Chronology'].map(t => (
                                        <button key={t} onClick={() => handleTransform(t)} disabled={!synthesis || loading} className="h-9 px-5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500/10 hover:border-indigo-500/20 hover:text-indigo-500 transition-all disabled:opacity-20">{t}</button>
                                    ))}
                                </div>}
                                {researchEditMode
                                    ? <Button onClick={() => { setSynthesis(editSynthesis); setResearchEditMode(false); persistSnapshot({ synthesis: editSynthesis, chatHistory, slides, notes, persona, sources, phase }); toast.success("Source updated!"); }} size="sm" className="ml-auto h-9 rounded-xl bg-emerald-600 font-black text-[10px] px-6 tracking-widest shadow-lg">SAVE CHANGES</Button>
                                    : <Button onClick={handleBuildSlides} disabled={!synthesis || loading} size="sm" className="ml-auto h-9 rounded-xl bg-indigo-600 font-black text-[10px] px-6 tracking-widest shadow-lg shadow-indigo-600/20">CREATE PRESENTATION</Button>
                                }
                            </div>

                            {researchEditMode ? (
                                <div className="flex-1 flex flex-col p-8 overflow-hidden">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center"><FileText className="w-3.5 h-3.5 text-amber-500" /></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Research Source Editor — edit text below to refine AI grounding</span>
                                    </div>
                                    <textarea
                                        value={editSynthesis}
                                        onChange={e => setEditSynthesis(e.target.value)}
                                        className="flex-1 w-full bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.08] rounded-[1.5rem] p-6 text-sm leading-[1.8] font-medium text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all custom-scrollbar"
                                        placeholder="Your research synthesis will appear here for editing..."
                                        spellCheck={false}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 px-1">{editSynthesis.length.toLocaleString()} characters · Press "Save Changes" to update AI grounding</p>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 dark:bg-transparent">
                                        {!synthesis ? (
                                            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-5 max-w-sm mx-auto opacity-50">
                                                <AlertCircle className="w-14 h-14" />
                                                <div className="space-y-1">
                                                    <p className="font-black text-sm uppercase tracking-widest">Knowledge Base Locked</p>
                                                    <p className="text-xs font-medium">Please build your research library before accessing the intelligence hub.</p>
                                                </div>
                                                <Button onClick={() => setPhase('library')} size="sm" variant="outline" className="rounded-xl border-dashed px-8 font-black text-[10px]">BACK TO LIBRARY</Button>
                                            </div>
                                        ) : (
                                            <>
                                                {chatHistory.map((m, i) => (
                                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} key={i} className={`flex gap-5 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 text-[10px] font-black shadow-lg ${m.role === 'user' ? 'bg-slate-200 dark:bg-white/10' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-indigo-500/20'}`}>
                                                            {m.role === 'user' ? 'YOU' : <Sparkles className="w-4 h-4" />}
                                                        </div>
                                                        <div className={`max-w-[80%] p-5 rounded-[1.75rem] text-sm leading-[1.6] whitespace-pre-wrap shadow-sm border ${m.role === 'user' ? 'bg-indigo-600 text-white border-none' : 'bg-white dark:bg-[#0F0F12] border-slate-200 dark:border-white/[0.08] text-slate-800 dark:text-slate-200'}`}>
                                                            {m.content}
                                                            {m.role === 'ai' && (
                                                                <div className="flex gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                                                                    <button onClick={() => saveNote(m.content)} className="flex items-center gap-2 text-[10px] font-black text-indigo-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"><StickyNote className="w-3.5 h-3.5" /> SNAP TO NOTES</button>
                                                                    <button onClick={() => { navigator.clipboard.writeText(m.content); toast.success("Copied!"); }} className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"><Copy className="w-3.5 h-3.5" /> COPY RAW</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                                {isChatting && (
                                                    <div className="flex gap-5">
                                                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20"><Loader2 className="w-5 h-5 text-white animate-spin" /></div>
                                                        <div className="p-5 rounded-[1.75rem] bg-white dark:bg-[#0F0F12] border border-slate-200 dark:border-white/[0.08] min-w-[120px] flex items-center gap-3">
                                                            <span className="flex gap-1.5"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" /><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" /><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" /></span>
                                                            <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Consulting Sources...</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <div ref={chatEndRef} />
                                            </>
                                        )}
                                    </div>
                                    <div className="p-8 border-t border-slate-200 dark:border-white/[0.05] bg-white/80 dark:bg-[#0D0D0F]/80 backdrop-blur-2xl">
                                        <div className="max-w-4xl mx-auto relative group">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[1.5rem] opacity-0 group-focus-within:opacity-20 transition-all blur-md" />
                                            <div className="relative flex gap-3 items-end p-2 rounded-[1.5rem] bg-slate-100/50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.08]">
                                                <Textarea value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleChat())}
                                                    placeholder={synthesis ? "Ask your research library anything..." : "Awaiting analysis..."}
                                                    disabled={!synthesis || isChatting}
                                                    className="flex-1 min-h-[56px] max-h-[250px] bg-transparent border-none text-sm font-semibold focus-visible:ring-0 placeholder:text-slate-400 dark:placeholder:text-slate-600 px-4 py-3" />
                                                <Button onClick={handleChat} disabled={!query.trim() || !synthesis || isChatting} className="h-12 w-12 rounded-2xl bg-indigo-600 shrink-0 shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all"><Send className="w-5 h-5" /></Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PHASE: SLIDES */}
                    {phase === 'slides' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {slides.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-5 opacity-40">
                                    <LayoutGrid className="w-16 h-16" />
                                    <p className="font-black text-xs uppercase tracking-widest">Slide Engine Idle</p>
                                    <Button onClick={() => setPhase('research')} size="sm" variant="outline" className="rounded-xl border-dashed">Open Hub to Generate</Button>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col">
                                    <div className="flex-1 flex items-center justify-center p-12 bg-slate-200 dark:bg-black/60 relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 pointer-events-none" />
                                        <motion.div key={activeSlide} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="w-full max-w-5xl aspect-video bg-[#050508] rounded-[3.5rem] border border-white/[0.08] shadow-[0_64px_128px_-32px_rgba(0,0,0,0.6)] overflow-hidden relative ring-1 ring-white/10">
                                            {(() => {
                                                const slide = slides[activeSlide] || {};
                                                const layout: string = safeStr(slide.layout) || 'STUDIO_CENTER';
                                                const emoji = safeStr(slide.emoji);
                                                const title = safeStr(slide.title);
                                                const points: string[] = Array.isArray(slide.points) ? slide.points.map((x: any) => safeStr(x)) : [];
                                                const items: any[] = Array.isArray(slide.items) ? slide.items : [];
                                                const steps: any[] = Array.isArray(slide.process_steps) ? slide.process_steps : [];
                                                const branches: any[] = Array.isArray(slide.branches) ? slide.branches : [];
                                                const centerNode = safeStr(slide.center_node || slide.title);
                                                const visual = (slide.visual && typeof slide.visual === 'object') ? slide.visual : { label: '', elements: [] };
                                                const keyStat = (slide.key_stat && typeof slide.key_stat === 'object') ? slide.key_stat : null;
                                                const branchColors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#f97316'];

                                                if (layout === 'STUDIO_MINDMAP') return (
                                                    <div className="flex flex-col h-full p-8">
                                                        <div className="flex items-center gap-3 mb-3"><span className="text-2xl">{emoji}</span><h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8FF41] to-[#BAFF4A] uppercase tracking-tighter">{title}</h2></div>
                                                        <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                                                            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-[10px] text-center p-2 shadow-[0_0_40px_rgba(99,102,241,0.5)] absolute z-20">{centerNode}</div>
                                                            {branches.slice(0, 6).map((branch: any, bi: number) => {
                                                                const angle = (360 / Math.max(branches.length, 1)) * bi - 90;
                                                                const rad = angle * (Math.PI / 180);
                                                                const bx = Math.cos(rad) * 155;
                                                                const by = Math.sin(rad) * 105;
                                                                const color = branchColors[bi % branchColors.length];
                                                                const kids: string[] = Array.isArray(branch.children) ? branch.children.map((c: any) => safeStr(c)) : [];
                                                                return (
                                                                    <div key={bi} className="absolute flex flex-col items-center gap-1.5" style={{ left: `calc(50% + ${bx}px)`, top: `calc(50% + ${by}px)`, transform: 'translate(-50%,-50%)' }}>
                                                                        <div className="px-3 py-1 rounded-xl text-[9px] font-black text-white whitespace-nowrap shadow-lg" style={{ backgroundColor: color }}>{safeStr(branch.label)}</div>
                                                                        <div className="flex flex-wrap gap-1 justify-center max-w-[140px]">
                                                                            {kids.slice(0, 3).map((c, ci) => <span key={ci} className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 font-bold whitespace-nowrap">{c}</span>)}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );

                                                if (layout === 'STUDIO_SPLIT') {
                                                    const elems: string[] = Array.isArray(visual.elements) ? visual.elements.map((e: any) => safeStr(e)) : [];
                                                    return (
                                                        <div className="flex h-full">
                                                            <div className="flex-1 flex flex-col justify-center p-10 gap-5">
                                                                <div className="flex items-center gap-3"><span className="text-3xl">{emoji}</span><h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8FF41] to-[#BAFF4A] uppercase tracking-tighter">{title}</h2></div>
                                                                <ul className="space-y-3">{points.map((p, pi) => <li key={pi} className="flex gap-3 items-start"><div className="w-1.5 h-1.5 rounded bg-indigo-500 mt-2 shrink-0" /><p className="text-white/80 text-sm font-medium leading-relaxed">{p}</p></li>)}</ul>
                                                            </div>
                                                            <div className="w-[36%] bg-white/[0.03] border-l border-white/[0.06] flex flex-col items-center justify-center gap-3 p-6">
                                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{safeStr(visual.label) || 'DIAGRAM'}</p>
                                                                <div className="w-full grid grid-cols-2 gap-2">{elems.map((el, ei) => <div key={ei} className="bg-indigo-600/20 rounded-xl px-3 py-2.5 text-[10px] font-bold text-indigo-200 text-center border border-indigo-500/20">{el}</div>)}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (layout === 'STUDIO_GRID') return (
                                                    <div className="flex flex-col h-full p-8 gap-4">
                                                        <div className="flex items-center gap-3"><span className="text-3xl">{emoji}</span><h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8FF41] to-[#BAFF4A] uppercase tracking-tighter">{title}</h2></div>
                                                        <div className="flex-1 grid grid-cols-3 gap-3">{items.map((item: any, ii: number) => <motion.div key={ii} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: ii * 0.1 }} className="bg-white/[0.04] rounded-2xl border border-white/[0.08] p-4 flex flex-col gap-2"><span className="text-2xl">{safeStr(item.emoji)}</span><p className="text-[10px] font-black text-white uppercase tracking-wide">{safeStr(item.title)}</p><p className="text-[10px] text-white/60 font-medium leading-relaxed">{safeStr(item.description)}</p></motion.div>)}</div>
                                                    </div>
                                                );

                                                if (layout === 'STUDIO_TIMELINE') return (
                                                    <div className="flex flex-col h-full p-8 gap-4">
                                                        <div className="flex items-center gap-3"><span className="text-3xl">{emoji}</span><h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8FF41] to-[#BAFF4A] uppercase tracking-tighter">{title}</h2></div>
                                                        <div className="flex-1 flex items-center relative">
                                                            <div className="absolute top-5 left-0 right-0 h-0.5 bg-indigo-500/20" />
                                                            <div className="w-full flex">{steps.map((s: any, si: number) => <motion.div key={si} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: si * 0.12 }} className="flex-1 flex flex-col items-center gap-2 relative"><div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm z-10 shadow-[0_0_20px_rgba(99,102,241,0.4)]">{safeStr(s.step || si + 1)}</div><div className="text-center px-1"><p className="text-[9px] font-black text-[#E8FF41] uppercase tracking-wider">{safeStr(s.label)}</p><p className="text-[9px] text-white/55 mt-1 leading-relaxed">{safeStr(s.description)}</p></div></motion.div>)}</div>
                                                        </div>
                                                    </div>
                                                );

                                                // STUDIO_CENTER (default)
                                                return (
                                                    <div className="flex flex-col justify-center h-full p-14 gap-6">
                                                        <div className="flex items-center gap-4"><span className="text-4xl">{emoji}</span><h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#E8FF41] to-[#BAFF4A] uppercase tracking-tighter leading-tight max-w-[85%]">{title}</h2></div>
                                                        {keyStat && <div className="flex items-baseline gap-3"><span className="text-6xl font-black text-white">{safeStr(keyStat.value)}</span><span className="text-sm font-bold text-white/40 uppercase tracking-wider">{safeStr(keyStat.label)}</span></div>}
                                                        <ul className="space-y-4">{points.map((p, pi) => <motion.li key={pi} initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: pi * 0.1 }} className="flex gap-6 items-start"><div className="w-2 h-2 rounded-lg bg-indigo-500 mt-2.5 shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.8)]" /><p className="text-white/80 text-lg font-medium tracking-tight leading-relaxed">{p}</p></motion.li>)}</ul>
                                                    </div>
                                                );
                                            })()}
                                            <div className="absolute top-6 left-10 text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] opacity-30">{schoolName} // {persona}</div>
                                            <div className="absolute bottom-6 right-10 text-[9px] font-black text-white/15 tracking-[0.25em]">{activeSlide + 1} OF {slides.length}</div>
                                        </motion.div>
                                    </div>

                                    <div className="h-24 border-t border-slate-200 dark:border-white/[0.05] bg-white dark:bg-[#0D0D0F] flex items-center px-10 gap-10 shrink-0 relative z-10 shadow-up-xl">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} disabled={activeSlide === 0} className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-white/[0.1] flex items-center justify-center disabled:opacity-20 hover:bg-slate-50 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                                            <div className="flex gap-2.5 px-4 h-6 items-center">
                                                {slides.map((_, i) => <button key={i} onClick={() => setActiveSlide(i)} className={`h-2 transition-all duration-500 rounded-full ${i === activeSlide ? 'w-10 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-400'}`} />)}
                                            </div>
                                            <button onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} disabled={activeSlide === slides.length - 1} className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-white/[0.1] flex items-center justify-center disabled:opacity-20 hover:bg-slate-50 transition-all"><ChevronRight className="w-6 h-6" /></button>
                                        </div>

                                        <div className="ml-auto flex items-center gap-4">
                                            <Button onClick={downloadPDF} variant="outline" className="h-12 rounded-2xl text-[10px] font-black border-2 tracking-[0.2em] px-10 hover:bg-slate-50 transition-all"><Download className="w-4 h-4 mr-3" /> EXPORT PDF</Button>
                                            <div className="h-12 w-px bg-slate-200 dark:bg-white/10 mx-2" />
                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger className="w-52 h-12 rounded-[1.25rem] text-[10px] font-black tracking-widest border-2 shadow-sm"><SelectValue placeholder="SELECT TARGET CLASS" /></SelectTrigger>
                                                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name.toUpperCase()}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Button onClick={handleShare} disabled={isSharing || !selectedClass} className="h-12 px-12 rounded-[1.25rem] bg-indigo-600 font-black text-[10px] tracking-[0.2em] shadow-xl shadow-indigo-600/30 hover:scale-[1.03] transition-all">
                                                {isSharing ? <Loader2 className="w-5 h-5 animate-spin" /> : "PUBLISH DECK"}
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
                        <motion.aside initial={{ width: 0 }} animate={{ width: 340 }} exit={{ width: 0 }} className="border-l border-slate-200 dark:border-white/[0.05] bg-white dark:bg-[#0D0D0F] overflow-hidden flex flex-col z-20 shadow-[-32px_0_64px_-16px_rgba(0,0,0,0.1)]">
                            <div className="w-[340px] p-8 h-full flex flex-col gap-8">
                                <div className="flex items-center justify-between px-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><StickyNote className="w-4 h-4 text-amber-500" /></div>
                                        <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.25em]">Notes Panel</span>
                                    </div>
                                    <button onClick={() => setNotesOpen(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-all"><X className="w-4 h-4 opacity-40" /></button>
                                </div>
                                <div className="flex-1 overflow-y-auto space-y-5 pr-2 custom-scrollbar">
                                    {notes.map(n => (
                                        <div key={n.id} className="p-6 rounded-[1.75rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/[0.05] group relative shadow-sm hover:shadow-md transition-all">
                                            <p className="text-xs leading-[1.7] text-slate-600 dark:text-slate-400 font-medium line-clamp-[12]">{n.content}</p>
                                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90">
                                                <button onClick={() => { navigator.clipboard.writeText(n.content); toast.success("Copied!"); }} className="bg-white dark:bg-black p-2 rounded-xl shadow-xl border border-slate-100 dark:border-white/10 hover:text-indigo-500"><Copy className="w-4 h-4" /></button>
                                                <button onClick={() => setNotes(prev => prev.filter(x => x.id !== n.id))} className="bg-white dark:bg-black p-2 rounded-xl shadow-xl border border-slate-100 dark:border-white/10 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))}
                                    {notes.length === 0 && (
                                        <div className="text-center py-24 opacity-20 select-none">
                                            <div className="w-20 h-20 bg-slate-100 dark:bg-white/[0.05] rounded-full flex items-center justify-center mx-auto mb-6"><StickyNote className="w-10 h-10" /></div>
                                            <p className="text-[10px] font-black tracking-[0.3em] uppercase">No Saved Items</p>
                                        </div>
                                    )}
                                </div>
                                <Button onClick={downloadPDF} disabled={!slides.length} variant="outline" className="w-full rounded-2xl h-12 gap-3 text-[10px] font-black tracking-widest uppercase border-2 shadow-sm"><Download className="w-4 h-4" /> EXPORT AS PDF</Button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div >

            {/* FULL SCREEN INITIALIZATION OVERLAY */}
            <AnimatePresence>
                {
                    loading && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-white/95 dark:bg-[#08080A]/95 backdrop-blur-2xl z-[1000] flex flex-col items-center justify-center p-12 gap-10">
                            <div className="relative">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }} className="w-20 h-20 rounded-full border-t-[3px] border-indigo-600 border-slate-200 dark:border-white/[0.08]" />
                                <Sparkles className="w-8 h-8 text-indigo-600 absolute inset-0 m-auto animate-pulse" />
                                <motion.div initial={{ scale: 0.8 }} animate={{ scale: [0.8, 1.2, 0.8] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -inset-8 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
                            </div>
                            <div className="text-center space-y-3">
                                <motion.h3 animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-2xl font-black uppercase tracking-tight">{loadingMsg}</motion.h3>
                                <p className="text-[11px] font-black text-slate-400 tracking-[0.4em] uppercase">Deep Intelligence Bridge Active</p>
                                <div className="max-w-xs mx-auto pt-4 flex gap-1 justify-center">
                                    {[0, 1, 2, 3, 4].map(i => <motion.div key={i} animate={{ backgroundColor: ['rgba(99,102,241,0.2)', 'rgba(99,102,241,1)', 'rgba(99,102,241,0.2)'] }} transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }} className="w-8 h-1 rounded-full" />)}
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
}
