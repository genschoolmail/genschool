'use client';

import React, { useState, useRef, useEffect } from 'react';
import { chatWithAITeacher } from '@/lib/actions/ai-slides';
import { Send, Loader2, User, Bot, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AITeacherChat({ noteId, noteTitle }: { noteId: string, noteTitle: string }) {
    const [messages, setMessages] = useState<{ role: 'USER' | 'AI', content: string }[]>([
        { role: 'AI', content: `Hello! I'm your AI Teacher for the lesson: **${noteTitle}**. How can I help you understand this chapter today?` }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'USER', content: userMsg }]);
        setIsLoading(true);

        const res = await chatWithAITeacher(noteId, userMsg);
        setIsLoading(false);

        if (res.response) {
            setMessages(prev => [...prev, { role: 'AI', content: res.response }]);
        } else {
            setMessages(prev => [...prev, { role: 'AI', content: "Sorry, I'm having trouble connecting to the AI brain right now. Please try again." }]);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <Bot className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">AI Learning Tutor</h3>
                        <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-orange-300" />
                            Context: {noteTitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex items-start gap-2 ${m.role === 'USER' ? 'flex-row-reverse text-right' : 'flex-row'}`}>
                            <div className={`p-2 rounded-lg shrink-0 ${m.role === 'USER' ? 'bg-indigo-100' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                {m.role === 'USER' ? <User className="w-4 h-4 text-indigo-600" /> : <Bot className="w-4 h-4 text-indigo-500" />}
                            </div>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${m.role === 'USER'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-700'
                                }`}>
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-center gap-2 text-slate-400 text-xs italic p-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            AI Teacher is thinking...
                        </div>
                    )}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex gap-2 relative">
                    <Input
                        placeholder="Ask a question about this lesson..."
                        className="rounded-xl h-12 border-none bg-white dark:bg-slate-800 shadow-inner px-4 text-sm"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="rounded-xl h-12 w-12 p-0 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 shrink-0"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                    Tip: Ask in any language! (e.g. "इसे हिंदी में समझाएं")
                </p>
            </div>
        </div>
    );
}
