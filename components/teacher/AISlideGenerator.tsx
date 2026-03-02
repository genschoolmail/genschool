'use client';

import React, { useState } from 'react';
import { shareNoteWithClass } from '@/lib/actions/ai-slides';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, FileUp, Share2, CheckCircle2, Download, Presentation } from 'lucide-react';

export default function AISlideGenerator({ classes }: { classes: any[] }) {
    const [file, setFile] = useState<File | null>(null);
    const [language, setLanguage] = useState("English");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [selectedClass, setSelectedClass] = useState("");
    const [progress, setProgress] = useState("");

    const handleUpload = async () => {
        if (!file) return toast.error("Please select a file first");

        setIsGenerating(true);
        setProgress("Uploading document...");

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('language', language);

            setProgress("AI is reading your document...");

            const response = await fetch('/api/teacher/generate-slides', {
                method: 'POST',
                body: formData
            });

            setProgress("Generating slides & PDF...");
            const data = await response.json();

            if (!response.ok || data.error) {
                toast.error(data.error || "Generation failed. Please try again.");
            } else {
                setResult(data);
                toast.success(`Generated ${data.slideData?.length || 0} slides successfully!`);
            }
        } catch (err: any) {
            toast.error("Network error: " + (err.message || "Please try again"));
        } finally {
            setIsGenerating(false);
            setProgress("");
        }
    };

    const handleShare = async () => {
        if (!selectedClass) return toast.error("Please select a class to share with");

        setIsSharing(true);
        const res = await shareNoteWithClass({
            classId: selectedClass,
            title: result.slideData[0]?.title || "New AI Lesson",
            content: result.slideData,
            fileUrl: result.fileUrl
        });
        setIsSharing(false);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success("Shared with class successfully!");
        }
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
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
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
                    onClick={handleUpload}
                    disabled={isGenerating || !file}
                    className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                >
                    {isGenerating ? (
                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {progress || "Processing..."}</>
                    ) : (
                        <><Presentation className="w-5 h-5 mr-2" /> Generate Slide Deck</>
                    )}
                </Button>
            </div>

            {/* Step 2: Result & Share */}
            {result && (
                <div className="pt-8 border-t border-slate-100 dark:border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-500/20 mb-6">
                        <div className="flex items-center gap-4">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Generation Complete</h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <a
                                        href={result.fileUrl}
                                        target="_blank"
                                        className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-1 hover:underline"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-indigo-500" />
                            Share with Students
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
                            Note: This content will be shared with all students in the selected class and will expire in 30 days.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
