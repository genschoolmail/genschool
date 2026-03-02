'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Download, MessageSquare, Clock, User, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import AITeacherChat from './AITeacherChat';
import { getAudioSummary } from '@/lib/actions/ai-slides';
import { toast } from 'sonner';

export default function StudentNoteCard({ note }: { note: any }) {
    const [isListening, setIsListening] = useState(false);

    const playAudioSummary = async () => {
        if (isListening) {
            window.speechSynthesis.cancel();
            setIsListening(false);
            return;
        }

        setIsListening(true);
        const res = await getAudioSummary(note.id);

        if (res.summary) {
            const utterance = new SpeechSynthesisUtterance(res.summary);
            utterance.onend = () => setIsListening(false);
            utterance.onerror = () => {
                setIsListening(false);
                toast.error("Audio playback error");
            };
            window.speechSynthesis.speak(utterance);
        } else {
            setIsListening(false);
            toast.error(res.error || "Failed to get audio summary");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="bg-orange-100 dark:bg-orange-500/20 p-3 rounded-2xl group-hover:scale-110 transition-transform text-2xl">
                    📚
                </div>
                <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Shared By</span>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <User className="w-3 h-3 text-indigo-500" />
                        {note.teacherName}
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-start gap-4 mb-2">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white line-clamp-1">{note.title}</h3>
                <Button
                    size="icon"
                    variant="ghost"
                    className={`rounded-full shrink-0 ${isListening ? 'text-orange-500 bg-orange-50 animate-pulse' : 'text-slate-400'}`}
                    onClick={playAudioSummary}
                >
                    {isListening ? <Loader2 className="w-5 h-5 animate-spin" /> : <Volume2 className="w-5 h-5" />}
                </Button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
                <Clock className="w-3.5 h-3.5 text-orange-500" />
                Expires {formatDistanceToNow(new Date(note.expiresAt), { addSuffix: true })}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    className="rounded-xl h-11 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold gap-2"
                    asChild
                >
                    <a href={note.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 text-indigo-600" />
                        Slides PDF
                    </a>
                </Button>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button className="rounded-xl h-11 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold gap-2 shadow-lg shadow-indigo-500/20">
                            <MessageSquare className="w-4 h-4" />
                            Ask Teacher
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] h-[600px] p-0 overflow-hidden rounded-3xl border-none">
                        <AITeacherChat noteId={note.id} noteTitle={note.title} />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
