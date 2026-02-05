import React from 'react';
import { prisma } from '@/lib/prisma';
import MarksEntryClient from '@/components/MarksEntryClient';

export default async function AdminMarksEntryPage() {
    const examGroups = await prisma.examGroup.findMany({ orderBy: { order: 'asc' } });
    const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });
    const subjects = await prisma.subject.findMany({ orderBy: { name: 'asc' } });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Marks Entry</h1>
                <p className="text-slate-500 mt-1">Enter marks for any class (Admin Mode)</p>
            </div>

            <MarksEntryClient
                examGroups={examGroups}
                classes={classes}
                subjects={subjects}
                role="ADMIN"
            />
        </div>
    );
}
