import React from 'react';
import { prisma } from '@/lib/prisma';
import PromotionClient from './PromotionClient';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function PromotionPage() {
    const classes = await prisma.class.findMany({
        include: {
            _count: { select: { students: true } }
        },
        orderBy: [{ name: 'asc' }, { section: 'asc' }]
    });

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 p-6 pb-0">
                <Link
                    href="/admin/academics"
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <GraduationCap className="w-8 h-8 text-indigo-600" />
                        Merit-Based Promotion
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Promote students based on their final exam performance
                    </p>
                </div>
            </div>

            <PromotionClient classes={classes} />
        </div>
    );
}
