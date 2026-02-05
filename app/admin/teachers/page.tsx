import React, { Suspense } from 'react';
import { getTeachers } from '@/lib/actions';
import { TeachersClient } from './TeachersClient';

export default async function TeachersPage({
    searchParams
}: {
    searchParams: Promise<{ q?: string; designation?: string }> | { q?: string; designation?: string }
}) {
    // Await searchParams if it's a Promise (Next.js 15+)
    const params = searchParams instanceof Promise ? await searchParams : searchParams;

    const query = params.q || '';
    const designation = params.designation || '';
    const teachers = await getTeachers(query, designation);

    return (
        <Suspense fallback={<div className="p-6">Loading...</div>}>
            <TeachersClient teachers={teachers} />
        </Suspense>
    );
}
