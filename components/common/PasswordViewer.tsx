"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface PasswordViewerProps {
    password?: string | null;
    className?: string;
}

export default function PasswordViewer({ password, className = "" }: PasswordViewerProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (!password) return;
        navigator.clipboard.writeText(password);
        setIsCopied(true);
        toast.success("Password copied to clipboard");
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!password) {
        return <span className="text-slate-400 italic text-xs">Not set</span>;
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <code className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono text-slate-600 dark:text-slate-300 min-w-[80px] text-center">
                {isVisible ? password : "••••••••"}
            </code>
            <button
                type="button"
                onClick={() => setIsVisible(!isVisible)}
                className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                title={isVisible ? "Hide password" : "Show password"}
            >
                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
                type="button"
                onClick={handleCopy}
                className="p-1 text-slate-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                title="Copy password"
            >
                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
        </div>
    );
}
