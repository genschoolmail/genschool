import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    href: string;
    label?: string;
    className?: string;
}

export function BackButton({ href, label, className = '' }: BackButtonProps) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors ${className}`}
        >
            <ArrowLeft className="w-5 h-5" />
            {label && <span className="font-medium">{label}</span>}
        </Link>
    );
}
