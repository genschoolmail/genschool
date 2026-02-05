import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav className="flex items-center text-sm text-slate-500 dark:text-slate-400 mb-6">
            <Link
                href="/admin"
                className="flex items-center hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
                <Home className="w-4 h-4" />
            </Link>
            {items.map((item, index) => (
                <div key={index} className="flex items-center">
                    <ChevronRight className="w-4 h-4 mx-2 text-slate-400" />
                    {item.href ? (
                        <Link
                            href={item.href}
                            className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="font-medium text-slate-800 dark:text-white">
                            {item.label}
                        </span>
                    )}
                </div>
            ))}
        </nav>
    );
}
