import React from 'react';
import { prisma } from '@/lib/prisma';
import MarksheetManagementClient from './MarksheetClient';

export default async function BulkMarksheetsPage({
    searchParams
}: {
    searchParams: { groupId?: string; classId?: string }
}) {
    const examGroups = await prisma.examGroup.findMany({ orderBy: { order: 'asc' } });
    const classes = await prisma.class.findMany({ orderBy: { name: 'asc' } });

    return (
        <MarksheetManagementClient
            examGroups={examGroups}
            classes={classes}
        />
    );
}

function PrintTrigger() {
    'use client';
    return (
        <button
            onClick={() => window.print()}
            className="flex items-center gap-2"
        >
            <Printer className="w-4 h-4" />
            Print All
        </button>
    );
}
