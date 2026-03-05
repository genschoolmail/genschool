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
import pptxgen from "pptxgenjs";
import { motion, AnimatePresence } from 'framer-motion';

type Source = { id: string; type: 'file' | 'link'; name: string; url?: string; file?: File; };
type ChatMsg = { role: 'user' | 'ai'; content: string; };
type Note = { id: string; content: string; };
type Phase = 'library' | 'research' | 'slides';

const STORAGE_KEY = 'ai_studio_v9';

const BASE_THEME = {

    name: 'Quantum Core',
    bg: 'bg-[#0D0D0F]',
    slideBg: 'bg-[#121216]',
    text: 'text-white',
    primary: '#6366f1',
    accent: '#E8FF41',
    secondary: '#BAFF4A',
    card: 'bg-white/[0.04]',
    border: 'border-white/[0.08]',
    hexBg: '#121216',
    hexText: '#FFFFFF'
};


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
    const [designMode, setDesignMode] = useState<'default' | 'custom'>('default');
    const [customDesign, setCustomDesign] = useState("");
    const theme = BASE_THEME;


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
        phase: Phase;
        designMode?: 'default' | 'custom';
        customDesign?: string;
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
                if (d.designMode) setDesignMode(d.designMode);
                if (d.customDesign) setCustomDesign(d.customDesign);
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
                body: JSON.stringify({
                    summary: synthesis,
                    language,
                    teacherName,
                    schoolName,
                    persona,
                    designStyle: designMode === 'custom' && customDesign.trim() ? customDesign.trim() : 'Professional, grounded, and structurally rigorous'
                })
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
        const hexToRgb = (hex: string) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return [r, g, b];
        };

        const [br, bg, bb] = hexToRgb(theme.hexBg);
        const [tr, tg, tb] = hexToRgb(theme.hexText);
        const [pr, pg, pb] = hexToRgb(theme.primary);
        const [ar, ag, ab] = hexToRgb(theme.accent);

        slides.forEach((slide, i) => {
            if (i > 0) doc.addPage();
            doc.setFillColor(br, bg, bb).rect(0, 0, W, H, 'F');

            const layout = safeStr(slide.layout) || 'STUDIO_CENTER';
            const title = safeStr(slide.title).toUpperCase();
            const emoji = safeStr(slide.emoji);

            // Header/Title for all slides
            doc.setTextColor(ar, ag, ab).setFontSize(22).setFont('helvetica', 'bold');
            doc.text(`${emoji} ${title}`, 20, 20);

            if (layout === 'STUDIO_MINDMAP') {
                const center = safeStr(slide.center_node || slide.title);
                const branches = Array.isArray(slide.branches) ? slide.branches : [];
                doc.setDrawColor(pr, pg, pb).setLineWidth(0.5);
                doc.setFillColor(pr, pg, pb).circle(W / 2, H / 2, 15, 'F');
                doc.setTextColor(255).setFontSize(10).text(doc.splitTextToSize(center, 25), W / 2, H / 2 + 2, { align: 'center' });

                branches.slice(0, 6).forEach((b: any, bi: number) => {
                    const angle = (360 / Math.max(branches.length, 1)) * bi - 90;
                    const rad = angle * (Math.PI / 180);
                    const bx = W / 2 + Math.cos(rad) * 60;
                    const by = H / 2 + Math.sin(rad) * 45;
                    doc.line(W / 2, H / 2, bx, by);
                    doc.setFillColor(255, 255, 255, 0.1).rect(bx - 20, by - 5, 40, 10, 'F');
                    doc.setTextColor(ar, ag, ab).setFontSize(8).text(safeStr(b.label), bx, by + 1, { align: 'center' });
                });
            } else if (layout === 'STUDIO_GRAPH') {
                const labels = Array.isArray(slide.labels) ? slide.labels : [];
                const values = Array.isArray(slide.values) ? slide.values.map(Number) : [];
                const chartType = safeStr(slide.chart_type);
                if (chartType === 'pie') {
                    doc.setDrawColor(tr, tg, tb, 0.2).circle(W / 2, H / 2 + 10, 30, 'S');
                    doc.setTextColor(tr, tg, tb).setFontSize(12).text("PIE CHART DATA", W / 2, H / 2 + 12, { align: 'center' });
                } else {
                    const max = Math.max(...values, 1);
                    values.forEach((v: number, vi: number) => {
                        const bw = 20;
                        const bh = (v / max) * 50;
                        const bx = 40 + vi * 30;
                        doc.setFillColor(pr, pg, pb).rect(bx, H - 40 - bh, bw, bh, 'F');
                        doc.setTextColor(tr, tg, tb).setFontSize(7).text(labels[vi] || "", bx + 10, H - 35, { align: 'center', angle: 45 });
                    });
                }
            } else if (layout === 'STUDIO_GRID') {
                const items = Array.isArray(slide.items) ? slide.items : [];
                items.slice(0, 3).forEach((item: any, ii: number) => {
                    const ix = 20 + ii * 85;
                    doc.setFillColor(255, 255, 255, 0.05).rect(ix, 40, 80, 100, 'F');
                    doc.setTextColor(tr, tg, tb).setFontSize(10).text(safeStr(item.emoji), ix + 5, 50);
                    doc.setFontSize(12).text(safeStr(item.title).toUpperCase(), ix + 5, 60);
                    doc.setFontSize(9).setTextColor(tr, tg, tb, 0.7).text(doc.splitTextToSize(safeStr(item.description), 70), ix + 5, 70);
                });
            } else if (layout === 'STUDIO_TIMELINE') {
                const steps = Array.isArray(slide.process_steps) ? slide.process_steps : [];
                doc.setDrawColor(pr, pg, pb).line(20, 70, W - 20, 70);
                steps.slice(0, 4).forEach((s: any, si: number) => {
                    const x = 40 + si * 60;
                    doc.setFillColor(pr, pg, pb).circle(x, 70, 5, 'F');
                    doc.setTextColor(ar, ag, ab).setFontSize(9).text(safeStr(s.label), x, 60, { align: 'center' });
                    doc.setTextColor(tr, tg, tb, 0.7).setFontSize(7).text(doc.splitTextToSize(safeStr(s.description), 50), x, 80, { align: 'center' });
                });
            } else if (layout === 'STUDIO_SPLIT') {
                const points = Array.isArray(slide.points) ? slide.points : [];
                doc.setTextColor(tr, tg, tb).setFontSize(12);
                points.forEach((p: string, pi: number) => {
                    doc.text(`• ${safeStr(p)}`, 20, 50 + pi * 10);
                });
                doc.setFillColor(255, 255, 255, 0.05).rect(W - 100, 40, 80, 100, 'F');
                doc.setTextColor(pr, pg, pb).setFontSize(10).text("VISUAL ASSET", W - 60, 90, { align: 'center' });
            } else if (layout === 'STUDIO_DIAGRAM') {
                const nodes = Array.isArray(slide.nodes) ? slide.nodes : [];
                nodes.forEach((node: string, ni: number) => {
                    const nx = 40 + (ni % 3) * 60;
                    const ny = 60 + Math.floor(ni / 3) * 30;
                    doc.setDrawColor(pr, pg, pb).setFillColor(pr, pg, pb, 0.1).roundedRect(nx - 25, ny - 10, 50, 20, 3, 3, 'FD');
                    doc.setTextColor(tr, tg, tb).setFontSize(8).text(doc.splitTextToSize(safeStr(node), 40), nx, ny + 1, { align: 'center' });
                    if (ni < nodes.length - 1 && (ni + 1) % 3 !== 0) {
                        doc.setDrawColor(pr, pg, pb).setLineWidth(0.2).line(nx + 25, ny, nx + 35, ny);
                    }
                });
            } else {
                // STUDIO_CENTER
                const keyStat = slide.key_stat || {};
                doc.setTextColor(tr, tg, tb).setFontSize(48).text(safeStr(keyStat.value || ""), W / 2, H / 2, { align: 'center' });
                doc.setTextColor(tr, tg, tb, 0.5).setFontSize(16).text(safeStr(keyStat.label || "").toUpperCase(), W / 2, H / 2 + 15, { align: 'center' });
                const points = Array.isArray(slide.points) ? slide.points : [];
                doc.setTextColor(tr, tg, tb, 0.8).setFontSize(12);
                points.slice(0, 3).forEach((p: string, pi: number) => doc.text(`• ${safeStr(p)}`, W / 2, H / 2 + 35 + pi * 10, { align: 'center' }));
            }

            // Footer
            doc.setFontSize(8).setTextColor(tr, tg, tb, 0.3).text(`${schoolName.toUpperCase()} // ${teacherName.toUpperCase()}`, 20, H - 10);
            doc.text(`PAGE ${i + 1} OF ${slides.length}`, W - 20, H - 10, { align: 'right' });
        });

        doc.save(`${schoolName.replace(/\s/g, '_')}_Presentation.pdf`);
    };

    const downloadPPTX = () => {
        if (!slides.length) return;
        const pres = new pptxgen();
        pres.layout = 'LAYOUT_16x9';

        slides.forEach((slide) => {
            const pptSlide = pres.addSlide();
            pptSlide.background = { fill: theme.hexBg };

            const layout = safeStr(slide.layout) || 'STUDIO_CENTER';
            const title = safeStr(slide.title);
            const emoji = safeStr(slide.emoji);
            const tColor = theme.accent.replace('#', '');
            const pColor = theme.primary.replace('#', '');
            const txtColor = theme.hexText.replace('#', '');

            // Title for all slides
            pptSlide.addText(`${emoji} ${title}`, {
                x: 0.5, y: 0.5, w: '90%', h: 0.8,
                fontSize: 28, bold: true, color: tColor
            });

            if (layout === 'STUDIO_MINDMAP') {
                const centerNode = safeStr(slide.center_node || slide.title);
                pptSlide.addShape(pres.ShapeType.ellipse, { x: 4.5, y: 2.2, w: 2, h: 2, fill: { color: pColor } });
                pptSlide.addText(centerNode, { x: 4.5, y: 2.2, w: 2, h: 2, fontSize: 14, color: 'FFFFFF', align: 'center', valign: 'middle' });
                const branches = Array.isArray(slide.branches) ? slide.branches : [];
                branches.slice(0, 6).forEach((n: any, idx: number) => {
                    const angle = (360 / Math.max(branches.length, 1)) * idx - 90;
                    const rad = angle * (Math.PI / 180);
                    const nx = 5.5 + Math.cos(rad) * 2;
                    const ny = 3.2 + Math.sin(rad) * 1.5;
                    pptSlide.addShape(pres.ShapeType.rect, { x: nx - 0.5, y: ny - 0.25, w: 1, h: 0.5, fill: { color: pColor, alpha: 80 } });
                    pptSlide.addText(n.label, { x: nx - 0.5, y: ny - 0.25, w: 1, h: 0.5, fontSize: 8, color: 'FFFFFF', align: 'center', valign: 'middle' });
                });
            } else if (layout === 'STUDIO_GRAPH') {
                const vals = Array.isArray(slide.values) ? slide.values.map(Number) : [];
                const lbls = Array.isArray(slide.labels) ? slide.labels.map(String) : [];
                const type = safeStr(slide.chart_type) === 'pie' ? pres.ChartType.pie : pres.ChartType.bar;
                pptSlide.addChart(type, [{ name: 'Data', labels: lbls, values: vals }], { x: 1, y: 1.5, w: 8, h: 3.5 });
            } else if (layout === 'STUDIO_GRID') {
                const items = Array.isArray(slide.items) ? slide.items : [];
                items.slice(0, 3).forEach((item: any, idx: number) => {
                    const xPos = 0.5 + idx * 3.2;
                    pptSlide.addShape(pres.ShapeType.rect, { x: xPos, y: 1.8, w: 3, h: 3, fill: { color: pColor, alpha: 90 } });
                    pptSlide.addText(`${safeStr(item.emoji)}\n${safeStr(item.title)}\n${safeStr(item.description)}`, {
                        x: xPos, y: 1.8, w: 3, h: 3, fontSize: 12, color: txtColor, align: 'center', valign: 'middle'
                    });
                });
            } else if (layout === 'STUDIO_TIMELINE') {
                const steps = Array.isArray(slide.process_steps) ? slide.process_steps : [];
                steps.slice(0, 4).forEach((s: any, idx: number) => {
                    const xPos = 0.5 + idx * 2.3;
                    pptSlide.addShape(pres.ShapeType.ellipse, { x: xPos, y: 2.5, w: 1, h: 1, fill: { color: pColor } });
                    pptSlide.addText(safeStr(s.label), { x: xPos, y: 2, w: 1.5, h: 0.5, fontSize: 12, color: tColor, align: 'center' });
                    pptSlide.addText(safeStr(s.description), { x: xPos, y: 3.6, w: 1.5, h: 1, fontSize: 9, color: txtColor, opacity: 70, align: 'center' });
                });
            } else if (layout === 'STUDIO_DIAGRAM') {
                const nodes = Array.isArray(slide.nodes) ? slide.nodes : [];
                nodes.slice(0, 6).forEach((node: string, idx: number) => {
                    const xPos = 1 + (idx % 3) * 3;
                    const yPos = 1.8 + Math.floor(idx / 3) * 1.5;
                    pptSlide.addShape(pres.ShapeType.roundRect, { x: xPos, y: yPos, w: 2.5, h: 1, fill: { color: pColor, alpha: 85 } });
                    pptSlide.addText(safeStr(node), { x: xPos, y: yPos, w: 2.5, h: 1, fontSize: 11, color: 'FFFFFF', align: 'center', valign: 'middle' });
                });
            } else if (layout === 'STUDIO_SPLIT') {
                const points = Array.isArray(slide.points) ? slide.points : [];
                pptSlide.addText(points.map((p: string) => ({ text: `• ${safeStr(p)}`, options: { bullet: true } })), { x: 0.5, y: 1.8, w: 5, h: 3, fontSize: 18, color: txtColor });
                pptSlide.addShape(pres.ShapeType.rect, { x: 6, y: 1.8, w: 3.5, h: 3, fill: { color: pColor, alpha: 90 } });
                pptSlide.addText("VISUAL ELEMENT", { x: 6, y: 1.8, w: 3.5, h: 3, fontSize: 14, color: 'FFFFFF', align: 'center', valign: 'middle' });
            } else {
                // STUDIO_CENTER / Default
                const keyStat = slide.key_stat || {};
                if (keyStat.value) {
                    pptSlide.addText(safeStr(keyStat.value), { x: 0, y: 2.2, w: '100%', h: 1.5, fontSize: 72, bold: true, color: txtColor, align: 'center' });
                    pptSlide.addText(safeStr(keyStat.label), { x: 0, y: 3.5, w: '100%', h: 0.5, fontSize: 20, color: txtColor, opacity: 50, align: 'center' });
                } else {
                    const points = Array.isArray(slide.points) ? slide.points : [];
                    pptSlide.addText(points.map((p: string) => ({ text: `• ${safeStr(p)}`, options: { bullet: true } })), { x: 1, y: 1.8, w: 8, h: 3, fontSize: 22, color: txtColor });
                }
            }

            // Footer
            pptSlide.addText(`${schoolName} // ${teacherName} // PAGE ${slides.indexOf(slide) + 1}`, {
                x: 0.5, y: 5.2, w: 9, h: 0.3, fontSize: 9, color: '888888', align: 'center'
            });
        });

        pres.writeFile({ fileName: `${schoolName.replace(/\s/g, '_')}_Deck.pptx` });
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
                    ].map((tab: { id: string, label: string, icon: any }) => (
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
                                            {["Academic Deep Dive", "Classroom Storytelling", "Skeptical Analyst", "Quick Summary"].map((p: string) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
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
                                    {['Teaching Briefing', 'FAQ List', 'Chronology', 'Master Study Guide'].map(t => (
                                        <button key={t} onClick={() => handleTransform(t)} disabled={!synthesis || loading} className="h-9 px-5 rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-500/10 hover:border-indigo-500/20 hover:text-indigo-500 transition-all disabled:opacity-20">{t}</button>
                                    ))}
                                </div>}

                                {researchEditMode
                                    ? <Button onClick={() => { setSynthesis(editSynthesis); setResearchEditMode(false); persistSnapshot({ synthesis: editSynthesis, chatHistory, slides, notes, persona, sources, phase, designMode, customDesign } as any); toast.success("Source updated!"); }} size="sm" className="ml-auto h-9 rounded-xl bg-emerald-600 font-black text-[10px] px-6 tracking-widest shadow-lg">SAVE CHANGES</Button>
                                    : <div className="ml-auto flex items-center gap-3">
                                        <Select value={designMode} onValueChange={(v: any) => setDesignMode(v)}>
                                            <SelectTrigger className="h-9 w-40 rounded-xl border border-slate-200 dark:border-white/[0.08] bg-transparent text-[10px] font-black tracking-widest uppercase text-slate-400">
                                                <SelectValue placeholder="DESIGN" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="default">Default Pro</SelectItem>
                                                <SelectItem value="custom">Custom Style</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button onClick={handleBuildSlides} disabled={!synthesis || loading} size="sm" className="h-9 rounded-xl bg-indigo-600 font-black text-[10px] px-6 tracking-widest shadow-lg shadow-indigo-600/20">CREATE PRESENTATION</Button>
                                    </div>
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
                                                {designMode === 'custom' && !researchEditMode && (
                                                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl p-6 mb-6">
                                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3 block">Custom Presentation Briefing</Label>
                                                        <Textarea
                                                            value={customDesign}
                                                            onChange={e => setCustomDesign(e.target.value)}
                                                            placeholder="Example: Make this presentation highly enthusiastic, use lots of data analogies, and adopt an 'astronomy' theme for the visual text..."
                                                            className="w-full bg-black/20 border-white/10 text-xs leading-relaxed text-slate-200 resize-none h-24 rounded-xl focus:ring-indigo-500/50"
                                                        />
                                                    </motion.div>
                                                )}
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
                                    <div className={`flex-1 flex flex-col items-center justify-center p-8 ${theme.bg} relative overflow-hidden transition-colors duration-700`}>
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-black/5 pointer-events-none" />
                                        <motion.div key={activeSlide} initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
                                            className={`w-full max-w-5xl aspect-video ${theme.slideBg} rounded-xl border ${theme.border} shadow-2xl overflow-hidden relative transition-all duration-500`}>
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
                                                const chartType = safeStr(slide.chart_type) || 'bar';
                                                const labels: string[] = Array.isArray(slide.labels) ? slide.labels.map((x: any) => safeStr(x)) : [];
                                                const values: number[] = Array.isArray(slide.values) ? slide.values.map((x: any) => Number(x) || 0) : [];
                                                const nodes: string[] = Array.isArray(slide.nodes) ? slide.nodes.map((x: any) => safeStr(x)) : [];
                                                const edges: any[] = Array.isArray(slide.edges) ? slide.edges : [];
                                                const branchColors = [theme.primary, theme.accent, theme.secondary, '#ec4899', '#14b8a6', '#f97316'];

                                                if (layout === 'STUDIO_MINDMAP') return (
                                                    <div className={`flex flex-col h-full p-12 ${theme.slideBg}`}>
                                                        <div className="flex items-center gap-5 mb-6">
                                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-4xl shadow-inner">{emoji}</div>
                                                            <h2 className={`text-4xl font-black uppercase tracking-tight`} style={{ color: theme.accent }}>{title}</h2>
                                                        </div>
                                                        <div className="flex-1 relative flex items-center justify-center">
                                                            <div className="w-32 h-32 rounded-full flex items-center justify-center text-white font-black text-sm text-center p-4 shadow-[0_0_50px_rgba(0,0,0,0.3)] absolute z-20 transition-all duration-700 hover:scale-110" style={{ backgroundColor: theme.primary, boxShadow: `0 0 60px ${theme.primary}40` }}>{centerNode}</div>
                                                            {branches.slice(0, 6).map((branch: any, bi: number) => {
                                                                const angle = (360 / Math.max(branches.length, 1)) * bi - 90;
                                                                const rad = angle * (Math.PI / 180);
                                                                const bx = Math.cos(rad) * 190;
                                                                const by = Math.sin(rad) * 130;
                                                                const color = branchColors[bi % branchColors.length];
                                                                const kids: string[] = Array.isArray(branch.children) ? branch.children.map((c: any) => safeStr(c)) : [];
                                                                return (
                                                                    <div key={bi} className="absolute flex flex-col items-center gap-2 group" style={{ left: `calc(50% + ${bx}px)`, top: `calc(50% + ${by}px)`, transform: 'translate(-50%,-50%)' }}>
                                                                        <div className="px-5 py-2 rounded-2xl text-[10px] font-black text-white whitespace-nowrap shadow-xl transition-all duration-300 group-hover:scale-105" style={{ backgroundColor: color }}>{safeStr(branch.label)}</div>
                                                                        <div className="flex flex-wrap gap-1.5 justify-center max-w-[160px] opacity-60 group-hover:opacity-100 transition-opacity">
                                                                            {kids.slice(0, 3).map((c, ci) => <span key={ci} className="text-[9px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 font-bold border border-white/5 whitespace-nowrap">{c}</span>)}
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
                                                        <div className={`flex h-full ${theme.slideBg}`}>
                                                            <div className="flex-[1.4] flex flex-col justify-center p-16 gap-8">
                                                                <div className="flex items-center gap-5"><span className="text-5xl">{emoji}</span><h2 className={`text-4xl font-black uppercase tracking-tight`} style={{ color: theme.accent }}>{title}</h2></div>
                                                                <ul className="space-y-5">{points.map((p: any, pi: number) => <li key={pi} className="flex gap-5 items-start"><div className="w-2.5 h-2.5 rounded-full mt-3 shrink-0" style={{ backgroundColor: theme.primary }} /><p className={`${theme.text} opacity-80 text-xl font-medium leading-relaxed tracking-tight`}>{p}</p></li>)}</ul>
                                                            </div>
                                                            <div className={`flex-1 ${theme.card} border-l ${theme.border} flex flex-col items-center justify-center gap-6 p-12 bg-black/5`}>
                                                                <p className={`text-[11px] font-black uppercase tracking-[0.4em] opacity-40`} style={{ color: theme.primary }}>{safeStr(visual.label) || 'TECHNICAL ANALYSIS'}</p>
                                                                <div className="w-full space-y-3">{elems.map((el, ei) => <div key={ei} className={`rounded-2xl px-6 py-4 text-xs font-bold text-center border transition-all duration-500 backdrop-blur-sm shadow-sm hover:translate-x-1`} style={{ backgroundColor: `${theme.primary}15`, borderColor: `${theme.primary}30`, color: theme.text }}>{el}</div>)}</div>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                if (layout === 'STUDIO_GRID') return (
                                                    <div className={`flex flex-col h-full p-12 gap-6 ${theme.slideBg}`}>
                                                        <div className="flex items-center gap-4"><span className="text-4xl">{emoji}</span><h2 className={`text-3xl font-black uppercase tracking-tighter`} style={{ color: theme.accent }}>{title}</h2></div>
                                                        <div className="flex-1 grid grid-cols-3 gap-5">{items.map((item: any, ii: number) => <motion.div key={ii} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: ii * 0.1 }} className={`${theme.card} rounded-3xl border ${theme.border} p-6 flex flex-col gap-3 shadow-xl`}><span className="text-3xl">{safeStr(item.emoji)}</span><p className={`text-xs font-black uppercase tracking-widest ${theme.text}`}>{safeStr(item.title)}</p><p className={`text-[11px] opacity-60 font-medium leading-relaxed ${theme.text}`}>{safeStr(item.description)}</p></motion.div>)}</div>
                                                    </div>
                                                );

                                                if (layout === 'STUDIO_TIMELINE') return (
                                                    <div className={`flex flex-col h-full p-12 gap-8 ${theme.slideBg}`}>
                                                        <div className="flex items-center gap-4"><span className="text-4xl">{emoji}</span><h2 className={`text-3xl font-black uppercase tracking-tighter`} style={{ color: theme.accent }}>{title}</h2></div>
                                                        <div className="flex-1 flex items-center relative px-4">
                                                            <div className="absolute top-[4.5rem] left-20 right-20 h-0.5 opacity-20" style={{ backgroundColor: theme.primary }} />
                                                            <div className="w-full flex justify-between">{steps.map((s: any, si: number) => <motion.div key={si} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: si * 0.12 }} className="flex-1 flex flex-col items-center gap-4 relative"><div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-base z-10 shadow-2xl transition-all duration-500" style={{ backgroundColor: theme.primary, boxShadow: `0 0 30px ${theme.primary}50` }}>{safeStr(s.step || si + 1)}</div><div className="text-center px-4"><p className={`text-[11px] font-black uppercase tracking-widest mb-1.5`} style={{ color: theme.accent }}>{safeStr(s.label)}</p><p className={`text-[10px] opacity-50 font-medium leading-relaxed ${theme.text}`}>{safeStr(s.description)}</p></div></motion.div>)}</div>
                                                        </div>
                                                    </div>
                                                );

                                                if (layout === 'STUDIO_GRAPH') return (
                                                    <div className={`flex flex-col h-full p-12 gap-10 ${theme.slideBg}`}>
                                                        <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner">{emoji}</div><h2 className={`text-3xl font-black uppercase tracking-tight`} style={{ color: theme.accent }}>{title}</h2></div>
                                                        <div className="flex-1 flex items-center justify-center">
                                                            {chartType === 'pie' ? (
                                                                <div className="relative w-96 h-96 flex items-center justify-center">
                                                                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 filter drop-shadow-2xl">
                                                                        {(() => {
                                                                            let total = values.reduce((a, b) => a + b, 0) || 1;
                                                                            let acc = 0;
                                                                            return values.map((v, i) => {
                                                                                const p = (v / total) * 100;
                                                                                const dash = `${p} ${100 - p}`;
                                                                                const offset = -acc;
                                                                                acc += p;
                                                                                return <circle key={i} cx="50" cy="50" r="35" fill="transparent" stroke={[theme.primary, theme.accent, theme.secondary, '#ec4899', '#14b8a6'][i % 5]} strokeWidth="20" strokeDasharray={dash} strokeDashoffset={offset} className="transition-all duration-1000 hover:scale-105 origin-center" />;
                                                                            });
                                                                        })()}
                                                                    </svg>
                                                                    <div className={`absolute inset-0 flex flex-col items-center justify-center ${theme.text}`}>
                                                                        <span className="text-[12px] font-black opacity-40 uppercase tracking-widest">Total</span>
                                                                        <span className="text-4xl font-black">{values.reduce((a, b) => a + b, 0).toLocaleString()}</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className={`w-full max-w-4xl h-full flex items-end gap-10 px-20 pb-16 border-l-2 border-b-2 ${theme.border} bg-white/5 rounded-bl-3xl`}>
                                                                    {values.map((v, i) => {
                                                                        const max = Math.max(...values, 1);
                                                                        const h = (v / max) * 100;
                                                                        return (
                                                                            <div key={i} className="flex-1 flex flex-col items-center gap-5 group">
                                                                                <motion.div initial={{ height: 0 }} animate={{ height: `${h}%` }} className="w-full rounded-t-2xl relative transition-all duration-700 shadow-xl" style={{ background: `linear-gradient(to top, ${theme.primary}, ${theme.primary}aa)`, boxShadow: `0 0 30px ${theme.primary}40` }}>
                                                                                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-white text-black text-[11px] font-black px-4 py-2 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100`}>{v.toLocaleString()}</div>
                                                                                </motion.div>
                                                                                <span className={`text-[11px] font-black uppercase tracking-wider whitespace-nowrap opacity-50 ${theme.text} group-hover:opacity-100 transition-all`}>{labels[i] || `Data ${i + 1}`}</span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );

                                                if (layout === 'STUDIO_DIAGRAM') return (
                                                    <div className={`flex flex-col h-full p-12 gap-10 ${theme.slideBg}`}>
                                                        <div className="flex items-center gap-5"><div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner">{emoji}</div><h2 className={`text-3xl font-black uppercase tracking-tight`} style={{ color: theme.accent }}>{title}</h2></div>
                                                        <div className="flex-1 flex flex-wrap items-center justify-center gap-x-14 gap-y-12 p-16">
                                                            {nodes.slice(0, 6).map((node, ni) => (
                                                                <React.Fragment key={ni}>
                                                                    <motion.div initial={{ scale: 0, y: 20 }} animate={{ scale: 1, y: 0 }} transition={{ delay: ni * 0.1 }} className={`px-10 py-6 rounded-3xl border-2 ${theme.card} ${theme.border} ${theme.text} text-sm font-black uppercase tracking-[0.25em] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.4)] min-w-[180px] text-center backdrop-blur-md transition-all hover:scale-105 hover:border-indigo-500/50`}>
                                                                        {node}
                                                                    </motion.div>
                                                                    {ni < nodes.length - 1 && ni % 3 !== 2 && (
                                                                        <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: ni * 0.1 + 0.2 }}>
                                                                            <ArrowRight className="w-10 h-10 opacity-30" style={{ color: theme.primary }} />
                                                                        </motion.div>
                                                                    )}
                                                                </React.Fragment>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );

                                                // STUDIO_CENTER (default)
                                                return (
                                                    <div className={`flex flex-col justify-center h-full p-16 gap-8 ${theme.slideBg}`}>
                                                        <div className="flex items-center gap-5"><span className="text-5xl">{emoji}</span><h2 className={`text-5xl font-black uppercase tracking-tighter leading-[1.1] max-w-[90%]`} style={{ color: theme.accent }}>{title}</h2></div>
                                                        {keyStat && <div className="flex items-baseline gap-4"><span className={`text-8xl font-black ${theme.text}`}>{safeStr(keyStat.value)}</span><span className={`text-lg font-bold opacity-40 uppercase tracking-[0.2em] ${theme.text}`}>{safeStr(keyStat.label)}</span></div>}
                                                        <ul className="space-y-5">{points.map((p, pi) => <motion.li key={pi} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: pi * 0.1 }} className="flex gap-6 items-start"><div className="w-2.5 h-2.5 rounded-full mt-3 shrink-0 shadow-lg" style={{ backgroundColor: theme.primary }} /><p className={`${theme.text} opacity-80 text-xl font-medium tracking-tight leading-relaxed`}>{p}</p></motion.li>)}</ul>
                                                    </div>
                                                );
                                            })()}
                                            <div className="absolute top-6 left-10 text-[9px] font-black text-indigo-500 uppercase tracking-[0.4em] opacity-30">{schoolName} // {persona}</div>
                                            <div className="absolute bottom-6 right-10 text-[9px] font-black text-white/15 tracking-[0.25em]">{activeSlide + 1} OF {slides.length}</div>
                                        </motion.div>
                                    </div>

                                    <div className={`min-h-[112px] py-4 border-t ${theme.border} ${theme.bg} flex flex-wrap items-center px-10 gap-x-12 gap-y-6 shrink-0 relative z-10 shadow-up-2xl transition-colors duration-700`}>
                                        <div className="flex items-center gap-6">
                                            <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} disabled={activeSlide === 0} className={`w-12 h-12 rounded-2xl border-2 ${theme.border} flex items-center justify-center disabled:opacity-20 hover:scale-110 active:scale-90 transition-all ${theme.text} bg-white/5`}><ChevronLeft className="w-6 h-6" /></button>
                                            <div className="flex gap-3 px-6 h-10 items-center bg-black/20 rounded-full border border-white/5 shadow-inner">
                                                {slides.map((_, i) => <button key={i} onClick={() => setActiveSlide(i)} className={`h-2 transition-all duration-500 rounded-full ${i === activeSlide ? 'w-10 bg-indigo-500' : 'w-2 bg-white/10 hover:bg-white/30 hover:w-6'}`} />)}
                                            </div>
                                            <button onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} disabled={activeSlide === slides.length - 1} className={`w-12 h-12 rounded-2xl border-2 ${theme.border} flex items-center justify-center disabled:opacity-20 hover:scale-110 active:scale-90 transition-all ${theme.text} bg-white/5`}><ChevronRight className="w-6 h-6" /></button>
                                        </div>

                                        <div className={`h-12 flex items-center bg-black/20 rounded-2xl p-1 shrink-0 border border-white/5 shadow-inner`}>
                                            <div className="px-5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 opacity-60">Design: {designMode === 'custom' ? 'Custom Brief' : 'Default Pro'}</div>
                                        </div>

                                        <div className="ml-auto flex items-center gap-6 flex-wrap justify-end">
                                            <div className="flex gap-2.5 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                                                <Button onClick={downloadPDF} className={`h-11 rounded-xl text-[10px] font-black tracking-widest px-6 shadow-lg transition-all hover:scale-105 active:scale-95 bg-indigo-500 hover:bg-indigo-600 text-white border-none`}><Download className="w-3.5 h-3.5 mr-2 opacity-80" /> PDF</Button>
                                                <Button onClick={downloadPPTX} className={`h-11 rounded-xl text-[10px] font-black tracking-widest px-6 shadow-lg transition-all hover:scale-105 active:scale-95 bg-emerald-500 hover:bg-emerald-600 text-white border-none`}><FileText className="w-3.5 h-3.5 mr-2 opacity-80" /> PPTX</Button>
                                            </div>
                                            <Button onClick={handleBuildSlides} disabled={loading} className={`h-11 rounded-xl text-[10px] font-black tracking-widest px-6 shadow-lg transition-all hover:scale-105 active:scale-95 bg-amber-500 hover:bg-amber-600 text-white border-none`}><Zap className="w-3.5 h-3.5 mr-2 opacity-80" /> REGENERATE</Button>
                                            <div className={`h-10 w-px opacity-20 hidden md:block`} style={{ backgroundColor: theme.primary }} />

                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger className={`w-52 h-12 rounded-2xl text-[10px] font-black tracking-widest border-2 shadow-sm bg-white/5 ${theme.text} ${theme.border}`}><SelectValue placeholder="CLASS TARGET" /></SelectTrigger>
                                                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name.toUpperCase()}</SelectItem>)}</SelectContent>
                                            </Select>
                                            <Button onClick={handleShare} disabled={isSharing || !selectedClass} className={`h-14 px-10 rounded-[1.25rem] bg-indigo-600 font-black text-[10px] tracking-[0.3em] shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] hover:scale-105 active:scale-95 transition-all text-white border-none`}>
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
                                <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-200/50 dark:border-white/[0.05]">
                                    <Button onClick={downloadPDF} disabled={!slides.length} variant="outline" className="rounded-2xl h-12 text-[9px] font-black tracking-widest uppercase border-2 shadow-sm gap-2">
                                        <Download className="w-3 h-3" /> PDF
                                    </Button>
                                    <Button onClick={downloadPPTX} disabled={!slides.length} variant="outline" className="rounded-2xl h-12 text-[9px] font-black tracking-widest uppercase border-2 shadow-sm gap-2">
                                        <FileText className="w-3 h-3" /> PPTX
                                    </Button>
                                </div>
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
